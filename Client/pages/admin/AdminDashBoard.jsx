// src/pages/admin/AdminDashBoard.jsx
import { useEffect, useState, useMemo } from 'react';
import { DollarSign, ShoppingBag, Users, Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import API from '../../api/axios';

const AdminDashboard = () => {
  // Lưu trữ dữ liệu thô gốc (Chỉ gọi API 1 lần)
  const [rawData, setRawData] = useState({
    orders: [],
    usersCount: 0,
    productsMap: {}
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // Bộ lọc thời gian

  // 1. TẢI DỮ LIỆU TỪ SERVER (Chỉ chạy 1 lần khi vào trang)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let orders = [];
        let usersCount = 0;
        let productsMap = {};

        // Lấy Đơn hàng
        try {
          const ordersRes = await API.get('/orders/all');
          orders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.orders || []);
        } catch (err) { console.error("Lỗi lấy đơn hàng:", err); }

        // Lấy Người dùng
        try {
          const usersRes = await API.get('/users/all');
          usersCount = Array.isArray(usersRes.data) ? usersRes.data.length : 0;
        } catch (err) { console.error("Lỗi lấy người dùng:", err); }

        // Lấy Sản phẩm để tính Giá Nhập (Lợi nhuận)
        try {
          const productsRes = await API.get('/products/admin/all');
          const products = Array.isArray(productsRes.data) ? productsRes.data : [];
          products.forEach(p => { productsMap[p._id] = p.importPrice || 0; });
        } catch (err) { console.error("Lỗi lấy sản phẩm:", err); }

        setRawData({ orders, usersCount, productsMap });
      } catch (error) {
        console.error("Lỗi tổng hợp dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 2. TÍNH TOÁN DỮ LIỆU BIỂU ĐỒ (Tự động chạy lại mỗi khi đổi timeRange)
  const stats = useMemo(() => {
    const { orders, usersCount, productsMap } = rawData;
    let chartData = [];
    let totalRev = 0;
    let totalProf = 0;
    const now = new Date();

    // A. Dựng khung dữ liệu rỗng theo bộ lọc thời gian
    if (timeRange === '7days') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        chartData.push({ name: d.toLocaleDateString('vi-VN').substring(0, 5), doanhThu: 0, loiNhuan: 0, donHang: 0, dateKey: d.toDateString() });
      }
    } else if (timeRange === 'this_month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        chartData.push({ name: `${i}/${now.getMonth() + 1}`, doanhThu: 0, loiNhuan: 0, donHang: 0, day: i });
      }
    } else if (timeRange === 'this_year_months') {
      for (let i = 1; i <= 12; i++) {
        chartData.push({ name: `Tháng ${i}`, doanhThu: 0, loiNhuan: 0, donHang: 0, month: i });
      }
    } else if (timeRange === 'this_year_quarters') {
      for (let i = 1; i <= 4; i++) {
        chartData.push({ name: `Quý ${i}`, doanhThu: 0, loiNhuan: 0, donHang: 0, quarter: i });
      }
    }

    // B. Đổ dữ liệu đơn hàng vào khung
    orders.forEach(order => {
      // Chỉ tính các đơn đã thanh toán hoặc đã giao
      if (!order.isPaid) return; 

      const orderDate = new Date(order.createdAt);
      const revenue = order.totalPrice || 0;
      let costOfGoods = 0;

      // Tính vốn (Giá nhập)
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          const productId = typeof item.product === 'object' ? item.product._id : item.product;
          costOfGoods += (productsMap[productId] || 0) * item.quantity;
        });
      }
      const profit = revenue - costOfGoods;

      // Phân bổ vào biểu đồ
      let targetItem = null;
      if (timeRange === '7days') {
        targetItem = chartData.find(d => d.dateKey === orderDate.toDateString());
      } else if (timeRange === 'this_month' && orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
        targetItem = chartData.find(d => d.day === orderDate.getDate());
      } else if (timeRange === 'this_year_months' && orderDate.getFullYear() === now.getFullYear()) {
        targetItem = chartData.find(d => d.month === (orderDate.getMonth() + 1));
      } else if (timeRange === 'this_year_quarters' && orderDate.getFullYear() === now.getFullYear()) {
        const q = Math.floor(orderDate.getMonth() / 3) + 1;
        targetItem = chartData.find(d => d.quarter === q);
      }

      // Cộng dồn
      if (targetItem) {
        targetItem.doanhThu += revenue;
        targetItem.loiNhuan += profit;
        targetItem.donHang += 1;
        
        // Chỉ cộng tổng doanh thu/lợi nhuận cho những dữ liệu nằm trong khung thời gian đang xem
        totalRev += revenue;
        totalProf += profit;
      }
    });

    return {
      totalRevenue: totalRev,
      totalProfit: totalProf,
      totalOrders: chartData.reduce((sum, item) => sum + item.donHang, 0), // Tổng đơn trong kỳ
      totalUsers: usersCount, // Tổng user hệ thống
      chartData
    };
  }, [rawData, timeRange]); // Tự động tính lại khi đổi timeRange

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Đang tổng hợp sổ sách kế toán...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-black text-gray-800 uppercase border-l-4 border-red-600 pl-4">Tổng quan Kinh doanh</h2>
        
        {/* NÚT CHỌN THỜI GIAN BIỂU ĐỒ */}
        <select 
          value={timeRange} 
          onChange={e => setTimeRange(e.target.value)}
          className="border-2 border-gray-200 bg-white p-2.5 rounded-lg font-bold text-sm outline-none focus:border-red-600 cursor-pointer shadow-sm transition-colors"
        >
          <option value="7days">Theo ngày (7 ngày qua)</option>
          <option value="this_month">Theo ngày (Tháng này)</option>
          <option value="this_year_months">Theo tháng (Năm nay)</option>
          <option value="this_year_quarters">Theo quý (Năm nay)</option>
        </select>
      </div>

      {/* 4 THẺ THỐNG KÊ (Hiển thị số liệu khớp với khoảng thời gian đã chọn) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Doanh Thu (Kỳ này)" value={`${stats.totalRevenue.toLocaleString()}đ`} icon={<DollarSign size={24} />} color="bg-red-600" />
        <StatCard title="Lợi Nhuận (Kỳ này)" value={`${stats.totalProfit.toLocaleString()}đ`} icon={<Wallet size={24} />} color="bg-green-600" />
        <StatCard title="Đơn Hàng (Kỳ này)" value={stats.totalOrders} icon={<ShoppingBag size={24} />} color="bg-blue-600" />
        <StatCard title="Tổng Khách Hàng" value={stats.totalUsers} icon={<Users size={24} />} color="bg-gray-800" />
      </div>

      {/* BIỂU ĐỒ KÉP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Biểu đồ Doanh thu / Lợi nhuận */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6 uppercase">Hiệu quả Tài chính</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'} />
                <Legend verticalAlign="top" height={36}/> 
                <Line name="Doanh Thu" type="monotone" dataKey="doanhThu" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line name="Lợi Nhuận" type="monotone" dataKey="loiNhuan" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Đơn hàng */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6 uppercase">Biểu đồ Đơn hàng</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar name="Số Đơn Hàng" dataKey="donHang" fill="#1f2937" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-800">{value}</h3>
    </div>
    <div className={`w-14 h-14 rounded-full ${color} text-white flex items-center justify-center shadow-lg`}>
      {icon}
    </div>
  </div>
);

export default AdminDashboard;