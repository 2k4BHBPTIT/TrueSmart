import { useState, useEffect } from 'react';
import API from '../../api/axios'; // Điều chỉnh đường dẫn file axios của bạn cho đúng
import { Plus, Edit, Trash2, X, Building2 } from 'lucide-react';

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', contactPerson: '', phone: '', email: '', address: '', status: 'Đang hợp tác'
  });

  // 1. Kéo dữ liệu từ Backend
  const fetchSuppliers = async () => {
    try {
      const res = await API.get('/suppliers');
      setSuppliers(res.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu', error);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  // 2. Xử lý Thêm / Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/suppliers/${editingId}`, formData);
        alert('Cập nhật thành công!');
      } else {
        await API.post('/suppliers', formData);
        alert('Đã thêm nhà cung cấp!');
      }
      setShowModal(false);
      resetForm();
      fetchSuppliers(); // Tải lại bảng
    } catch (error) {
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  // 3. Xử lý Xóa
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      try {
        await API.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (error) {
        alert('Lỗi xóa dữ liệu!');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', status: 'Đang hợp tác' });
    setEditingId(null);
  };

  const openEditModal = (supplier) => {
    setFormData(supplier);
    setEditingId(supplier._id);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black uppercase flex items-center gap-2 text-gray-800 border-l-4 border-red-600 pl-4">
          <Building2 size={28} className="text-red-600" /> Quản lý Nhà cung cấp
        </h1>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-black transition-colors"
        >
          <Plus size={20} /> Thêm mới
        </button>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 font-black text-gray-700 uppercase text-sm">Tên NCC</th>
              <th className="p-4 font-black text-gray-700 uppercase text-sm">Người liên hệ</th>
              <th className="p-4 font-black text-gray-700 uppercase text-sm">Điện thoại</th>
              <th className="p-4 font-black text-gray-700 uppercase text-sm">Trạng thái</th>
              <th className="p-4 font-black text-gray-700 uppercase text-sm text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {/* THÊM DẤU ? ĐỂ PHÒNG THỦ: Tránh sập web nếu suppliers bị lỗi undefined */}
            {suppliers?.length > 0 ? (
              suppliers.map((s) => (
                <tr key={s._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-800">{s.name}</td>
                  <td className="p-4 text-gray-600">{s.contactPerson || 'N/A'}</td>
                  <td className="p-4 text-gray-600 font-bold">{s.phone}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'Đang hợp tác' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-3">
                    <button onClick={() => openEditModal(s)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-bold">Chưa có dữ liệu nhà cung cấp nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-red-600 p-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-black uppercase">{editingId ? 'Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp'}</h2>
              <button onClick={() => setShowModal(false)} className="hover:text-gray-200"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700">Tên Nhà Cung Cấp *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 border p-2.5 rounded-lg outline-none focus:border-red-600 bg-gray-50" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Người liên hệ</label>
                  <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full mt-1 border p-2.5 rounded-lg outline-none focus:border-red-600 bg-gray-50" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Điện thoại *</label>
                  <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full mt-1 border p-2.5 rounded-lg outline-none focus:border-red-600 bg-gray-50" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700">Địa chỉ</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full mt-1 border p-2.5 rounded-lg outline-none focus:border-red-600 bg-gray-50" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700">Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full mt-1 border p-2.5 rounded-lg outline-none focus:border-red-600 bg-gray-50">
                    <option value="Đang hợp tác">Đang hợp tác</option>
                    <option value="Ngừng hợp tác">Ngừng hợp tác</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200">Hủy</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg font-bold bg-red-600 text-white hover:bg-black transition-colors">
                  {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliers;