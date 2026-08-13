// src/pages/ProfileVouchers.jsx
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Ticket, Gift, Copy, CheckCircle, AlertCircle, Trash2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const ProfileVouchers = () => {
  const { user, setUser } = useContext(AuthContext);
  const [copiedCode, setCopiedCode] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tính thời gian còn lại của voucher
  const getTimeRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  // Lấy danh sách voucher từ server (tự động dọn dẹp hết hạn)
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/vouchers/mine');
      setVouchers(res.data.vouchers || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách voucher:', err);
      setVouchers(user?.vouchers || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchVouchers();
  }, [user]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (code) => {
    if (!window.confirm('Xóa voucher này?')) return;
    try {
      const res = await API.delete(`/vouchers/${code}`);
      setVouchers(v => v.filter(voucher => voucher.code !== code));
      
      // Đồng bộ lại AuthContext để Header cập nhật số lượng
      if (res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      alert('Không thể xóa voucher: ' + (err.response?.data?.msg || err.message));
    }
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 min-h-[60vh]">
        <div className="text-center py-20 font-bold text-gray-500">Vui lòng đăng nhập để xem kho voucher.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 min-h-[60vh]">
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 min-h-[60vh]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3 border-b-4 border-red-600 pb-2 w-fit">
            <Ticket size={32} className="text-red-600" />
            <h1 className="text-3xl font-black uppercase text-gray-900">Kho Ưu Đãi Của Tôi</h1>
          </div>
          <Link to="/vong-quay" className="bg-yellow-400 text-red-700 hover:bg-yellow-500 font-black px-6 py-2 rounded-xl uppercase transition-colors shadow-md flex items-center gap-2">
            <Gift size={18} /> Quay thêm quà
          </Link>
        </div>
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-300" />
          </div>
          <h3 className="text-xl font-black text-gray-800 uppercase mb-2">Kho quà trống rỗng</h3>
          <p className="text-gray-500 font-bold mb-6">Bạn chưa có thẻ ưu đãi nào. Hãy tham gia Vòng quay may mắn nhé!</p>
          <Link to="/vong-quay" className="inline-block bg-red-600 text-white font-black px-6 py-3 rounded-xl uppercase hover:bg-black transition-colors">
            Đi quay ngay
          </Link>
        </div>
      </div>
    );
  }

  // Phân loại voucher
  const activeVouchers = vouchers.filter(v => !v.isUsed && new Date(v.expiryDate) >= new Date());
  const usedVouchers = vouchers.filter(v => v.isUsed);
  const expiredVouchers = vouchers.filter(v => !v.isUsed && new Date(v.expiryDate) < new Date());

  const VoucherCard = ({ v, index, variant = 'active' }) => {
    const isGift = v.type === 'gift';
    const timeLeft = getTimeRemaining(v.expiryDate);

    return (
      <div key={`${v.code}-${index}`} className={`relative rounded-xl p-5 border-2 border-dashed transition-all ${
        variant === 'active'
          ? isGift
            ? 'bg-red-50 border-red-300 hover:shadow-lg hover:-translate-y-1'
            : 'bg-yellow-50 border-yellow-400 hover:shadow-lg hover:-translate-y-1'
          : variant === 'used'
          ? 'bg-gray-200 border-gray-400 opacity-80'
          : 'bg-gray-100 border-gray-300 opacity-60'
      }`}>
        {/* Nút xóa */}
        {variant !== 'used' && (
          <button
            onClick={() => handleDelete(v.code)}
            className="absolute top-2 right-2 w-8 h-8 bg-gray-800/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-20"
            title="Xóa voucher"
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* 2 Lỗ tròn 2 bên tạo hiệu ứng Vé */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-r-2 border-dashed border-gray-300"></div>
        </div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-l-2 border-dashed border-gray-300"></div>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            variant === 'active'
              ? isGift
                ? 'bg-red-200 text-red-600'
                : 'bg-yellow-200 text-yellow-600'
              : 'bg-gray-300 text-gray-500'
          }`}>
            {isGift ? <Gift size={24} /> : <Ticket size={24} />}
          </div>
          <div>
            <h4 className={`font-black uppercase text-lg leading-tight ${
              variant === 'active'
                ? isGift
                  ? 'text-red-600'
                  : 'text-yellow-600'
                : 'text-gray-500'
            }`}>
              {v.itemName || 'Voucher X-Billiard'}
            </h4>
            <p className={`text-xs font-bold mt-1 uppercase flex items-center gap-1 ${
              variant === 'active' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <Calendar size={12} />
              HSD: {new Date(v.expiryDate).toLocaleDateString('vi-VN')}
            </p>
            {variant === 'active' && timeLeft && (
              <p className="text-[10px] font-bold text-blue-600 mt-1">
                Còn {timeLeft.days} ngày {timeLeft.hours} giờ
              </p>
            )}
          </div>
        </div>

        <div className="bg-white/80 rounded-lg border border-gray-200 p-2 flex items-center justify-between">
          <span className="font-black text-gray-700 tracking-wider text-sm px-2">{v.code}</span>
          {variant === 'active' && (
            <button
              onClick={() => handleCopy(v.code)}
              className="px-4 py-1.5 rounded-md font-bold uppercase text-xs flex items-center gap-1 transition-colors bg-gray-800 text-white hover:bg-red-600"
            >
              {copiedCode === v.code ? <><CheckCircle size={14} /> Đã chép</> : <><Copy size={14} /> Copy</>}
            </button>
          )}
          {variant !== 'active' && (
            <span className="px-4 py-1.5 rounded-md font-bold uppercase text-xs text-gray-400 bg-gray-200">
              <Copy size={14} className="inline mr-1" /> Copy
            </span>
          )}
        </div>

        {variant === 'used' && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
            <span className="bg-gray-800 text-white font-black uppercase px-4 py-1 rounded-full text-sm border-2 border-white shadow-lg rotate-12">
              Đã sử dụng
            </span>
          </div>
        )}

        {variant === 'expired' && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
            <span className="bg-red-800 text-white font-black uppercase px-4 py-1 rounded-full text-sm border-2 border-white shadow-lg -rotate-12">
              Đã hết hạn
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 min-h-[60vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3 border-b-4 border-red-600 pb-2 w-fit">
          <Ticket size={32} className="text-red-600" />
          <h1 className="text-3xl font-black uppercase text-gray-900">Kho Ưu Đãi Của Tôi</h1>
        </div>
        <Link to="/vong-quay" className="bg-yellow-400 text-red-700 hover:bg-yellow-500 font-black px-6 py-2 rounded-xl uppercase transition-colors shadow-md flex items-center gap-2">
          <Gift size={18} /> Quay thêm quà
        </Link>
      </div>

      {/* Voucher đang hoạt động */}
      {activeVouchers.length > 0 && (
        <>
          <h2 className="text-xl font-black mb-4 uppercase text-red-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Có thể sử dụng ({activeVouchers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {activeVouchers.map((v, index) => (
              <VoucherCard key={v.code} v={v} index={index} variant="active" />
            ))}
          </div>
        </>
      )}

      {/* Voucher đã hết hạn */}
      {expiredVouchers.length > 0 && (
        <>
          <h2 className="text-xl font-black mb-4 uppercase text-gray-400 flex items-center gap-2">
            <AlertCircle size={20} />
            Đã hết hạn ({expiredVouchers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {expiredVouchers.map((v, index) => (
              <VoucherCard key={v.code} v={v} index={index} variant="expired" />
            ))}
          </div>
        </>
      )}

      {/* Voucher đã dùng */}
      {usedVouchers.length > 0 && (
        <>
          <h2 className="text-xl font-black mb-4 uppercase text-gray-500 flex items-center gap-2">
            <CheckCircle size={20} />
            Đã sử dụng ({usedVouchers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {usedVouchers.map((v, index) => (
              <VoucherCard key={v.code} v={v} index={index} variant="used" />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileVouchers;