// src/pages/admin/Order.jsx
import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Check, CheckCircle, Clock } from 'lucide-react'; // Thêm icon cho đẹp

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setError('');
      const res = await API.get('/orders');
      const data = res?.data;
      setOrders(Array.isArray(data) ? data : (data?.orders || []));
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
      setError(err?.response?.data?.msg || err?.message || 'Lỗi lấy đơn hàng');
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // HÀM 1: XÁC NHẬN ĐÃ THANH TOÁN
  const handleConfirmPayment = async (orderId) => {
    if (!window.confirm("Xác nhận đơn hàng này đã được thanh toán?")) return;
    try {
      await API.put(`/orders/${orderId}/pay`);
      fetchOrders(); 
      alert("Đã cập nhật trạng thái thanh toán!");
    } catch (err) {
      alert("Lỗi khi cập nhật thanh toán!");
      console.error(err);
    }
  };

  // HÀM 2: CẬP NHẬT TRẠNG THÁI GIAO HÀNG
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Tải lại danh sách
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái!");
      console.error(err);
    }
  };

return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6 uppercase border-l-4 border-red-600 pl-4">Quản lý Đơn hàng</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-red-100 bg-red-50 text-red-700 font-bold text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white uppercase text-xs">
              <th className="p-4 rounded-tl-xl">Khách hàng</th>
              <th className="p-4">Địa chỉ</th>
              <th className="p-4">Sản phẩm</th>
              <th className="p-4">Tổng tiền & Thanh toán</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Ngày đặt</th>
              <th className="p-4 rounded-tr-xl text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                {/* 1. Khách hàng */}
                <td className="p-4 font-bold">
                  {order.user?.name} <br/>
                  <span className="text-xs font-normal text-gray-500">{order.phone}</span>
                </td>
                
                {/* 2. Địa chỉ */}
                <td className="p-4 text-xs font-bold text-gray-700">
                  {order.shippingAddress}
                </td>
                
                {/* 3. Sản phẩm */}
                <td className="p-4 text-sm max-w-xs">
                  {order.orderItems?.map(i => (
                    <div key={i._id || i.product} className="truncate" title={i.name}>
                      • {i.name} <span className="text-red-600 font-bold">(x{i.quantity})</span>
                    </div>
                  ))}
                </td>
                
                {/* 3. Tổng tiền & TT Thanh toán gộp chung cho gọn */}
                <td className="p-4">
                  <div className="font-black text-red-600 mb-1">
                    {order.totalPrice?.toLocaleString()}đ
                  </div>
                  {order.isPaid ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded w-fit">
                      <CheckCircle size={12} /> Đã thanh toán
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded w-fit">
                      <Clock size={12} /> Chưa thanh toán
                    </span>
                  )}
                </td>

                {/* 4. Trạng thái giao hàng */}
                <td className="p-4">
                   <select 
                      value={order.status || 'Chờ xác nhận'}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      className={`text-xs font-bold p-1.5 rounded outline-none border cursor-pointer ${
                        order.status === 'Hoàn thành' ? 'bg-green-50 border-green-200 text-green-700' : 
                        order.status === 'Đã thanh toán' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                        order.status === 'Đang giao hàng' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                        order.status === 'Đã hủy' ? 'bg-red-50 border-red-200 text-red-700' : 
                        'bg-yellow-50 border-yellow-200 text-yellow-700'
                      }`}
                   >
                     <option value="Chờ xác nhận">⏳ Chờ xác nhận</option>
                     <option value="Đã thanh toán">💳 Đã thanh toán</option>
                     <option value="Đang giao hàng">🚚 Đang giao hàng</option>
                     <option value="Hoàn thành">✅ Hoàn thành</option>
                     <option value="Đã hủy">❌ Đã hủy</option>
                   </select>
                </td>
                
                {/* 5. Ngày đặt */}
                <td className="p-4 text-xs font-bold text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')} <br/>
                  <span className="text-[10px] font-normal">
                    {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                  </span>
                </td>

                {/* 6. CỘT THAO TÁC MỚI */}
                <td className="p-4 text-center">
                  {!order.isPaid && (
                    <button 
                      onClick={() => handleConfirmPayment(order._id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase px-3 py-2 rounded flex items-center gap-1 mx-auto transition-colors"
                      title="Xác nhận khách đã chuyển khoản hoặc trả tiền mặt"
                    >
                      <Check size={14} /> Xác nhận Đã Thu Tiền
                    </button>
                  )}
                </td>
              </tr>
            ))}
            
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-400 font-bold">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;