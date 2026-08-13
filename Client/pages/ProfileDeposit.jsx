import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { QrCode, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ProfileDeposit = () => {
  const [amount, setAmount] = useState(50000);
  const [pendingTx, setPendingTx] = useState(null);
  // showQr dùng để điều hướng trong cùng trang:
  // - pendingTx tồn tại: có QR, nhưng user có thể "Quay lại" để xem form tạo lệnh
  const [showQr, setShowQr] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  // THAY ĐỔI THÔNG TIN NGÂN HÀNG CỦA BẠN Ở ĐÂY
  const BANK_ID = 'VCB'; // Tên viết tắt ngân hàng (MB, VCB, TCB...)
  const ACCOUNT_NO = '1025286325'; // Số tài khoản của Admin
  const ACCOUNT_NAME = 'BUI HUY BICH'; // Tên chủ thẻ

  const fetchHistory = async () => {
    try {
      const res = await API.get('/transactions/my-transactions');
      setHistory(res.data);
      // Kiểm tra xem có lệnh nào đang PENDING không để hiện lại mã QR
      const pending = res.data.find(tx => tx.status === 'PENDING' && tx.type === 'DEPOSIT');
      setPendingTx(pending || null);
      setShowQr(!!pending);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleCreateDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/transactions/deposit', { amount });
      setPendingTx(res.data);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.msg || 'Lỗi tạo lệnh');
    }
  };

  // Link tạo mã QR động từ VietQR
  const qrCodeUrl = pendingTx 
    ? `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${pendingTx.amount}&addInfo=${pendingTx.transferCode}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`
    : '';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => {
            // Nếu đang có lệnh PENDING và đang hiển thị QR,
            // "Quay lại" sẽ đưa user về màn hình tạo lệnh (chứ không hủy lệnh).
            if (pendingTx) setShowQr(false);
            else navigate(-1);
          }}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 font-bold text-gray-700"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-red-600 text-white font-black"
        >
          Thoát
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CỘT TRÁI: TẠO LỆNH & HIỂN THỊ QR */}
        <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-black text-gray-800 uppercase mb-6 flex items-center gap-2 border-l-4 border-red-600 pl-3">
          <CreditCard size={24} /> Nạp thẻ / Nạp ví
        </h2>

        {!pendingTx || !showQr ? (
          <form onSubmit={handleCreateDeposit} className="space-y-4">
            <div>
              <label className="block font-bold text-gray-700 mb-2">Chọn số tiền nạp (VNĐ)</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[50000, 100000, 200000, 500000].map(val => (
                  <button key={val} type="button" onClick={() => setAmount(val)} className={`py-2 rounded font-bold border ${amount === val ? 'bg-red-50 border-red-600 text-red-600' : 'hover:bg-gray-50'}`}>
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>
              <input type="number" min="10000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full border p-3 rounded-lg font-bold text-lg outline-none focus:border-red-600" />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white font-black py-3 rounded-lg hover:bg-red-600 transition-colors uppercase">
              Tạo lệnh nạp tiền
            </button>
          </form>
        ) : (
          <div className="text-center bg-gray-50 p-6 rounded-xl border-2 border-dashed border-red-300">
            <h3 className="font-bold text-red-600 mb-2 uppercase">Quét mã QR để thanh toán</h3>
            <img src={qrCodeUrl} alt="Mã VietQR" className="mx-auto w-64 h-64 rounded-xl shadow-md bg-white p-2 mb-4" />
            
            <div className="bg-white p-4 rounded-lg shadow-sm text-left text-sm font-bold text-gray-700 space-y-2">
              <p>Ngân hàng: <span className="text-red-600">{BANK_ID}</span></p>
              <p>Chủ TK: <span className="text-red-600">{ACCOUNT_NAME}</span></p>
              <p>Số tài khoản: <span className="text-blue-600 text-lg cursor-pointer">{ACCOUNT_NO}</span></p>
              <p>Số tiền: <span className="text-red-600 text-lg">{pendingTx.amount.toLocaleString()}đ</span></p>
              <p>Nội dung CK: <span className="bg-yellow-200 text-black px-2 py-1 rounded text-lg select-all">{pendingTx.transferCode}</span></p>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              * Hệ thống (Admin) sẽ duyệt và cộng tiền vào ví trong vòng 1-5 phút sau khi nhận được chuyển khoản với đúng Nội Dung.
            </p>
          </div>
        )}
      </div>

        {/* CỘT PHẢI: LỊCH SỬ NẠP */}
        <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-black text-gray-800 uppercase mb-6 flex items-center gap-2">
          <Clock size={24} /> Lịch sử giao dịch
        </h2>
        <div className="space-y-4 overflow-y-auto max-h-[500px]">
          {history.length === 0 ? <p className="text-gray-500 font-bold">Chưa có giao dịch nào.</p> : null}
          {history.map(tx => (
            <div key={tx._id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
              <div>
                <p className="font-black text-gray-800">{tx.type === 'DEPOSIT' ? 'Nạp tiền' : 'Giao dịch khác'} <span className="text-blue-600">({tx.transferCode})</span></p>
                <p className="text-sm text-gray-500 font-bold">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-gray-800">+{tx.amount.toLocaleString()}đ</p>
                {tx.status === 'PENDING' && <span className="text-yellow-600 text-xs font-bold flex items-center gap-1"><AlertCircle size={14}/> Đang chờ duyệt</span>}
                {tx.status === 'SUCCESS' && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> Thành công</span>}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDeposit;