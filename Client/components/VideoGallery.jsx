import { useState } from 'react';
import { PlayCircle, X, Eye, Clock } from 'lucide-react';

const VideoGallery = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  // Danh sách video đã được cập nhật ID Youtube thật để test không bị lỗi
  const videos = [
    {
      id: 1,
      title: 'Chung Kết HaNoi Open 2025',
      youtubeId: 'EMfIPClR8LA', 
      thumbnail: 'https://i.ytimg.com/vi/EMfIPClR8LA/maxresdefault.jpg',
      duration: '2:05:00',
      views: '1M',
      category: 'Giải đấu'
    },
    {
      id: 2,
      title: 'Hướng dẫn Bi a Cơ Bản',
      youtubeId: '41i7Ikj_dfc', // Đã thay bằng ID thật
      thumbnail: 'https://i.ytimg.com/vi/41i7Ikj_dfc/maxresdefault.jpg',
      duration: '11:32',
      views: '2M',
      category: 'Kỹ năng'
    },
    {
      id: 3,
      title: 'Review ngọn carbon crown cues',
      youtubeId: 'bPdXShjBB1U', // Đã thay bằng ID thật
      thumbnail: 'data:image/jpeg;base64,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',
      duration: '15:10',
      views: '8.9K',
      category: 'Review'
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex justify-between items-end mb-8 border-b-2 border-gray-100 pb-4">
          <div>
            <h2 className="text-3xl font-black uppercase text-gray-900 italic tracking-tight">
              Video <span className="text-red-600">Nổi Bật</span>
            </h2>
            <p className="text-gray-500 font-medium mt-1">Những khoảnh khắc đỉnh cao & Kỹ năng bida</p>
          </div>
          <button className="hidden md:block text-sm font-bold text-gray-600 hover:text-red-600 transition-colors uppercase tracking-wider">
            Xem tất cả &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="group cursor-pointer bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              onClick={() => setActiveVideo(video.youtubeId)}
            >
              <div className="relative aspect-video overflow-hidden bg-black">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle 
                    size={64} 
                    className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:text-red-600 transition-all duration-300 drop-shadow-lg" 
                    strokeWidth={1.5}
                  />
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                  {video.duration}
                </div>
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-sm uppercase tracking-wider shadow-md">
                  {video.category}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center text-gray-500 text-sm font-medium gap-4">
                  <span className="flex items-center gap-1.5"><Eye size={16} /> {video.views}</span>
                  <span className="flex items-center gap-1.5"><Clock size={16} /> Vừa xong</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==========================================
          MODAL: CỬA SỔ PHÁT VIDEO (ĐÃ FIX LỖI)
      ========================================== */}
      {activeVideo && (
        <div 
          // Đẩy z-index lên 100 để chắc chắn luôn đè lên thanh Header
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md"
          
          // SỬA LỖI 2: Click vào khoảng đen bên ngoài là tự đóng video
          onClick={() => setActiveVideo(null)} 
        >
          
          {/* Nút Đóng (Làm to và nổi bật hơn) */}
          <button 
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-red-500 transition-all bg-white/10 hover:bg-white/20 p-3 rounded-full z-[110]"
            title="Đóng video"
          >
            <X size={28} />
          </button>

          {/* Khung Iframe Youtube */}
          <div 
            className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 z-[105]"
            
            // Ngăn chặn việc click vào video mà lại kích hoạt lệnh đóng của cái nền đen ở trên
            onClick={(e) => e.stopPropagation()} 
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
        </div>
      )}
    </section>
  );
};

export default VideoGallery;