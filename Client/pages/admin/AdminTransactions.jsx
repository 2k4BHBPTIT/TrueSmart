import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions/admin/all');
      setTransactions(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách giao dịch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApprove = async (id, transferCode) => {
    if (!window.confirm(`Xác nhận khách đã chuyển khoản đúng nội dung: ${transferCode} ?\nTiền sẽ được cộng thẳng vào ví khách hàng!`)) return;
    
    try {
      await API.put(`/transactions/admin/approve/${id}`);
      alert('Đã duyệt thành công! Tiền đã được cộng vào ví khách.');
      fetchTransactions(); // Load lại bảng
    } catch (err) {
      alert(err.response?.data?.msg || 'Lỗi khi duyệt');
    }
  };

  if (loading) return <div className="p-6 font-bold text-gray-500">Đang tải dữ liệu giao dịch...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black uppercase text-gray-800 mb-6 border-l-4 border-red-600 pl-4">Duyệt Nạp Tiền (Ví)</h1>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white uppercase text-xs">
              <th className="p-4">Thời gian</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Mã CK (Nội dung)</th>
              <th className="p-4">Số tiền</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map(tx => (
              <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-bold text-gray-500">
                  {new Date(tx.createdAt).toLocaleString('vi-VN')}
                </td>
                <td className="p-4">
                  <p className="font-bold text-gray-800">{tx.user?.name || 'Khách ẩn danh'}</p>
                  <p className="text-xs text-gray-500">{tx.user?.email}</p>
                </td>
                <td className="p-4">
                  <span className="bg-yellow-100 text-yellow-800 font-black px-3 py-1 rounded select-all">
                    {tx.transferCode}
                  </span>
                </td>
                <td className="p-4 font-black text-red-600">
                  +{tx.amount.toLocaleString()}đ
                </td>
                <td className="p-4">
                  {tx.status === 'PENDING' && <span className="text-yellow-600 font-bold flex items-center gap-1 text-sm"><Clock size={16}/> Chờ duyệt</span>}
                  {tx.status === 'SUCCESS' && <span className="text-green-600 font-bold flex items-center gap-1 text-sm"><CheckCircle size={16}/> Đã cộng tiền</span>}
                  {tx.status === 'FAILED' && <span className="text-red-600 font-bold flex items-center gap-1 text-sm"><XCircle size={16}/> Đã hủy</span>}
                </td>
                <td className="p-4 text-center">
                  {tx.status === 'PENDING' ? (
                    <button 
                      onClick={() => handleApprove(tx._id, tx.transferCode)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow transition-transform hover:scale-105"
                    >
                      Duyệt ngay
                    </button>
                  ) : (
                    <span className="text-gray-400 font-bold text-sm">Hoàn tất</span>
                  )}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan="6" className="p-10 text-center text-gray-400 font-bold">Chưa có giao dịch nạp tiền nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;