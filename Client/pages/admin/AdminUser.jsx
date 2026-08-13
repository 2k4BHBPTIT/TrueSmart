import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Edit2, Trash2, X } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    walletBalance: 0,
    luckySpins: 0
  });

  const fetchUsers = () => {
    API.get('/users/all').then(res => setUsers(res.data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await API.delete(`/users/${id}`);
        alert('Đã xóa người dùng!');
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.msg || 'Lỗi khi xóa người dùng');
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      walletBalance: user.walletBalance || 0,
      luckySpins: user.luckySpins || 0
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/users/${editingUser._id}`, formData);
      alert('Cập nhật thành công!');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.msg || 'Lỗi khi cập nhật');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black uppercase border-l-4 border-red-600 pl-4">Quản lý Người dùng</h1>
      </div>
      
      {/* Modal Chỉnh sửa */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-black uppercase mb-6 border-b pb-2">Chỉnh sửa Người dùng</h2>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Họ tên</label>
                <input 
                  type="text" 
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-black outline-none transition"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-black outline-none transition"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Vai trò</label>
                  <select 
                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-black outline-none transition appearance-none"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Số lượt quay</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-black outline-none transition"
                    value={formData.luckySpins}
                    onChange={e => setFormData({...formData, luckySpins: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Số dư ví (đ)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-black outline-none transition"
                  value={formData.walletBalance}
                  onChange={e => setFormData({...formData, walletBalance: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-black text-white py-3 rounded-xl font-black uppercase hover:bg-gray-800 transition shadow-lg shadow-black/20"
                >
                  Cập nhật
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-100 py-3 rounded-xl font-black uppercase hover:bg-gray-200 transition"
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl shadow-black/5 overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-white uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-5">Họ tên</th>
              <th className="p-5">Email</th>
              <th className="p-5">Vai trò</th>
              <th className="p-5">Số dư</th>
              <th className="p-5">Ngày gia nhập</th>
              <th className="p-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-5">
                  <div className="font-bold text-gray-900">{u.name}</div>
                </td>
                <td className="p-5 text-sm text-gray-500">{u.email}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    u.role === 'admin' 
                    ? 'bg-red-50 text-red-600 border border-red-100' 
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-5 text-sm font-black text-green-600">
                  {u.walletBalance?.toLocaleString('vi-VN')}đ
                </td>
                <td className="p-5 text-sm text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-5">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleEditClick(u)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(u._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                      title="Xóa người dùng"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="p-20 text-center text-gray-400">
            Chưa có người dùng nào trong hệ thống.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;