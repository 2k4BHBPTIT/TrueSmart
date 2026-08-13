import { useState, useEffect, useContext } from 'react';
import {
  Phone, ShoppingCart, Menu, X, Search, User, MapPin, Truck,
  LogOut, Wallet, Ticket, Gift, ShoppingBag
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const Header = ({ searchTerm, setSearchTerm, handleSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const { setIsCartOpen, cartItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get('/settings').then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  const hotline = settings?.hotline || '0948.122.666';
  const isUserAdmin = user?.role === 'admin' || user?.isAdmin === true;

  // Danh mục sản phẩm công nghệ
  const categories = [
    { label: 'Điện thoại', slug: 'phones' },
    { label: 'Laptop', slug: 'laptops' },
    { label: 'Máy tính bảng', slug: 'tablets' },
    { label: 'Đồng hồ thông minh', slug: 'smartwatches' },
    { label: 'Loa & thiết bị âm thanh', slug: 'speakers' },
    { label: 'Phụ kiện', slug: 'accessories' },
  ];

  return (
    <header className="sticky top-0 z-[100] shadow-[0_10px_30px_rgba(17,24,39,0.08)]">
      <div className="bg-gradient-to-r from-[#FFD700] via-[#F5C400] to-[#FFB703]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 md:gap-4 md:px-4">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#111827] shadow-sm">
              <span className="text-lg font-black text-[#FFD700]">T</span>
            </div>
            <span className="hidden text-lg font-black tracking-tight text-gray-900 sm:block">Truesmart</span>
          </Link>

          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-gray-800 transition hover:bg-white"
            >
              <Menu size={18} />
              Danh mục
            </button>
            {isCatOpen && (
              <div className="absolute left-0 top-full z-[120] mt-1 w-52 rounded-2xl border border-gray-100 bg-white py-1 shadow-2xl">
                {categories.map(({ label, slug }) => (
                  <Link
                    key={slug}
                    to={`/category/${slug}`}
                    onClick={() => setIsCatOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-[#FFF3C4] hover:text-gray-900"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-white/80 bg-white/95 py-2 pl-4 pr-12 text-sm outline-none ring-0 focus:border-[#C28A00]"
            />
            <button type="submit" className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#111827] text-[#FFD700] transition hover:bg-[#1f2937]">
              <Search size={18} />
            </button>
          </form>

          <div className="hidden flex-shrink-0 items-center gap-1 lg:flex">
            <a href={`tel:${hotline.replace(/\./g, '')}`} className="flex min-w-[70px] flex-col items-center px-2 py-1 transition hover:opacity-80">
              <Phone size={20} className="text-gray-900" />
              <span className="mt-0.5 text-[9px] font-bold leading-tight text-gray-800 text-center">Hotline<br />{hotline}</span>
            </a>
            <button onClick={() => setIsCartOpen(true)} className="relative flex min-w-[50px] flex-col items-center px-2 py-1 transition hover:opacity-80">
              <ShoppingCart size={20} className="text-gray-900" />
              <span className="mt-0.5 text-[9px] font-bold text-gray-800">Giỏ hàng</span>
              {cartItems.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#D0021B] text-[9px] font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </button>

            {user ? (
              <div className="group relative min-w-[60px]">
                <button className="flex flex-col items-center px-2 py-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white font-bold text-xs text-[#D0021B]">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="mt-0.5 text-[9px] font-bold text-gray-800">Tài khoản</span>
                </button>
                <div className="invisible absolute right-0 top-full z-[120] mt-1 w-64 rounded-2xl border border-gray-100 bg-white p-4 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
                  <div className="mb-3 flex items-center justify-between border-b pb-3">
                    <span className="flex items-center gap-2 text-sm font-black text-gray-900"><Wallet size={16} className="text-[#D0021B]" /> Ví TrueSmart</span>
                  </div>
                  <div className="mb-3 rounded-xl bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Số dư</span>
                      <span className="text-sm font-black text-[#D0021B]">{user.walletBalance?.toLocaleString('vi-VN') || '0'}đ</span>
                    </div>
                    <button onClick={() => navigate('/profile/deposit')} className="w-full rounded-lg bg-[#D0021B] py-2 text-xs font-bold text-white transition hover:bg-gray-900">
                      + Nạp tiền
                    </button>
                  </div>
                  <ul className="space-y-1 text-xs font-bold">
                    <li><Link to="/profile/vouchers" className="flex items-center gap-2 rounded p-2 hover:bg-[#FFF3C4]"><Ticket size={14} /> Kho Voucher</Link></li>
                    <li><Link to="/vong-quay" className="flex items-center gap-2 rounded p-2 hover:bg-[#FFF3C4]"><Gift size={14} /> Quay thưởng</Link></li>
                    <li><Link to="/profile/orders" className="flex items-center gap-2 rounded p-2 hover:bg-[#FFF3C4]"><ShoppingBag size={14} /> Lịch sử mua hàng</Link></li>
                    <li><Link to="/profile" className="flex items-center gap-2 rounded p-2 hover:bg-[#FFF3C4]"><User size={14} /> Quản lý tài khoản</Link></li>
                    {isUserAdmin && (
                      <li><Link to="/admin" className="mt-2 flex items-center gap-2 rounded bg-gray-900 p-2 text-white"><User size={14} /> Admin</Link></li>
                    )}
                  </ul>
                  <button onClick={logout} className="mt-2 flex w-full items-center gap-2 p-2 text-left text-xs font-bold text-gray-500 transition hover:text-[#D0021B]">
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="flex min-w-[50px] flex-col items-center px-2 py-1 transition hover:opacity-80">
                <User size={20} className="text-gray-900" />
                <span className="mt-0.5 text-[9px] font-bold text-gray-800">Đăng nhập</span>
              </button>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(true)} className="p-2 lg:hidden">
            <Menu size={24} className="text-gray-900" />
          </button>
        </div>
      </div>

      <div className={`fixed inset-0 z-[200] bg-black/50 transition-opacity ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`} onClick={() => setIsMenuOpen(false)}>
        <div className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl transition-transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between bg-gradient-to-r from-[#FFD700] to-[#F5C400] p-4">
            <span className="font-black">MENU</span>
            <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
          </div>
          <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="border-b p-4">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border px-4 py-2 text-sm"
            />
          </form>
          <ul className="space-y-3 p-4 text-sm font-bold">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link></li>
            {categories.map(({ label, slug }) => (
              <li key={slug}><Link to={`/category/${slug}`} onClick={() => setIsMenuOpen(false)}>{label}</Link></li>
            ))}
            <li><Link to="/ve-chung-toi" onClick={() => setIsMenuOpen(false)}>Về chúng tôi</Link></li>
            <li><Link to="/tin-tuc" onClick={() => setIsMenuOpen(false)}>Tin tức</Link></li>
            <li><Link to="/vong-quay" onClick={() => setIsMenuOpen(false)} className="text-[#D0021B]">🎁 Quay thưởng</Link></li>
            {isUserAdmin && <li><Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</Link></li>}
            {!user && <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link></li>}
            {user && <li><button onClick={() => { logout(); setIsMenuOpen(false); }}>Đăng xuất</button></li>}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
