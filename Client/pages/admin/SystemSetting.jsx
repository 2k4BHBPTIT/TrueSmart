// src/pages/admin/SystemSettings.jsx
import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Settings, Save, Store, Link2, ShieldAlert, Image as ImageIcon } from 'lucide-react';

const SystemSettings = () => {
  const [formData, setFormData] = useState({
    storeName: '', hotline: '', supportEmail: '', address: '',
    logoUrl: '', faviconUrl: '',
    facebookUrl: '', zaloUrl: '', tiktokUrl: '',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lấy dữ liệu cấu hình khi load trang
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        if (res.data) setFormData(res.data);
      } catch (err) {
        console.error("Lỗi tải cài đặt:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Xử lý lưu thay đổi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/settings', formData);
      alert('Đã lưu cấu hình hệ thống thành công!');
    } catch (err) {
      alert('Lỗi khi lưu cấu hình, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) return <div className="p-10 text-center font-black text-gray-400">Đang tải cấu hình...</div>;

  return (
    <div className="p-6 font-sans min-h-[90vh] bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase text-gray-800 flex items-center gap-3 border-l-4 border-red-600 pl-4">
            <Settings className="text-red-600" size={32} /> Cài đặt hệ thống
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-2">
            Quản lý thông tin chung, logo, mạng xã hội và trạng thái website.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* BLOCK 1: THÔNG TIN CỬA HÀNG */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black uppercase text-gray-800 flex items-center gap-2 mb-6 border-b pb-3">
              <Store className="text-red-600" size={20} /> Thông tin cửa hàng
            </h2>
            <div className="space-y-4 font-bold">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Tên thương hiệu</label>
                <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Hotline</label>
                  <input type="text" name="hotline" value={formData.hotline} onChange={handleChange} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50 text-red-600 font-black" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email hỗ trợ</label>
                  <input type="email" name="supportEmail" value={formData.supportEmail} onChange={handleChange} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Địa chỉ giao dịch</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50" />
              </div>
            </div>
          </div>

          {/* BLOCK 2: MẠNG XÃ HỘI & LIÊN KẾT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black uppercase text-gray-800 flex items-center gap-2 mb-6 border-b pb-3">
              <Link2 className="text-blue-600" size={20} /> Mạng xã hội
            </h2>
            <div className="space-y-4 font-bold">
              <div>
                <label className="block text-sm text-blue-600 mb-1">Facebook Fanpage URL</label>
                <input type="text" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full border-2 border-blue-100 p-3 rounded-xl outline-none focus:border-blue-600 bg-blue-50/30" />
              </div>
              <div>
                <label className="block text-sm text-blue-500 mb-1">Zalo OA URL</label>
                <input type="text" name="zaloUrl" value={formData.zaloUrl} onChange={handleChange} placeholder="https://zalo.me/..." className="w-full border-2 border-blue-100 p-3 rounded-xl outline-none focus:border-blue-500 bg-blue-50/30" />
              </div>
              <div>
                <label className="block text-sm text-black mb-1">TikTok Channel URL</label>
                <input type="text" name="tiktokUrl" value={formData.tiktokUrl} onChange={handleChange} placeholder="https://tiktok.com/..." className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none focus:border-black bg-gray-50" />
              </div>
            </div>
          </div>

          {/* BLOCK 3: GIAO DIỆN & LOGO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black uppercase text-gray-800 flex items-center gap-2 mb-6 border-b pb-3">
              <ImageIcon className="text-purple-600" size={20} /> Giao diện hiển thị
            </h2>
            <div className="space-y-4 font-bold">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Đường dẫn Logo (URL)</label>
                <div className="flex gap-4 items-center">
                  <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="https://..." className="flex-1 border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-purple-600 bg-gray-50" />
                  {formData.logoUrl && <img src={formData.logoUrl} alt="Logo preview" className="h-10 object-contain bg-black p-1 rounded" />}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Đường dẫn Favicon (Icon trên tab trình duyệt)</label>
                <input type="text" name="faviconUrl" value={formData.faviconUrl} onChange={handleChange} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-purple-600 bg-gray-50" />
              </div>
            </div>
          </div>

          {/* BLOCK 4: BẢO TRÌ HỆ THỐNG */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 bg-red-50/30">
            <h2 className="text-xl font-black uppercase text-red-800 flex items-center gap-2 mb-6 border-b border-red-100 pb-3">
              <ShieldAlert className="text-red-600" size={20} /> Trạng thái Website
            </h2>
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100 shadow-sm">
              <div>
                <h3 className="font-black text-gray-800">Chế độ bảo trì (Maintenance Mode)</h3>
                <p className="text-xs font-bold text-gray-500 mt-1">Khi bật, website sẽ đóng lại để nâng cấp. Khách hàng không thể truy cập.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="maintenanceMode" checked={formData.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* NÚT LƯU */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white font-black px-8 py-4 rounded-xl uppercase tracking-widest hover:bg-red-600 hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : <><Save size={20} /> LƯU CẤU HÌNH</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;