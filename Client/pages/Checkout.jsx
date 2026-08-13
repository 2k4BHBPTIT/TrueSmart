import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, QrCode, MapPin, Truck, CreditCard, Wallet } from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
  const { cartItems, clearCart, checkoutItems, clearCheckout } = useContext(CartContext);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Ưu tiên dùng checkoutItems (đã chọn lọc), nếu rỗng fallback về toàn bộ cart
  const effectiveItems = (checkoutItems && checkoutItems.length > 0) ? checkoutItems : cartItems;

  // Tính totalPrice từ danh sách effectiveItems (không dùng context totalPrice vì context tính toàn bộ cart)
  const totalPrice = effectiveItems.reduce((sum, it) => {
    const p = Math.max(0, Number(it.price) || 0);
    const q = Math.max(0, Number(it.quantity) || 0);
    return sum + (p * q);
  }, 0);

  const [isOrdered, setIsOrdered] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [voucherMsg, setVoucherMsg] = useState({ text: '', type: '' });
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  useEffect(() => {
    if (isOrdered) return;
    if (!effectiveItems || effectiveItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      navigate('/cart');
    }
  }, [effectiveItems, navigate, isOrdered]);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    phone: '',
    province: '', district: '', ward: '', detail: ''
  });

  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data || []))
      .catch(err => console.error("Lỗi tải Tỉnh:", err));
  }, []);

  useEffect(() => {
    if (shippingInfo.province) {
      fetch(`https://provinces.open-api.vn/api/p/${shippingInfo.province}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []))
        .catch(err => console.error("Lỗi tải Quận:", err));
      setShippingFee(0);
    }
  }, [shippingInfo.province]);

  useEffect(() => {
    if (shippingInfo.district) {
      fetch(`https://provinces.open-api.vn/api/d/${shippingInfo.district}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || [])) 
        .catch(err => console.error("Lỗi tải Phường:", err));
    }
  }, [shippingInfo.district]);

  useEffect(() => {
    if (shippingInfo.province && shippingInfo.district && shippingInfo.ward) {
      let baseFee = 0;
      if (shippingInfo.province === '1' || shippingInfo.province === '79') {
        baseFee = 30000; 
      } else {
        baseFee = 40000; 
      }
      const totalItems = effectiveItems.reduce((sum, item) => sum + item.quantity, 0);
      if (totalItems > 2) {
        baseFee += (totalItems - 2) * 5000;
      }
      if (totalPrice >= 3000000) {
        baseFee = 0;
      }
      setShippingFee(baseFee);
    } else {
      setShippingFee(0);
    }
  }, [shippingInfo.province, shippingInfo.district, shippingInfo.ward, effectiveItems, totalPrice]);

  const safeTotalPrice = Number(totalPrice) || 0;
  const finalAmount = Math.max(0, safeTotalPrice + shippingFee - discount); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.province || !shippingInfo.district || !shippingInfo.ward) {
      return alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
    }
    if (!/^\d{10}$/.test(shippingInfo.phone)) {
      return alert('Số điện thoại phải có 10 chữ số!');
    }
    if (!effectiveItems || effectiveItems.length === 0) {
      return alert('Giỏ hàng trống!');
    }

    const invalidItems = effectiveItems.filter(item => 
      !item._id || 
      !Number.isInteger(item.quantity) || 
      item.quantity < 1 ||
      item.price == null ||
      item.price < 0
    );
    if (invalidItems.length > 0) {
      return alert('Giỏ hàng chứa sản phẩm không hợp lệ. Vui lòng kiểm tra lại!');
    }

    try {
      const provinceName = provinces.find(p => p.code === shippingInfo.province)?.name || '';
      const districtName = districts.find(d => d.code === shippingInfo.district)?.name || '';
      const wardName = wards.find(w => w.code === shippingInfo.ward)?.name || '';
      const fullAddress = `${shippingInfo.detail}, ${wardName}, ${districtName}, ${provinceName}`.trim();

      const orderData = {
        orderItems: effectiveItems,
        shippingAddress: fullAddress,
        phone: shippingInfo.phone,
        paymentMethod: paymentMethod,
        totalPrice: finalAmount,
        shippingFee: shippingFee,
        province: shippingInfo.province
      };

      if (paymentMethod === 'VNPay' || paymentMethod === 'MoMo') {
        alert(`Hệ thống đang chuyển hướng bạn sang cổng ${paymentMethod}... (Đơn hàng sẽ được tạm lưu trước khi thanh toán)`);

        // ✅ Gửi TOÀN BỘ order object lên backend để tạo ORDER trước khi redirect
        // (Không còn lỗi "user thanh toán xong không có đơn hàng trong DB")
        const payReqBody = {
          ...orderData,
          bankCode: paymentMethod
        };

        const res = await API.post('/payments/create-url', payReqBody);

        // Đánh dấu voucher đã dùng trước khi redirect (nếu có)
        if (appliedVoucher) {
          try {
            const vRes = await API.put(`/vouchers/use/${appliedVoucher}`);
            if (vRes.data.user) setUser(vRes.data.user);
          } catch (vErr) {
            console.error("Lỗi khi đánh dấu voucher đã sử dụng:", vErr);
          }
        }

        // Xóa giỏ hàng (nếu user hủy thanh toán thì phải chọn lại - trade-off chuẩn cho e-commerce)
        clearCart();
        clearCheckout();

        window.location.href = res.data.payUrl;
        return;
      }

      // COD / Ví TrueSmart: flow cũ
      const res = await API.post('/orders', orderData);

      if (appliedVoucher) {
        try {
          const vRes = await API.put(`/vouchers/use/${appliedVoucher}`);
          if (vRes.data.user) setUser(vRes.data.user);
        } catch (vErr) {
          console.error("Lỗi khi đánh dấu voucher đã sử dụng:", vErr);
        }
      }

      setOrderInfo(res.data.order);
      setIsOrdered(true); 
      clearCart();
      clearCheckout();

    } catch (err) {
      alert(`Lỗi đặt hàng: ${err?.response?.data?.msg || 'Vui lòng thử lại!'}`);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      alert('Vui lòng nhập mã voucher');
      return;
    }
    try {
      const res = await API.post('/vouchers/apply', {
        code: voucherCode,
        orderTotal: totalPrice
      });
      
      const discountAmount = Number(res.data.discount) || 0;
      setDiscount(discountAmount);
      setAppliedVoucher(res.data.voucher?.code || voucherCode);
      setVoucherMsg({ 
        text: res.data.msg || 'Áp dụng mã giảm giá thành công!', 
        type: 'success' 
      });
      setVoucherCode(''); 
    } catch (error) {
      setDiscount(0);
      setAppliedVoucher(null);
      setVoucherMsg({
        text: error.response?.data?.msg || 'Lỗi áp dụng mã',
        type: 'error'
      });
      setVoucherCode('');
    }
  };

  // =========================================================
  // GIAO DIỆN KHI ĐẶT HÀNG THÀNH CÔNG
  // =========================================================
  if (isOrdered) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-green-500">
          <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black uppercase mb-2">Đơn hàng đã được ghi nhận!</h2>
          <p className="text-gray-600 mb-6 font-bold">Mã đơn hàng: <span className="text-red-600">#{orderInfo?._id?.slice(-6).toUpperCase()}</span></p>

          <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6">
            <p className="text-green-700 font-bold">Tổng thanh toán: <span className="font-black text-xl">{orderInfo?.totalPrice?.toLocaleString()}đ</span></p>
            <p className="text-sm text-green-600 mt-1">Phương thức: {paymentMethod}</p>
          </div>

          <button onClick={() => window.location.href = '/'} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase hover:bg-red-600 transition-all">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // GIAO DIỆN THANH TOÁN (CHECKOUT FORM)
  // =========================================================
  return (
    <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-12 gap-10">
      <form id="checkout-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
        <section>
          <h2 className="text-2xl font-black uppercase border-b-2 border-red-600 pb-2 mb-6 flex items-center gap-2">
            <MapPin className="text-red-600" /> 1. Thông tin nhận hàng
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Họ và tên" value={shippingInfo.name} onChange={e => setShippingInfo({ ...shippingInfo, name: e.target.value })} className="border p-3 rounded-lg outline-none focus:border-red-600 font-bold" required />
            <input type="tel" placeholder="Số điện thoại" value={shippingInfo.phone} onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })} className="border p-3 rounded-lg outline-none focus:border-red-600 font-bold" required />          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 font-bold">
            <select
              className="border p-3 rounded-lg outline-none focus:border-red-600 bg-white"
              required
              value={shippingInfo.province}
              onChange={e => {
                setShippingInfo({ ...shippingInfo, province: e.target.value, district: '', ward: '' });
                setWards([]); 
              }}
            >
              <option value="">Chọn Tỉnh/Thành</option>
              {provinces?.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>

            <select
              className="border p-3 rounded-lg outline-none focus:border-red-600 bg-white"
              required
              value={shippingInfo.district}
              onChange={e => setShippingInfo({ ...shippingInfo, district: e.target.value, ward: '' })} 
              disabled={!shippingInfo.province}
            >
              <option value="">Chọn Quận/Huyện</option>
              {districts?.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>

            <select
              className="border p-3 rounded-lg outline-none focus:border-red-600 bg-white"
              required
              value={shippingInfo.ward}
              onChange={e => setShippingInfo({ ...shippingInfo, ward: e.target.value })}
              disabled={!shippingInfo.district}
            >
              <option value="">Chọn Phường/Xã</option>
              {wards?.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
            </select>
          </div>
          <input type="text" placeholder="Số nhà, Tên đường..." value={shippingInfo.detail} onChange={e => setShippingInfo({ ...shippingInfo, detail: e.target.value })} className="w-full border p-3 rounded-lg outline-none focus:border-red-600 font-bold" required />        </section>

          {user?.savedAddresses?.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <h3 className="text-sm font-bold text-red-800 uppercase mb-3">Sổ địa chỉ của bạn</h3>
              <div className="flex flex-wrap gap-3">
                {user.savedAddresses.map((addr, index) => (
                  <label key={index} className="cursor-pointer">
                    <input type="radio" name="addressBook" className="peer sr-only"
                      onChange={() => setShippingInfo({ 
                        ...shippingInfo, 
                        name: addr.name,
                        phone: addr.phone,
                        province: addr.province || '',
                        district: addr.district || '',
                        ward: addr.ward || '',
                        detail: addr.detail || addr.address
                      })} />
                    <div className="px-4 py-2 border-2 border-white bg-white rounded-lg shadow-sm peer-checked:border-red-600 peer-checked:bg-red-600 peer-checked:text-white transition-all">
                      <span className="font-bold block text-sm">{addr.type}</span>
                      <span className="text-xs opacity-80">{addr.phone}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

        <section>
          <h2 className="text-2xl font-black uppercase border-b-2 border-red-600 pb-2 mb-6 flex items-center gap-2">
            <CreditCard className="text-red-600" /> 2. Phương thức thanh toán
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <label className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-xl transition-all ${paymentMethod === 'VNPay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <input type="radio" name="payment" value="VNPay" onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-blue-600" />
              <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418189687.png" alt="VNPay" className="h-6" />
              <span className="font-bold text-blue-900">Ví VNPay / Thẻ ATM</span>
            </label>

            <label className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-xl transition-all ${paymentMethod === 'MoMo' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>
              <input type="radio" name="payment" value="MoMo" onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-pink-600" />
              <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-6" />
              <span className="font-bold text-pink-700">Ví MoMo</span>
            </label>

            <label className={`flex items-center justify-between cursor-pointer p-4 border-2 rounded-xl transition-all md:col-span-2 ${paymentMethod === 'Ví TrueSmart' ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="payment" value="Ví TrueSmart" onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-red-600" />
                <Wallet className="text-red-600" />
                <span className="font-bold text-red-600">Thanh toán bằng Ví TrueSmart</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-gray-500 font-bold uppercase">Số dư ví</span>
                <span className="text-sm font-black bg-white px-2 py-1 rounded border shadow-sm">{user?.walletBalance?.toLocaleString('vi-VN') || 0}đ</span>
              </div>
            </label>

            <label className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-xl transition-all md:col-span-2 ${paymentMethod === 'COD' ? 'border-gray-800 bg-gray-100' : 'border-gray-200'}`}>
              <input type="radio" name="payment" value="COD" onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-gray-800" />
              <span className="font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</span>
            </label>

          </div>
        </section>
      </form>

      {/* CỘT PHẢI: BILL (TÓM TẮT ĐƠN HÀNG) */}
      <div className="lg:col-span-5 bg-gray-50 p-6 md:p-8 rounded-2xl h-fit border shadow-sm">
        <h2 className="text-xl font-black mb-6 uppercase border-b pb-4">Đơn hàng của bạn</h2>

        <div className="space-y-4 mb-6">
          {effectiveItems.map(item => (
            <div key={item._id} className="flex gap-4">
              <img
                src={item.image?.startsWith('http') ? item.image : `http://localhost:5000/uploads/${item.image}`}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg border bg-white"
              />
              <div className="flex-1">
                <h4 className="font-bold text-sm line-clamp-2">{item.name}</h4>
                <div className="flex justify-between mt-1 text-sm">
                  <span className="text-gray-500 font-bold">Số lượng: {item.quantity}</span>
                  <span className="font-black text-red-600">{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-b py-4">
          <h3 className="font-black mb-3 uppercase text-sm text-gray-700">Mã giảm giá</h3>
          
          {appliedVoucher ? (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-green-800">{appliedVoucher}</span>
                <button
                  type="button"
                  onClick={() => {
                    setDiscount(0);
                    setAppliedVoucher(null);
                    setVoucherMsg({ text: '', type: '' });
                  }}
                  className="text-red-600 hover:text-red-800 font-bold text-sm"
                >
                  Xóa
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold">- {discount.toLocaleString()}đ</span>
                <span className="text-green-600 text-sm font-bold">(đã áp dụng)</span>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã (VD: VOUCHER200K)..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="flex-1 border p-2.5 rounded-lg outline-none focus:border-red-600 uppercase text-sm font-bold bg-white"
              />
              <button
                type="button" 
                onClick={handleApplyVoucher}
                className="bg-gray-800 text-white px-5 py-2.5 rounded-lg font-black uppercase hover:bg-red-600 transition-colors text-sm shadow-md"
              >
                Áp dụng
              </button>
            </div>
          )}

          {voucherMsg.text && (
            <p className={`text-xs mt-2 font-bold flex items-center gap-1 ${
              voucherMsg.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {voucherMsg.type === 'success' ? '✓' : '✕'} {voucherMsg.text}
            </p>
          )}
        </div>

        <div className="border-t border-b py-4 space-y-3 mb-6">
          <div className="flex justify-between text-gray-600 font-bold">
            <span>Tạm tính ({effectiveItems.length} sản phẩm)</span>
            <span>{totalPrice.toLocaleString()}đ</span>
          </div>

          {/* HIỂN THỊ PHÍ VẬN CHUYỂN */}
          <div className="flex justify-between items-center text-gray-600 font-bold">
            <span className="flex items-center gap-2"><Truck size={18} /> Phí vận chuyển (GHN)</span>
            {shippingInfo.province ? (
              shippingFee === 0 ? (
                <span className="text-green-600 font-black uppercase">Miễn phí (Freeship)</span>
              ) : (
                <span>{shippingFee.toLocaleString()}đ</span>
              )
            ) : (
              <span className="text-gray-400">Chưa tính</span>
            )}
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-200">
              <span>Giảm giá (Voucher)</span>
              <span>- {discount.toLocaleString()}đ</span>
            </div>
          )}
        </div>

        <div className="flex justify-between font-black text-2xl text-red-600 mb-8">
          <span>TỔNG CỘNG</span>
          <span>{finalAmount.toLocaleString()}đ</span>
        </div>

        <button form="checkout-form" type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-xl uppercase hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          {paymentMethod === 'VNPay' || paymentMethod === 'MoMo' ? `THANH TOÁN QUA ${paymentMethod}` : 'ĐẶT HÀNG NGAY'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;