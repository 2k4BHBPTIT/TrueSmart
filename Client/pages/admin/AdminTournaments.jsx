import { useState, useEffect } from 'react';
import { Trophy, Users, Plus, Edit3, Trash2, X } from 'lucide-react';
import api from '../../api/axios';

const emptyForm = {
  name: '',
  description: '',
  prize: '',
  entryFee: '',
  maxPlayers: '',
  location: '',
  date: '',
  registrationDeadline: '',
  format: 'Single Elimination',
  class: 'Hạng H & I',
  status: 'upcoming',
  rules: '',
  contactPhone: '',
  contactEmail: '',
};

const AdminTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await api.get('/tournaments');
      const list = Array.isArray(res.data?.tournaments) ? res.data.tournaments : [];
      setTournaments(list);
    } catch (err) {
      console.error('Lỗi tải giải đấu:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (tournament) => {
    setEditingId(tournament._id);
    setForm({
      name: tournament.name || '',
      description: tournament.description || '',
      prize: tournament.prize ?? '',
      entryFee: tournament.entryFee ?? '',
      maxPlayers: tournament.maxPlayers ?? '',
      location: tournament.location || '',
      date: tournament.date ? tournament.date.slice(0, 10) : '',
      registrationDeadline: tournament.registrationDeadline ? tournament.registrationDeadline.slice(0, 10) : '',
      format: tournament.format || 'Single Elimination',
      class: tournament.class || 'Hạng H & I',
      status: tournament.status || 'upcoming',
      rules: tournament.rules || '',
      contactPhone: tournament.contactPhone || '',
      contactEmail: tournament.contactEmail || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        prize: Number(form.prize),
        entryFee: Number(form.entryFee),
        maxPlayers: Number(form.maxPlayers),
      };

      if (editingId) {
        await api.put(`/tournaments/${editingId}`, payload);
      } else {
        await api.post('/tournaments', payload);
      }

      setShowModal(false);
      fetchTournaments();
    } catch (err) {
      alert(err.response?.data?.msg || 'Lưu giải đấu thất bại');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xoá giải đấu này?')) return;
    try {
      await api.delete(`/tournaments/${id}`);
      fetchTournaments();
    } catch (err) {
      alert(err.response?.data?.msg || 'Xoá thất bại');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[90vh]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 border-l-4 border-red-600 pl-4">Quản lý Giải đấu</h1>
          <p className="text-sm text-gray-500 font-bold">Tạo và quản lý giải đấu</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-black transition-colors"
        >
          <Plus size={20} /> Tạo giải đấu
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-bold">Đang tải...</div>
      ) : tournaments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Chưa có giải đấu nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 font-black">
                <tr>
                  <th className="px-6 py-3">Tên giải</th>
                  <th className="px-6 py-3">Giải thưởng</th>
                  <th className="px-6 py-3">Hạng</th>
                  <th className="px-6 py-3">Ngày</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Đăng ký</th>
                  <th className="px-6 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tournaments.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-black text-gray-900">{t.name}</td>
                    <td className="px-6 py-4 font-bold text-red-600">{new Intl.NumberFormat('vi-VN').format(t.prize)}đ</td>
                    <td className="px-6 py-4">{t.class}</td>
                    <td className="px-6 py-4">{formatDate(t.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-black ${
                        t.status === 'registering' ? 'bg-green-100 text-green-700' :
                        t.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                        t.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black">{t.players?.length || 0}/{t.maxPlayers}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-2 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Sửa"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-2 rounded hover:bg-red-50 text-red-600 transition-colors"
                          title="Xoá"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">
                {editingId ? 'Chỉnh sửa giải đấu' : 'Tạo giải đấu mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Tên giải đấu *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Giải thưởng (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.prize}
                    onChange={(e) => setForm({ ...form, prize: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Phí đăng ký (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.entryFee}
                    onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Số lượng tối đa *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.maxPlayers}
                    onChange={(e) => setForm({ ...form, maxPlayers: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Địa điểm *</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Ngày thi đấu *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Hạn đăng ký</label>
                  <input
                    type="date"
                    value={form.registrationDeadline}
                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Hạng thi đấu</label>
                  <select
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="Hạng H">Hạng H</option>
                    <option value="Hạng I">Hạng I</option>
                    <option value="Hạng H & I">Hạng H & I</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Thể thức</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="Single Elimination">Single Elimination</option>
                    <option value="Double Elimination">Double Elimination</option>
                    <option value="Round Robin">Round Robin</option>
                    <option value="League">League</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="registering">Đang đăng ký</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã kết thúc</option>
                    <option value="cancelled">Đã huỷ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">Luật giải đấu</label>
                <textarea
                  value={form.rules}
                  onChange={(e) => setForm({ ...form, rules: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Hotline</label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-black hover:bg-gray-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black transition-colors"
                >
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTournaments;
