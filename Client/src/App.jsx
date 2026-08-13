import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';import Footer from '../components/Footer';
import HomePage from '../pages/HomePage';
import Cart from '../pages/Cart';
import CategoryPage from '../pages/CategoryPage';
import CartSideBar from '../components/CartSideBar';
import ProductDetail from '../pages/ProductDetail';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';
import AdminDashboard from '../pages/admin/AdminDashBoard';
import AdminOrders from '../pages/admin/Order';
import AdminTransactions from '../pages/admin/AdminTransactions';
import AdminChat from '../pages/admin/AdminChat';
import AdminUsers from '../pages/admin/AdminUser';
import AdminInventory from '../pages/admin/Inventory';
import AdminDeals from '../pages/admin/AdminDeals';
import AdminSuppliers from '../pages/admin/AdminSuppliers';
import AdminTournaments from '../pages/admin/AdminTournaments';
import AdminAttendance from '../pages/admin/Attendance';

import HomeBuilder from '../pages/admin/HomeBuilder';
import SystemSetting from '../pages/admin/SystemSetting';
import SystemLogs from '../pages/admin/SystemLogs';

import Checkout from '../pages/Checkout';
import AboutClub from '../pages/AboutClub';
import NewsPage from '../pages/NewsPage';
import TournamentPage from '../pages/TournamentPage';
import FloatingMenu from '../components/FloatingMenu';
import LuckyWheel from '../pages/LuckyWheel';
import LuckyWidget from '../components/LuckyWidget';
import ProfileOrders from '../pages/ProfileOrder';
import ProfileVouchers from '../pages/ProfileVoucher';
import Profile from '../pages/Profile';
import LiveChat from '../components/LiveChat';
import ProfileDeposit from '../pages/ProfileDeposit';
import ScrollToTop from '../components/ScrollToTop';
import AuthPage from '../pages/AuthPage';
import PaymentReturn from '../pages/PaymentReturn';
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

function App() {
  const [products, setProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  const fetchProducts = async () => {
    try {
      const res = await API.get(`/products`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
      setProducts([]);
    }
  };

  const fetchDealProducts = async () => {
    try {
      const res = await API.get('/deals');
      const data = res?.data ?? {};
      setDealProducts(data.dealProducts || data.products || []);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu deal:", err);
      setDealProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDealProducts();
  }, []);

  // VNPay/MoMo đôi khi redirect về trang chủ kèm query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('vnp_ResponseCode') || params.has('vnp_TxnRef')) {
      navigate(`/payments/vnpay-return${location.search}`, { replace: true });
    } else if (params.has('errorCode') && params.has('orderId')) {
      navigate(`/payments/momo-return${location.search}`, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);
  const handleSearch = (e) => {
    if (e) e.preventDefault(); // Chặn load lại trang
    fetchProducts(searchTerm);
    if (searchTerm.trim()) {
      // Điều hướng sang trang search với tham số q trên URL
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
    <ScrollToTop />
    <CartSideBar />

    <main className="flex-grow"><Routes>
  {/* ===== CÁC ROUTE CỦA NGƯỜI DÙNG BÌNH THƯỜNG ===== */}
  <Route element={
    <>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} />
      <div className="flex-grow"><Outlet /></div>      <Footer />
    </>
  }>
    <Route path="/" element={<HomePage dealProducts={dealProducts} products={products} />} />
    <Route path="/search" element={<CategoryPage isSearchPage={true} />} /> 
    <Route path="/category/:slug" element={<CategoryPage />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/payments/vnpay-return" element={<PaymentReturn provider="vnpay" />} />
    <Route path="/payments/momo-return" element={<PaymentReturn provider="momo" />} />    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage />} />
    <Route path="/profile/deposit" element={<ProfileDeposit />} />
    <Route path="/vong-quay" element={<LuckyWheel />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/orders" element={<ProfileOrders />} />
    <Route path="/profile/vouchers" element={<ProfileVouchers />} />
    <Route path="/ve-chung-toi" element={<AboutClub />} />
    <Route path="/tin-tuc" element={<NewsPage />} />
    <Route path="/tournament" element={<TournamentPage />} />
  </Route>

  {/* ===== CÁC ROUTE CỦA ADMIN ===== */}
  <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="deals" element={<AdminDeals />} />
          {/* Đã sửa path cho khớp với Menu Sidebar */}
          <Route path="orders" element={<AdminOrders />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="chat" element={<AdminChat />} /> 
          <Route path="employees" element={<AdminUsers />} /> 
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="tournaments" element={<AdminTournaments />} />
          
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="home-builder" element={<HomeBuilder />} />
          <Route path="settings" element={<SystemSetting />} />
          <Route path="logs" element={<SystemLogs/> } />
        </Route>
      </Route>
</Routes>
    </main>
    {!isAdminPage && (
        <>
          <LiveChat />
          <LuckyWidget />
          <FloatingMenu />
        </>
      )}
    </div>
    );
}

function App1() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default App1;