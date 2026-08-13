// src/pages/admin/HomeBuilder.jsx
import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { LayoutDashboard, ArrowUp, ArrowDown, Eye, EyeOff, Save, Smartphone } from 'lucide-react';

const sectionNames = {
  banner: 'Ảnh Bìa (Banner Slider)',
  flashSale: 'Chương trình Flash Sale ⚡',
  featured: 'Sản phẩm Nổi Bật',
  featuredPhones: 'Điện thoại nổi bật',
  featuredTablets: 'Máy tính bảng nổi bật',
  featuredLaptops: 'Laptop nổi bật',
  featuredRepair: 'Dịch vụ sửa chữa',
  video: 'Thư viện Video',
  brands: 'Đối tác / Thương hiệu'
};

const HomeBuilder = () => {
  const [layoutOrder, setLayoutOrder] = useState(['banner', 'flashSale', 'featured', 'featuredPhones', 'featuredTablets', 'featuredLaptops', 'featuredRepair', 'video', 'brands']);
  const [visibility, setVisibility] = useState({
    banner: true, flashSale: true, featured: true, featuredPhones: true, featuredTablets: true, featuredLaptops: true, featuredRepair: true, video: true, brands: true
  });
  const [saving, setSaving] = useState(false);

  // Kéo cấu hình từ DB
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await API.get('/settings');
        if (res.data?.layoutOrder?.length > 0) setLayoutOrder(res.data.layoutOrder);
        if (res.data?.sectionVisibility) setVisibility(res.data.sectionVisibility);
      } catch (err) { console.error(err); }
    };
    fetchLayout();
  }, []);

  // Xử lý đẩy khối lên trên
  const moveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...layoutOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setLayoutOrder(newOrder);
  };

  // Xử lý đẩy khối xuống dưới
  const moveDown = (index) => {
    if (index === layoutOrder.length - 1) return;
    const newOrder = [...layoutOrder];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setLayoutOrder(newOrder);
  };

  // Bật/Tắt hiển thị khối
  const toggleVisibility = (key) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Lưu vào Database
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put('/settings', { layoutOrder, sectionVisibility: visibility });
      alert("Đã áp dụng giao diện mới cho Trang chủ!\n" + JSON.stringify(res.data, null, 2));
    } catch (err) {
      const status = err?.response?.status || 'NETWORK';
      const msg = err?.response?.data?.msg || err.message || 'Lỗi không xác định';
      alert(`Lỗi lưu cấu hình!\nStatus: ${status}\nMessage: ${msg}\n\nChi tiết:\n${JSON.stringify(err?.response?.data || err, null, 2)}`);
      console.error('Lỗi lưu settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 font-sans min-h-[90vh] bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase text-gray-800 flex items-center gap-3 border-l-4 border-red-600 pl-4">
            <LayoutDashboard className="text-red-600" size={32} /> Thiết kế Trang Chủ (CMS)
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-2">Kéo thả, bật tắt và sắp xếp các khối hiển thị ngoài trang chủ.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-red-600 text-white font-black px-6 py-3 rounded-xl hover:bg-black transition-colors flex items-center gap-2 shadow-lg">
          <Save size={20} /> {saving ? 'ĐANG LƯU...' : 'LƯU GIAO DIỆN'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* CỘT TRÁI: BẢNG ĐIỀU KHIỂN */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="font-black uppercase text-gray-700 mb-6 flex items-center gap-2"><LayoutDashboard /> Thứ tự các khối</h2>
          <div className="space-y-3">
            {layoutOrder.map((key, index) => (
              <div key={key} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${visibility[key] ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-dashed border-gray-300 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-gray-300 w-6">{index + 1}</span>
                  <div>
                    <h3 className={`font-black text-lg ${visibility[key] ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{sectionNames[key]}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase">{key}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleVisibility(key)} className={`p-2 rounded-lg font-bold flex items-center gap-1 ${visibility[key] ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                    {visibility[key] ? <><Eye size={18}/> Hiện</> : <><EyeOff size={18}/> Ẩn</>}
                  </button>
                  <div className="flex flex-col gap-1 ml-2 border-l pl-3">
                    <button onClick={() => moveUp(index)} disabled={index === 0} className="text-gray-400 hover:text-blue-600 disabled:opacity-30"><ArrowUp size={20} /></button>
                    <button onClick={() => moveDown(index)} disabled={index === layoutOrder.length - 1} className="text-gray-400 hover:text-blue-600 disabled:opacity-30"><ArrowDown size={20} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: LIVE PREVIEW (XEM TRƯỚC) */}
        <div className="flex justify-center">
          <div className="w-[375px] h-[750px] bg-white rounded-[3rem] shadow-2xl border-[12px] border-gray-900 relative overflow-hidden flex flex-col">
            {/* Tai thỏ điện thoại */}
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-1/2 mx-auto z-10"></div>
            
            {/* Header ảo */}
            <div className="bg-red-600 text-white text-center py-4 pt-8 font-black text-xl shadow-sm z-0">
              TRUESMART
            </div>

            {/* Nội dung xem trước được map theo đúng thứ tự mảng */}
            <div className="flex-1 overflow-y-auto bg-gray-50 pb-10 space-y-4 p-4 no-scrollbar">
              {layoutOrder.map(key => {
                if (!visibility[key]) return null; // Ẩn nếu bị tắt

                // Render giao diện ảo dựa trên Key
                if (key === 'banner') return <div key={key} className="h-32 bg-gray-300 rounded-xl flex items-center justify-center font-black text-gray-500 shadow-sm">BANNER SLIDER</div>;
                if (key === 'flashSale') return <div key={key} className="p-4 bg-white border-x-4 border-red-600 rounded-xl shadow-sm"><h4 className="font-black text-red-600 mb-2 flex items-center gap-1">⚡ FLASH SALE</h4><div className="flex gap-2"><div className="w-16 h-20 bg-red-100 rounded"></div><div className="w-16 h-20 bg-red-100 rounded"></div></div></div>;
                if (key === 'featured') return <div key={key} className="p-4 bg-white rounded-xl shadow-sm"><h4 className="font-black text-gray-800 mb-2">SẢN PHẨM NỔI BẬT</h4><div className="grid grid-cols-2 gap-2"><div className="h-24 bg-gray-100 rounded"></div><div className="h-24 bg-gray-100 rounded"></div></div></div>;
                if (key === 'video') return <div key={key} className="h-40 bg-gray-800 rounded-xl flex items-center justify-center font-black text-white shadow-sm">▶ THƯ VIỆN VIDEO</div>;
                if (key === 'brands') return <div key={key} className="h-16 bg-white border rounded-xl flex items-center justify-center font-black text-gray-400 shadow-sm">ĐỐI TÁC / THƯƠNG HIỆU</div>;
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBuilder;