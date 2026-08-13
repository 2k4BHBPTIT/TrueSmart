// src/components/LuckyWidget.jsx
import { Link } from 'react-router-dom';
import { Gift, Sparkles } from 'lucide-react';

const LuckyWidget = () => {
  return (
    <Link 
      to="/vong-quay"
      className="fixed left-6 bottom-16 z-[990] group flex flex-col items-center cursor-pointer"
      title="Tham gia Quay Thưởng"
    >
      {/* Vòng sóng tỏa ra phía sau (Hiệu ứng thu hút) */}
      <div className="absolute top-2 w-14 h-14 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
      
      {/* Nút Icon chính */}
      <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-red-800 rounded-full border-4 border-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.5)] transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
        {/* Icon Hộp quà nhún nhảy */}
        <Gift size={28} className="text-yellow-300 animate-bounce" />
        
        {/* Icon Tia sáng lấp lánh */}
        <Sparkles size={16} className="absolute top-1 right-1 text-yellow-100 animate-pulse" />
      </div>
      
      {/* Nhãn chữ phía dưới */}
      <span className="mt-2 bg-gradient-to-r from-red-600 to-red-800 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg border border-red-400 tracking-wider transform transition-transform group-hover:-translate-y-1">
        Quay Thưởng
      </span>
    </Link>
  );
};

export default LuckyWidget;