import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import API from '../api/axios';

const AuthPage = () => {
  // THAY ĐỔI LỚN NHẤT: Dùng biến 'view' để quản lý 3 màn hình khác nhau
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Thêm state báo thành công màu xanh
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (view === 'login') {
        // XỬ LÝ ĐĂNG NHẬP
        await login(formData.email, formData.password);
        navigate('/');
      } 
      else if (view === 'register') {
        // XỬ LÝ ĐĂNG KÝ
        if (formData.name.trim().length < 2) throw new Error('Họ tên phải có ít nhất 2 ký tự!');
        if (formData.name.trim().length > 50) throw new Error('Họ tên không được quá 50 ký tự!');
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.name.trim())) throw new Error('Họ tên chỉ được chứa chữ cái và khoảng trắng!');
        if (formData.password.length < 6) throw new Error('Mật khẩu tối thiểu 6 ký tự!');
        if (formData.password !== formData.confirmPassword) throw new Error('Mật khẩu xác nhận không khớp!');
        
        await register(formData.name, formData.email, formData.password);
        setSuccess('Đăng ký thành công! Hãy đăng nhập nhé.');
        setView('login');
      } 
      else if (view === 'forgot') {
        // XỬ LÝ QUÊN MẬT KHẨU
        if (!formData.email) throw new Error('Vui lòng nhập Email của bạn!');
        
        // Gọi API gửi mã về Email
        await API.post('/users/forgot-password', { email: formData.email });
        setSuccess(`Mã khôi phục đã được gửi tới ${formData.email}. Vui lòng kiểm tra hộp thư!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await API.post('/users/google-login', { credential: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (login) login(res.data.user, res.data.token);
      window.location.href = '/'; 
    } catch (error) {
      setError("Đăng nhập Google thất bại trên hệ thống!");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4 relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595859703010-090906803264?q=80&w=2000&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.2)] transition-all duration-500">
        
        {/* NÚT QUAY LẠI (Chỉ hiện ở màn hình Quên mật khẩu) */}
        {view === 'forgot' && (
          <button 
            onClick={() => { setView('login'); setError(''); setSuccess(''); }} 
            className="absolute top-6 left-6 text-gray-400 hover:text-white font-bold flex items-center gap-1 transition-colors"
          >
            &#8592; Quay lại
          </button>
        )}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">
            {view === 'login' ? 'Đăng Nhập' : view === 'register' ? 'Tạo Tài Khoản' : 'Khôi Phục'}
          </h2>
          <p className="text-gray-300 mt-2 font-bold text-sm">
            {view === 'forgot' ? 'Nhập email để nhận mã khôi phục mật khẩu' : 'Hệ thống X-Billiard toàn quốc'}
          </p>
        </div>

        {/* HIỂN THỊ LỖI (Đỏ) */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm font-bold mb-6 text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* HIỂN THỊ THÀNH CÔNG (Xanh lá) */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl text-sm font-bold mb-6 text-center backdrop-blur-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* TRƯỜNG: HỌ TÊN (Chỉ hiện khi Đăng ký) */}
          {view === 'register' && (
            <div>
              <input type="text" name="name" required placeholder="Họ và tên" value={formData.name} onChange={handleChange} 
                className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-400 p-3.5 rounded-xl outline-none focus:border-red-500 focus:bg-black/50 transition-all font-medium" />
            </div>
          )}

          {/* TRƯỜNG: EMAIL (Hiện ở mọi màn hình) */}
          <div>
            <input type="email" name="email" required placeholder="Địa chỉ Email" value={formData.email} onChange={handleChange} 
              className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-400 p-3.5 rounded-xl outline-none focus:border-red-500 focus:bg-black/50 transition-all font-medium" />
          </div>
          
          {/* TRƯỜNG: MẬT KHẨU (Ẩn khi Quên mật khẩu) */}
          {view !== 'forgot' && (
            <div>
              <input type="password" name="password" required placeholder="Mật khẩu" value={formData.password} onChange={handleChange} 
                className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-400 p-3.5 rounded-xl outline-none focus:border-red-500 focus:bg-black/50 transition-all font-medium" />
            </div>
          )}

          {/* TRƯỜNG: XÁC NHẬN MẬT KHẨU (Chỉ hiện khi Đăng ký) */}
          {view === 'register' && (
            <div>
              <input type="password" name="confirmPassword" required placeholder="Xác nhận lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} 
                className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-400 p-3.5 rounded-xl outline-none focus:border-red-500 focus:bg-black/50 transition-all font-medium" />
            </div>
          )}

          {/* NÚT QUÊN MẬT KHẨU (Bây giờ đã là button có onClick) */}
          {view === 'login' && (
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => { setView('forgot'); setError(''); setSuccess(''); }} 
                className="text-gray-400 text-sm hover:text-white cursor-pointer transition-colors font-bold"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-black py-4 rounded-xl hover:from-red-500 hover:to-red-700 transition-all shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.6)] uppercase tracking-widest mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : view === 'login' ? 'Đăng nhập ngay' : view === 'register' ? 'Đăng ký ngay' : 'Gửi mã xác nhận'}
          </button>
        </form>

        {view === 'login' && (
          <>
            <div className="relative flex items-center justify-center my-6">
              <span className="absolute bg-transparent px-4 text-xs text-gray-400 font-bold uppercase tracking-widest backdrop-blur-md">Hoặc Đăng nhập bằng</span>
              <div className="w-full h-px bg-white/10"></div>
            </div>

            <div className="flex justify-center mb-6 opacity-90 hover:opacity-100 transition-opacity">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Đăng nhập Google thất bại!")} useOneTap theme="filled_black" shape="pill" />
            </div>
          </>
        )}

        {/* NÚT CHUYỂN ĐỔI LOGIN / REGISTER */}
        {view !== 'forgot' && (
          <p className="mt-8 text-center text-sm font-medium text-gray-400">
            {view === 'login' ? "Chưa là thành viên?" : "Đã có tài khoản?"} 
            <button 
              onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); setFormData({name:'', email:'', password:'', confirmPassword:''}); }}
              className="text-red-400 hover:text-red-300 font-bold ml-2 underline underline-offset-4 transition-colors"
            >
              {view === 'login' ? "Đăng ký tại đây" : "Quay lại Đăng nhập"}
            </button>
          </p>
        )}

      </div>
    </div>
  );
};

export default AuthPage;