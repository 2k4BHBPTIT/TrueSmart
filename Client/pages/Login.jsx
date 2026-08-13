import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import API from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/'); // Quay về trang chủ nếu đăng nhập thành công
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Gửi token của Google xuống cho Backend của bạn xử lý
      const res = await API.post('/users/google-login', {
        credential: credentialResponse.credential
      });

      // Lưu Token của X-Billiard vào localStorage và Context
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Nếu AuthContext của bạn cần gọi hàm để cập nhật state
      if (login) login(res.data.user, res.data.token);
      
      alert("Đăng nhập thành công!");
      window.location.href = '/'; // Ép tải lại trang để update toàn bộ Header

    } catch (error) {
      alert("Đăng nhập Google thất bại trên hệ thống!");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* KHUNG TRẮNG BẮT ĐẦU TỪ ĐÂY */}
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border-t-8 border-red-600">
        <h2 className="text-2xl font-black text-center mb-6 uppercase">Đăng nhập</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                   className="w-full border p-2 rounded outline-none focus:border-red-600" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Mật khẩu</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                   className="w-full border p-2 rounded outline-none focus:border-red-600" />
          </div>
          <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-black transition">
            ĐĂNG NHẬP
          </button>
        </form>

        {/* ĐƯỜNG KẺ CHIA CẮT */}
        <div className="relative flex items-center justify-center my-6">
          <span className="absolute bg-white px-4 text-sm text-gray-500 font-bold uppercase">Hoặc</span>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* NÚT GOOGLE ĐÃ ĐƯỢC CHUYỂN VÀO TRONG KHUNG TRẮNG */}
        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Login Failed');
              alert("Đăng nhập Google thất bại!");
            }}
            useOneTap 
            theme="filled_blue"
            shape="circle"
          />
        </div>

        <p className="mt-4 text-center text-sm font-bold text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="text-red-600 hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
      {/* KẾT THÚC KHUNG TRẮNG */}
    </div>
  );
};

export default Login;