// src/pages/AboutClub.jsx
import { ShoppingBag, ShieldCheck, Truck, Star, CheckCircle, PhoneCall } from 'lucide-react';

const AboutClub = () => {
  return (
    <div className="bg-gray-50 font-sans">
      
      {/* 1. HERO BANNER - TRUE SMART */}
      <div 
        className="relative h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-wider">
            TRUE <span className="text-blue-500">SMART</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-bold max-w-2xl mx-auto mb-8">
            Cửa hàng công nghệ chất lượng cao - Nơi tìm thấy mọi thứ bạn cần cho cuộc sống hiện đại!
          </p>
          <a href="#shop" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-black uppercase transition-transform hover:scale-105">
            <ShoppingBag size={20} /> Mua Ngay
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">

        {/* 2. LĨNH VỰC KINH DOANH */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black uppercase text-gray-900 flex items-center justify-center gap-3">
              <ShoppingBag className="text-blue-600" size={32} /> Sản Phẩm Của Chúng Tôi
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="h-56 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2070&auto=format&fit=crop" alt="Điện thoại" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-gray-800 uppercase mb-2">Điện Thoại & Tablet</h3>
                <p className="text-gray-600 font-bold text-sm">Các dòng điện thoại cao cấp Apple, Samsung, Xiaomi,... với bảo hành chính hãng.</p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="h-56 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop" alt="Laptop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-gray-800 uppercase mb-2">Laptop & PC</h3>
                <p className="text-gray-600 font-bold text-sm">Laptop gaming, văn phòng, PC xây dựng từ các linh kiện chất lượng cao.</p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="h-56 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop" alt="Phụ kiện" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-gray-800 uppercase mb-2">Phụ Kiện & Âm Thanh</h3>
                <p className="text-gray-600 font-bold text-sm">Tai nghe, loa, sạc, ốp lưng từ các thương hiệu nổi tiếng như Bose, JBL, Sony.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. DỊCH VỤ CHUYÊN DỤNG */}
        <section className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black uppercase flex items-center justify-center gap-3">
              <ShieldCheck className="text-blue-500" size={32} /> Dịch Vụ Chuyên Dụng
            </h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Cột dịch vụ */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-black text-blue-500 uppercase border-b border-gray-700 pb-2 mb-4">Bảo hành & Sửa chữa</h3>
                <ul className="space-y-3 font-bold text-gray-300">
                  <li className="flex justify-between"><span>Bảo hành chính hãng</span> <span>Từ 12 - 24 tháng</span></li>
                  <li className="flex justify-between"><span>Sửa chữa nhanh chóng</span> <span>Trong 24h</span></li>
                  <li className="flex justify-between"><span>Thay thế linh kiện chính hãng</span> <span>Cam kết chất lượng</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-black text-blue-500 uppercase border-b border-gray-700 pb-2 mb-4">Giao hàng & Trả góp</h3>
                <ul className="space-y-3 font-bold text-gray-300">
                  <li className="flex justify-between"><span>Giao hàng miễn phí</span> <span>Đơn từ 500.000đ</span></li>
                  <li className="flex justify-between"><span>Trả góp 0%</span> <span>Với nhiều ngân hàng</span></li>
                </ul>
              </div>
            </div>

            {/* Cột ưu đãi */}
            <div className="bg-black/50 p-6 md:p-8 rounded-2xl border border-gray-800">
              <h3 className="text-2xl font-black text-yellow-500 uppercase mb-6 text-center">🔥 Ưu Đãi Đặc Biệt</h3>
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-yellow-500">
                  <h4 className="font-black text-lg text-white uppercase">Giảm 10% cho đơn đầu tiên</h4>
                  <p className="text-sm text-gray-400 mt-1">Áp dụng cho tất cả sản phẩm khi đăng ký thành viên.</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-blue-500">
                  <h4 className="font-black text-lg text-white uppercase">Mua 2 tặng 1 phụ kiện</h4>
                  <p className="text-sm text-gray-400 mt-1">Áp dụng cho các sản phẩm phụ kiện giá trị dưới 200.000đ.</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-red-500">
                  <h4 className="font-black text-lg text-white uppercase">Giảm giá cuối năm</h4>
                  <p className="text-sm text-gray-400 mt-1">Giảm đến 50% cho các sản phẩm selected.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. THẺ THÀNH VIÊN */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black uppercase text-gray-900 flex items-center justify-center gap-3">
              <Star className="text-blue-600" size={32} /> Đặc quyền Thành viên
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Thẻ Silver */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-300 p-8 rounded-2xl shadow-lg relative overflow-hidden border border-gray-300 transform transition-transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 bg-gray-500 text-white font-black text-xs px-4 py-1 rounded-bl-lg uppercase">Phổ biến</div>
              <h3 className="text-2xl font-black text-gray-800 uppercase mb-2">Thẻ Silver</h3>
              <p className="text-gray-600 font-bold mb-6">Tích lũy tổng chi tiêu từ 1.000.000đ</p>
              <ul className="space-y-3 font-bold text-gray-700 text-sm">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-gray-600"/> Giảm 5% giá trị đơn hàng.</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-gray-600"/> Tặng quà sinh nhật giá trị 100.000đ.</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-gray-600"/> Ưu tiên hỗ trợ khách hàng.</li>
              </ul>
            </div>

            {/* Thẻ VIP Gold */}
            <div className="bg-gradient-to-br from-yellow-100 via-yellow-300 to-yellow-500 p-8 rounded-2xl shadow-lg relative overflow-hidden transform transition-transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 bg-blue-600 text-white font-black text-xs px-4 py-1 rounded-bl-lg uppercase">Khuyên dùng</div>
              <h3 className="text-2xl font-black text-gray-900 uppercase mb-2">Thẻ VIP Gold</h3>
              <p className="text-gray-800 font-bold mb-6">Tích lũy tổng chi tiêu từ 10.000.000đ</p>
              <ul className="space-y-3 font-bold text-gray-900 text-sm">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-600"/> Giảm 15% giá trị đơn hàng vĩnh viễn.</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-600"/> Giao hàng miễn phí toàn quốc.</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-600"/> Quà sinh nhật giá trị 500.000đ.</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-600"/> Hỗ trợ kỹ thuật 24/7.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. FORM LIÊN HỆ */}
        <section id="shop" className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black uppercase text-gray-900 mb-4">Bạn cần hỗ trợ?</h2>
            <p className="text-gray-600 font-bold mb-6">
              Liên hệ ngay với chúng tôi để được tư vấn và hỗ trợ tốt nhất!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <a href="tel:0123456789" className="flex items-center gap-2 bg-blue-600 hover:bg-black text-white px-8 py-4 rounded-xl font-black uppercase transition-colors w-full sm:w-auto justify-center shadow-lg shadow-blue-600/30">
                <PhoneCall size={24} /> Gọi Hotline: 0123 456 789
              </a>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            {/* Ảnh trang trí */}
            <div className="absolute inset-0 bg-blue-600 transform translate-x-4 translate-y-4 rounded-2xl hidden md:block"></div>
            <img src="https://images.unsplash.com/photo-1556740714-a8395b3bf30f?q=80&w=2070&auto=format&fit=crop" alt="True Smart Store" className="relative z-10 w-full h-80 object-cover rounded-2xl shadow-xl" />
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutClub;
