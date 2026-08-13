import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import OrderTracker from '../components/OrderTracker';
import ProductCard from '../components/ProductCard';
import { User, MapPin, Heart, ShoppingBag, LogOut, Plus, X, Trash2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // STATE ĐỊA CHỈ
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', province: '', district: '', ward: '', detail: '', type: 'Nhà riêng' });

  useEffect(() => {
    if (showAddressModal) {
      fetch('https://provinces.open-api.vn/api/p/').then(res => res.json()).then(data => setProvinces(data));
    }
  }, [showAddressModal]);

  useEffect(() => {
    if (newAddress.province) {
      fetch(`https://provinces.open-api.vn/api/p/${newAddress.province}?depth=2`).then(res => res.json()).then(data => setDistricts(data.districts || []));
    }
  }, [newAddress.province]);

  useEffect(() => {
    if (newAddress.district) {
      fetch(`https://provinces.open-api.vn/api/d/${newAddress.district}?depth=2`).then(res => res.json()).then(data => setWards(data.wards || []));
    }
  }, [newAddress.district]);

  const fetchMyData = async () => {
    try {
      setLoading(true);
      const [resOrders, resWishlist] = await Promise.all([API.get('/orders/mine'), API.get('/users/wishlist')]);
      setOrders(resOrders.data);
      setWishlist(resWishlist.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchMyData(); }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const pName = provinces.find(p => p.code == newAddress.province)?.name;
    const dName = districts.find(d => d.code == newAddress.district)?.name;
    const wName = wards.find(w => w.code == newAddress.ward)?.name;
    const fullAddr = `${newAddress.detail}, ${wName}, ${dName}, ${pName}`;

    try {
      // 1. Thêm biến "res" để hứng dữ liệu Backend trả về
      const res = await API.post('/users/address', { 
        name: newAddress.name, 
        phone: newAddress.phone, 
        address: fullAddr, 
        province: newAddress.province,
        district: newAddress.district,
        ward: newAddress.ward,
        detail: newAddress.detail,
        type: newAddress.type 
      });
      setShowAddressModal(false);
      
      // 2. BÊ NGUYÊN DANH SÁCH ĐỊA CHỈ MỚI GÁN VÀO STATE
      setUser({ ...user, savedAddresses: res.data.addresses });
      
      // 3. Reset lại form cho lần thêm sau
      setNewAddress({ name: '', phone: '', province: '', district: '', ward: '', detail: '', type: 'Nhà riêng' });
      
    } catch (err) { alert('Lỗi thêm địa chỉ'); }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Xóa địa chỉ này?')) return;
    try {
      const res = await API.delete(`/users/address/${id}`);
      
      // CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC
      setUser({ ...user, savedAddresses: res.data.addresses });
      
    } catch (err) { alert('Lỗi khi xóa'); }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await API.put(`/users/address/default/${id}`);
      
      // CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC
      setUser({ ...user, savedAddresses: res.data.addresses });
      
    } catch (err) { alert('Lỗi thiết lập mặc định'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* CỘT TRÁI: MENU */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border mb-4 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-red-100">
              <User size={40} className="text-gray-400" />
            </div>
            <h3 className="font-black text-xl uppercase text-gray-800">{user.name}</h3>
            <p className="text-sm font-bold text-gray-500">{user.email}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 p-4 font-bold ${activeTab === 'orders' ? 'bg-red-600 text-white' : 'hover:bg-gray-50'}`}><ShoppingBag size={20} /> Đơn hàng</button>
            <button onClick={() => setActiveTab('addresses')} className={`w-full flex items-center gap-3 p-4 font-bold ${activeTab === 'addresses' ? 'bg-red-600 text-white' : 'hover:bg-gray-50'}`}><MapPin size={20} /> Sổ địa chỉ</button>
            <button onClick={() => setActiveTab('wishlist')} className={`w-full flex items-center gap-3 p-4 font-bold ${activeTab === 'wishlist' ? 'bg-red-600 text-white' : 'hover:bg-gray-50'}`}><Heart size={20} /> Yêu thích</button>
            <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 p-4 font-bold text-red-600 hover:bg-red-50"><LogOut size={20} /> Đăng xuất</button>
          </div>
        </div>

        {/* CỘT PHẢI: NỘI DUNG */}
        <div className="md:col-span-3">
          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-2xl font-black uppercase border-b pb-4 mb-6">Đơn hàng của tôi</h2>
              {loading ? <p>Đang tải...</p> : orders.map(order => (
                <div key={order._id} className="border-2 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center border-b pb-4 mb-4 font-bold">
                    <span className="text-gray-600">Mã ĐH: #{order._id.slice(-6)}</span>
                    <span className="text-red-600 bg-red-50 px-3 py-1 rounded">{order.status}</span>
                  </div>
                  <OrderTracker status={order.status} />
                  {order.orderItems.map(item => (
                    <div key={item._id} className="flex gap-4 items-center mt-4">
                      <img src={item.image} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1"><h4 className="font-bold">{item.name}</h4><p className="text-gray-500">x{item.quantity}</p></div>
                      <span className="font-black text-red-600">{(item.price * item.quantity).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-2xl font-black uppercase">Sổ địa chỉ</h2>
                <button onClick={() => setShowAddressModal(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition-colors"><Plus size={18} /> Thêm địa chỉ</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {user.savedAddresses?.map((addr) => (
                  <div key={addr._id} className={`border-2 p-5 rounded-xl relative group transition-colors shadow-sm bg-white ${addr.isDefault ? 'border-red-600' : 'hover:border-red-400'}`}>
                    <div className="absolute top-4 right-4 flex gap-2">
                       {/* Nút mặc định (Chỉ hiện nếu chưa là mặc định) */}
                       {!addr.isDefault && (
                         <button onClick={() => handleSetDefault(addr._id)} className="text-gray-400 hover:text-green-600 transition-colors p-2 bg-gray-50 rounded-full" title="Đặt làm mặc định"><CheckCircle2 size={18}/></button>
                       )}
                       <button onClick={() => handleDeleteAddress(addr._id)} className="text-gray-400 hover:text-red-600 transition-colors p-2 bg-gray-50 rounded-full" title="Xóa"><Trash2 size={18} /></button>
                    </div>
                    {addr.isDefault && <span className="inline-block bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase mb-2">Mặc định</span>}
                    <h4 className="font-black text-lg mb-1 pr-16">{addr.name}</h4>
                    <p className="text-gray-600 font-bold mb-2">{addr.phone}</p>
                    <p className="text-sm text-gray-500 mb-4 pr-4 leading-relaxed">{addr.address}</p>
                    <span className="bg-gray-100 text-gray-600 font-bold text-xs px-3 py-1 rounded uppercase">{addr.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-2xl font-black uppercase border-b pb-4 mb-6">Yêu thích</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(product => <ProductCard key={product._id} product={product} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL THÊM ĐỊA CHỈ */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg p-8 rounded-3xl relative shadow-2xl">
            <button onClick={() => setShowAddressModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-600"><X size={28} /></button>
            <h2 className="text-2xl font-black uppercase mb-8 border-l-4 border-red-600 pl-4">Thêm địa chỉ giao hàng</h2>
            <form onSubmit={handleAddAddress} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Tên người nhận" required value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50 font-bold" />
                <input type="tel" placeholder="Số điện thoại" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50 font-bold" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select required value={newAddress.province} onChange={e => setNewAddress({...newAddress, province: e.target.value, district: '', ward: ''})} className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50 text-sm font-bold">
                  <option value="">Tỉnh/Thành</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
                <select required value={newAddress.district} disabled={!newAddress.province} onChange={e => setNewAddress({...newAddress, district: e.target.value, ward: ''})} className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50 text-sm font-bold">
                  <option value="">Quận/Huyện</option>
                  {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                </select>
                <select required value={newAddress.ward} disabled={!newAddress.district} onChange={e => setNewAddress({...newAddress, ward: e.target.value})} className="border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50 text-sm font-bold">
                  <option value="">Phường/Xã</option>
                  {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>
              <input type="text" placeholder="Số nhà, tên đường..." required value={newAddress.detail} onChange={e => setNewAddress({...newAddress, detail: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50 font-bold" />
              <div className="flex items-center gap-4">
                <span className="text-sm font-black uppercase text-gray-500">Loại:</span>
                {['Nhà riêng', 'Cơ quan', 'Club Bida'].map(t => (
                  <button key={t} type="button" onClick={() => setNewAddress({...newAddress, type: t})} className={`px-4 py-2 rounded-full text-xs font-black transition-all ${newAddress.type === t ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>{t}</button>
                ))}
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-red-600 transition-all uppercase tracking-widest mt-4 shadow-lg">Lưu địa chỉ</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;