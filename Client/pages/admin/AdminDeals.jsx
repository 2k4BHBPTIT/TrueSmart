import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Zap, Clock, Trash2, Plus } from 'lucide-react';

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ productId: '', dealPrice: '', endTime: '' });
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu Deal và Danh sách Sản phẩm để điền vào Form
  const fetchData = async () => {
    try {
      setLoading(true);
      const [dealsRes, productsRes] = await Promise.all([
        API.get('/deals/admin/all'),
        API.get('/products/admin/all') // Lấy kho hàng để admin chọn
      ]);
      setDeals(Array.isArray(dealsRes.data) ? dealsRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/deals', formData);
      alert('Tạo Deal sốc thành công!');
      setFormData({ productId: '', dealPrice: '', endTime: '' }); // Reset form
      fetchData(); // Tải lại bảng
    } catch (err) {
      alert(err.response?.data?.msg || 'Lỗi khi tạo Deal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn kết thúc sớm Deal này?')) return;
    try {
      await API.delete(`/deals/${id}`);
      fetchData();
    } catch (err) {
      alert('Lỗi khi xóa Deal');
    }
  };

  if (loading) return <div className="p-6 font-bold text-gray-500">Đang tải dữ liệu Deal...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black uppercase text-gray-800 mb-6 border-l-4 border-red-600 pl-4 flex items-center gap-2">
        <Zap className="text-red-600" /> Quản lý Flash Deal
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: FORM TẠO DEAL */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-black uppercase mb-4 text-gray-800">Tạo Deal Mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Chọn Sản Phẩm</label>
              <select 
                required
                value={formData.productId} 
                onChange={e => setFormData({...formData, productId: e.target.value})}
                className="w-full border-2 border-gray-200 p-2.5 rounded-lg outline-none focus:border-red-600 font-medium"
              >
                <option value="">-- Chọn sản phẩm trong kho --</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (Gốc: {p.price?.toLocaleString()}đ)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Giá Sốc (VNĐ)</label>
              <input 
                type="number" 
                required min="1000"
                value={formData.dealPrice} 
                onChange={e => setFormData({...formData, dealPrice: e.target.value})}
                className="w-full border-2 border-gray-200 p-2.5 rounded-lg outline-none focus:border-red-600 font-bold text-red-600"
                placeholder="Ví dụ: 99000"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Thời gian kết thúc</label>
              <input 
                type="datetime-local" 
                required 
                value={formData.endTime} 
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="w-full border-2 border-gray-200 p-2.5 rounded-lg outline-none focus:border-red-600 font-bold"
              />
            </div>

            <button type="submit" className="w-full bg-red-600 hover:bg-black text-white font-black uppercase py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 shadow-md">
              <Plus size={18} /> Lên Sàn Deal
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: DANH SÁCH DEAL ĐANG CHẠY */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white uppercase text-xs">
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Giá Deal</th>
                <th className="p-4">Hạn chót</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deals.map(deal => {
                const isExpired = new Date(deal.endTime) < new Date();
                return (
                  <tr key={deal._id} className={`hover:bg-gray-50 transition-colors ${isExpired ? 'opacity-50' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={deal.product?.image?.startsWith('http') ? deal.product.image : `http://localhost:5000/uploads/${deal.product?.image}`} 
                          alt="sp" 
                          className="w-12 h-12 rounded object-cover border" 
                        />
                        <div>
                          <p className="font-bold text-gray-800 line-clamp-1">{deal.product?.name || 'SP đã bị xóa'}</p>
                          <p className="text-xs text-gray-400 line-through">{deal.product?.price?.toLocaleString()}đ</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-black text-red-600 text-lg">
                      {deal.dealPrice?.toLocaleString()}đ
                    </td>
                    <td className="p-4">
                      {isExpired ? (
                        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded">Đã hết hạn</span>
                      ) : (
                        <div className="flex items-center gap-1 text-orange-600 font-bold text-sm">
                          <Clock size={14} /> 
                          {new Date(deal.endTime).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(deal._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                        title="Xóa Deal"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {deals.length === 0 && (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold">Chưa có Deal nào được tạo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDeals;