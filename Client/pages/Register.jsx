import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Thêm state Xác nhận mật khẩu
  const [error, setError] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset lỗi mỗi lần bấm Submit

    // ==========================================
    // 🛡️ LỚP BẮT LỖI TẠI FRONTEND (VALIDATION)
    // ==========================================
    if (name.trim().length < 2) {
      return setError('Họ tên phải có ít nhất 2 ký tự!');
    }
    
    if (password.length < 6) {
      return setError('Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự!');
    }

    if (password !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp!');
    }

    // Nếu vượt qua hết các chốt chặn trên mới gọi API
    try {
      await register(name, email, password);
      alert('Đăng ký thành công! Chào mừng bạn đến với X-Billiard.');
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border-t-8 border-red-600">
        <h2 className="text-2xl font-black text-center mb-6 uppercase">Đăng ký thành viên</h2>
        
        {/* Hiển thị thông báo lỗi bằng khung màu đỏ cho chuyên nghiệp */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-bold mb-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Họ tên</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full border p-2.5 rounded-lg outline-none focus:border-red-600 bg-gray-50 transition-colors" 
              placeholder="VD: Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border p-2.5 rounded-lg outline-none focus:border-red-600 bg-gray-50 transition-colors" 
              placeholder="VD: email@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Mật khẩu</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border p-2.5 rounded-lg outline-none focus:border-red-600 bg-gray-50 transition-colors" 
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          
          {/* TRƯỜNG NHẬP LẠI MẬT KHẨU (CỰC KỲ QUAN TRỌNG) */}
          <div>
            <label className="block text-sm font-bold mb-1 text-red-600">Xác nhận Mật khẩu *</label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full border p-2.5 rounded-lg outline-none focus:border-red-600 bg-red-50 transition-colors" 
              placeholder="Nhập lại mật khẩu ở trên"
            />
          </div>

          <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors uppercase mt-2">
            ĐĂNG KÝ NGAY
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm font-bold text-gray-600">
          Đã có tài khoản? <Link to="/login" className="text-red-600 hover:underline">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;