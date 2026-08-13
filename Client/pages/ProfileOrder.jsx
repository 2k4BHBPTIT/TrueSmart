// src/pages/ProfileOrders.jsx
import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Package, Clock, Truck, CheckCircle, XCircle, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ProfileOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await API.get('/orders/mine');
        setOrders(res.data);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('orderId');

    if (paymentStatus !== 'success' && paymentStatus !== 'failed') {
      return undefined;
    }

    const title = paymentStatus === 'success' ? 'Thanh toán thành công' : 'Thanh toán thất bại';
    const description = paymentStatus === 'success'
      ? `Đơn hàng${orderId ? ` #${orderId}` : ''} đã được xác nhận.`
      : `Đơn hàng${orderId ? ` #${orderId}` : ''} chưa được thanh toán thành công. Vui lòng thử lại.`;

    setToast({ type: paymentStatus === 'success' ? 'success' : 'error', title, description });
    navigate(location.pathname, { replace: true });

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [location.search, location.pathname, navigate]);

  // Hàm chọn màu và icon cho từng trạng thái
  const getStatusUI = (status) => {
    switch(status) {
      case 'Chờ xác nhận': return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <Clock size={16}/> };
      case 'Đang giao hàng': return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Truck size={16}/> };
      case 'Hoàn thành': return { color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCircle size={16}/> };
      case 'Đã thanh toán': return { color: 'text-green-600 bg-green-50 border-green-300 shadow-sm', icon: <CheckCircle size={16}/> };
      case 'Đã hủy': return { color: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle size={16}/> };
      default: return { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: <Package size={16}/> };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 min-h-[60vh]">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 max-w-sm rounded-2xl border px-4 py-3 shadow-lg ${toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}
        >
          <div className="flex items-start gap-3">
            {toast.type === 'success' ? <CheckCircle size={18} className="mt-0.5" /> : <XCircle size={18} className="mt-0.5" />}
            <div>
              <p className="font-black uppercase text-sm">{toast.title}</p>
              <p className="text-sm font-semibold">{toast.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8 border-b-4 border-red-600 pb-2 w-fit">
        <Package size={32} className="text-red-600" />
        <h1 className="text-3xl font-black uppercase text-gray-900">Lịch Sử Mua Hàng</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-gray-500">Đang tải dữ liệu...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-800 uppercase mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500 font-bold mb-6">Bạn chưa thực hiện giao dịch nào trên hệ thống.</p>
          <Link to="/" className="bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase hover:bg-black transition-colors">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const ui = getStatusUI(order.status);
            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Tiêu đề Box Đơn hàng */}
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Mã đơn hàng</span>
                    <span className="font-black text-red-600">#{order._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Ngày đặt</span>
                    <span className="font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Tổng tiền</span>
                    <span className="font-black text-lg text-gray-900">{order.totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-sm uppercase ${ui.color}`}>
                    {ui.icon} {order.status || 'Chờ xác nhận'}
                  </div>
                </div>

                {/* Danh sách sản phẩm trong Đơn hàng */}
                <div className="p-6">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 py-3 border-b last:border-0 border-dashed border-gray-200">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border" />
                      <div className="flex-1">
                        <h4 className="font-black text-gray-800 line-clamp-1">{item.name}</h4>
                        <div className="text-sm font-bold text-gray-500 mt-1">
                          Số lượng: <span className="text-red-600">x{item.quantity}</span> 
                          <span className="mx-2">|</span> 
                          Đơn giá: {item.price.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileOrders;