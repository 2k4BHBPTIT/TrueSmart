import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Giả sử bạn đã có AuthContext

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Đang tải...</div>;

  // Kiểm tra nếu không có user hoặc role không phải admin
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/login" />;
};

export default AdminRoute;