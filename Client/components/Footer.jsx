import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert('Đăng ký nhận tin thành công!');
      setEmail('');
    }
  };

  return (
    <footer className="mt-10 border-t border-yellow-200/70 bg-[#111827] text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <div className="mb-5 rounded-[24px] border border-yellow-200/20 bg-gradient-to-r from-[#111827] via-[#1f2937] to-[#111827] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)] md:flex md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FFD700]">Đăng ký nhận tin</p>
            <p className="mt-1 text-sm text-gray-300">Nhận ưu đãi độc quyền và sản phẩm mới mỗi tuần.</p>
          </div>
          <form onSubmit={handleSubscribe} className="mt-3 flex w-full flex-col gap-2 md:mt-0 md:max-w-xl md:flex-row">
            <input
              type="email"
              placeholder="Nhập địa chỉ Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full border border-gray-700 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-400 focus:border-[#FFD700]"
            />
            <button type="submit" className="rounded-full bg-[#FFD700] px-6 py-2.5 text-sm font-black text-gray-900 transition hover:bg-[#F5C400]">
              GỬI
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 inline-block border-b-2 border-[#FFD700] pb-2 text-sm font-black uppercase">Hệ thống cửa hàng</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li>Tel hỗ trợ: <strong className="text-white">0948.122.666</strong></li>
              <li>Thời gian phục vụ: 08:30 – 21:00 hàng ngày</li>
              <li>Email: Truesmartphone@gmail.com</li>
            </ul>
            <Link to="/ve-chung-toi" className="mt-4 inline-block rounded-full border border-[#FFD700]/40 px-4 py-2 text-sm font-semibold text-[#FFD700] transition hover:bg-[#FFD700] hover:text-gray-900">
              Hệ Thống Cửa Hàng
            </Link>
          </div>

          <div>
            <h3 className="mb-3 inline-block border-b-2 border-[#FFD700] pb-2 text-sm font-black uppercase">Về công ty</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {['Giới thiệu về TrueSmart', 'Công trình đã thực hiện', 'Sơ đồ chỉ đường', 'Đào tạo - Dạy nghề'].map((item) => (
                <li key={item}><Link to="/ve-chung-toi" className="transition hover:text-[#FFD700]">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 inline-block border-b-2 border-[#FFD700] pb-2 text-sm font-black uppercase">Chính sách quy định</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {['Bảo mật thông tin', 'Chính sách bảo hành', 'Chính sách vận chuyển', 'Chính sách đổi trả', 'Mua hàng và thanh toán', 'Mua hàng trả góp', 'Phản ánh khiếu nại'].map((item) => (
                <li key={item}><Link to="/ve-chung-toi" className="transition hover:text-[#FFD700]">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 inline-block border-b-2 border-[#FFD700] pb-2 text-sm font-black uppercase">Danh mục dịch vụ</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {[
                { label: 'Điện thoại', slug: 'phones' },
                { label: 'iPad', slug: 'tablets' },
                { label: 'Đồng Hồ', slug: 'smartwatches' },
                { label: 'Âm Thanh', slug: 'speakers' },
                { label: 'Phụ kiện', slug: 'accessories' },
                { label: 'Macbook', slug: 'laptops' },
                { label: 'Sửa chữa điện thoại', slug: 'repair' },
              ].map(({ label, slug }) => (
                <li key={slug}><Link to={`/category/${slug}`} className="transition hover:text-[#FFD700]">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6 mt-8 flex justify-center gap-3">
          {[
            { icon: Facebook, href: 'https://facebook.com', color: 'bg-blue-600' },
            { icon: Youtube, href: 'https://youtube.com', color: 'bg-red-600' },
            { icon: Instagram, href: 'https://instagram.com', color: 'bg-pink-600' },
          ].map(({ icon: Icon, href, color }, i) => (
            <a key={i} href={href} target="_blank" rel="noreferrer" className={`flex h-9 w-9 items-center justify-center rounded-full ${color} transition hover:opacity-80`}>
              <Icon size={16} />
            </a>
          ))}
        </div>

        <p className="mx-auto max-w-4xl text-center text-xs leading-relaxed text-gray-400">
          Truesmart - Hệ Thống Bán Lẻ & Sửa Chữa Điện Thoại, Laptop, Phụ Kiện Chính Hãng | Giá Rẻ, Trả Góp 0%
        </p>
      </div>
    </footer>
  );
};

export default Footer;
