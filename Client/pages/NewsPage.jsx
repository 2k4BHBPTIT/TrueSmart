import { Clock, User, ArrowRight, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewsPage = () => {
  const featuredPost = {
    id: 1,
    title: "iPhone 16 ra mắt: Cải tiến lớn về camera và hiệu năng chip A18",
    excerpt: "Apple vừa chính thức ra mắt thế hệ iPhone 16 với nhiều nâng cấp đáng chú ý. Chip A18 mang lại hiệu năng mượt mà, trong khi hệ thống camera được tối ưu cho chất lượng ảnh thiếu sáng tốt hơn...",
    image: "https://images.unsplash.com/photo-1505741803423-9bebe7d1d38a?q=80&w=2000&auto=format&fit=crop",
    author: "TrueSmart Tech",
    date: "13/08/2025",
    category: "Công nghệ"
  };

  const recentPosts = [
    {
      id: 2,
      title: "Samsung Galaxy Tab S10: Máy tính bảng đột phá với màn hình 14.6 inch",
      image: "https://images.unsplash.com/photo-1586952123734-453db08431ae?q=80&w=2070&auto=format&fit=crop",
      date: "10/08/2025",
      category: "Máy tính bảng"
    },
    {
      id: 3,
      title: "MacBook Air M4: Siêu mỏn, siêu nhẹ với thời lượng pin lên tới 18 tiếng",
      image: "https://images.unsplash.com/photo-1517048598203-2e3b3b0f3b3f?q=80&w=2070&auto=format&fit=crop",
      date: "08/08/2025",
      category: "Laptop"
    },
    {
      id: 4,
      title: "Apple Watch Series 10: Theo dõi sức khỏe thể trọng mới lạ",
      image: "https://images.unsplash.com/photo-1547673847-ad4b7ab4d3d0?q=80&w=2070&auto=format&fit=crop",
      date: "05/08/2025",
      category: "Đồng hồ thông minh"
    },
    {
      id: 5,
      title: "Loa Bluetooth JBL Charge 6 về Việt Nam: Âm thanh bass mạnh mẽ",
      image: "https://images.unsplash.com/photo-1585728994791-f0c3a4a0f6c4?q=80&w=2070&auto=format&fit=crop",
      date: "03/08/2025",
      category: "Âm thanh"
    }
  ];

  const trendingNews = [
    "Đánh giá Samsung Galaxy S25 Ultra: Nhiên liệu chụn hàng không gian?",
    "Laptop gaming MSI ra mắt với card đồ họa RTX 5090 mới",
    "Top 5 phụ kiện iPhone hot nhất tháng 8",
    "Tai nghe không dây AirPods Pro 3: Cải thiện khả năng khử ồn"
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-16">
      {/* Tiêu đề trang */}
      <div className="bg-gray-900 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black uppercase tracking-wider mb-4">
            TRUESMART <span className="text-red-600">NEWS</span>
          </h1>
          <p className="text-gray-400 font-bold max-w-2xl mx-auto">
            Cập nhật tin tức công nghệ, đánh giá sản phẩm và khuyến mãi mới nhất tại TrueSmart.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: BÀI NỔI BẬT & DANH SÁCH TIN MỚI */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Bài viết nổi bật */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group cursor-pointer">
            <div className="relative h-80 overflow-hidden">
              <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-black uppercase px-3 py-1 rounded-sm shadow-lg">
                {featuredPost.category}
              </span>
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 group-hover:text-red-600 transition-colors leading-tight">
                {featuredPost.title}
              </h2>
              <p className="text-gray-600 font-medium mb-6 line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between border-t pt-4 text-sm font-bold text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><User size={16} /> {featuredPost.author}</span>
                  <span className="flex items-center gap-1"><Clock size={16} /> {featuredPost.date}</span>
                </div>
                <button className="text-red-600 flex items-center gap-1 hover:text-red-800 uppercase text-xs">
                  Đọc tiếp <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Danh sách bài viết mới */}
          <div>
            <h3 className="text-xl font-black uppercase text-gray-900 border-l-4 border-red-600 pl-3 mb-6">
              Tin tức mới nhất
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition-all flex flex-col">
                  <div className="h-48 overflow-hidden relative flex-shrink-0">
                    <span className="absolute bottom-2 left-2 z-10 bg-black/70 text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-black text-gray-800 line-clamp-3 mb-3 group-hover:text-red-600 transition-colors leading-snug text-base">
                      {post.title}
                    </h4>
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                      <Clock size={12} /> {post.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Phân trang */}
          <div className="flex justify-center gap-2 pt-6">
            <button className="px-4 py-2 bg-red-600 text-white font-black rounded hover:bg-red-700 transition-colors">1</button>
            <button className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-600 font-black rounded hover:border-red-600 hover:text-red-600 transition-colors">2</button>
            <button className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-600 font-black rounded hover:border-red-600 hover:text-red-600 transition-colors">3</button>
          </div>
        </div>

        {/* CỘT PHẢI: XU HƯỚNG & DANH MỤC */}
        <div className="space-y-8">
          
          {/* Block Tin xu hưởng */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-black uppercase text-gray-900 flex items-center gap-2 mb-6 border-b pb-3">
              <TrendingUp className="text-red-600" size={20} /> Đọc nhiều nhất
            </h3>
            <ul className="space-y-4">
              {trendingNews.map((news, index) => (
                <li key={index} className="flex gap-4 group cursor-pointer items-start">
                  <span className="text-3xl font-black text-gray-200 group-hover:text-red-200 transition-colors leading-none">
                    0{index + 1}
                  </span>
                  <p className="font-bold text-sm text-gray-700 group-hover:text-red-600 transition-colors leading-snug">
                    {news}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Block Danh mục */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-black uppercase text-gray-900 mb-6 border-b pb-3">
              Chuyên mục
            </h3>
            <ul className="space-y-3 font-bold text-gray-600 text-sm">
              <li className="flex justify-between items-center cursor-pointer hover:text-red-600 transition-colors group">
                <span className="flex items-center gap-2"><ChevronRight size={16} className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" /> Điện thoại</span>
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs group-hover:bg-red-50 group-hover:text-red-600 transition-colors">24</span>
              </li>
              <li className="flex justify-between items-center cursor-pointer hover:text-red-600 transition-colors group">
                <span className="flex items-center gap-2"><ChevronRight size={16} className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" /> Laptop</span>
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs group-hover:bg-red-50 group-hover:text-red-600 transition-colors">15</span>
              </li>
              <li className="flex justify-between items-center cursor-pointer hover:text-red-600 transition-colors group">
                <span className="flex items-center gap-2"><ChevronRight size={16} className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" /> Máy tính bảng</span>
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs group-hover:bg-red-50 group-hover:text-red-600 transition-colors">18</span>
              </li>
              <li className="flex justify-between items-center cursor-pointer hover:text-red-600 transition-colors group">
                <span className="flex items-center gap-2"><ChevronRight size={16} className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" /> Đồng hồ thông minh</span>
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs group-hover:bg-red-50 group-hover:text-red-600 transition-colors">35</span>
              </li>
              <li className="flex justify-between items-center cursor-pointer hover:text-red-600 transition-colors group">
                <span className="flex items-center gap-2"><ChevronRight size={16} className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" /> Phụ kiện</span>
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs group-hover:bg-red-50 group-hover:text-red-600 transition-colors">12</span>
              </li>
            </ul>
          </div>

          {/* Banner Quảng cáo */}
          <div className="rounded-2xl overflow-hidden relative h-64 shadow-sm group cursor-pointer border border-gray-100">
            <img src="https://images.unsplash.com/photo-1523968402248-9e32480e3e7d?q80&w=2070&auto=format&fit=crop" alt="Banner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 to-transparent flex flex-col justify-end p-6">
              <h4 className="text-white font-black uppercase text-xl mb-1">Flash Sale 8.8</h4>
              <p className="text-red-100 text-sm font-bold mb-3">Giảm đến 30% cho toàn bộ điện thoại và laptop</p>
              <Link to="/category/phones" className="bg-white text-red-600 font-black text-xs uppercase py-2 px-4 rounded w-fit hover:bg-black hover:text-white transition-colors">Mua ngay</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewsPage;
