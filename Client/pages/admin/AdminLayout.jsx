import { useState, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Users, CalendarClock, Settings, LogOut, Menu, Wallet, Trophy
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../src/assets/logo.svg';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

    // Đảm bảo các path này TRÙNG KHỚP với Route trong App.jsx
    const menuItems = [
      { path: '/admin', name: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
      { path: '/admin/inventory', name: 'Quản lý Kho', icon: <Package size={20} /> },
      { path: '/admin/deals', name: 'Quản lý Flash Sale', icon: <Package size={20} /> },
      { path: '/admin/orders', name: 'Quản lý Đơn hàng', icon: <ShoppingCart size={20} /> },
      { path: '/admin/transactions', name: 'Duyệt Nạp Tiền', icon: <Wallet size={20} /> },
      { path: '/admin/chat', name: 'Hòm Thư', icon: <Package size={20} /> },
      { path: '/admin/employees', name: 'Người dùng', icon: <Users size={20} /> },
      { path: '/admin/suppliers', name: 'Quản lý Nhà cung cấp', icon: <Package size={20} /> },
      { path: '/admin/tournaments', name: 'Quản lý Giải đấu', icon: <Trophy size={20} /> },
      { path: '/admin/attendance', name: 'Chấm công', icon: <CalendarClock size={20} /> },
      { path: '/admin/settings', name: 'Cài đặt hệ thống', icon: <Settings size={20} /> },
      { path: '/admin/home-builder', name: 'Giao diện trang chủ', icon: <LayoutDashboard size={20} />},
      { path: '/admin/logs', name: 'Lịch sử hệ thống', icon: <CalendarClock size={20} /> },
    ];

  const handleLogout = () => {
    logout();
    navigate('/'); // Đẩy về trang đăng nhập sau khi thoát
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className={`bg-gray-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="TrueSmart" className="h-10 w-10 rounded-md" />
            {isSidebarOpen && (
              <h1 className={`font-black text-[#D0021B] transition-all ${isSidebarOpen ? 'text-2xl' : 'text-sm'}`}>
                TrueSmart Admin
              </h1>
            )}
          </Link>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                title={!isSidebarOpen ? item.name : ""}
              >
                {item.icon}
                {isSidebarOpen && <span className="font-bold whitespace-nowrap">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Nút đăng xuất dưới cùng của Sidebar */}
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-red-500 w-full px-3 py-2">
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-bold">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER ADMIN */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-700 hidden md:block">Xin chào{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</span>
              {/* Hiển thị chữ viết tắt từ tên user nếu có, ngược lại dùng TS */}
              <div className="w-9 h-9 rounded-full bg-red-100 border-2 border-red-600 flex items-center justify-center text-red-600 font-black text-xs">
                {(() => {
                  try { return (user && user.name) ? user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'TS'; } catch (e) { return 'TS'; }
                })()}
              </div>
            </div>
          </div>
        </header>

        {/* KHU VỰC HIỂN THỊ CÁC COMPONENT CON (Đơn hàng, Nhân sự...) */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;