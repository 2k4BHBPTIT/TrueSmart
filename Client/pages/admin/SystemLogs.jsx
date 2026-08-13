// src/pages/admin/SystemLogs.jsx
import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Activity, Clock, ChevronLeft, ChevronRight, User, AlertCircle } from 'lucide-react';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = async (page) => {
    try {
      setLoading(true);
      const res = await API.get(`/logs?page=${page}&limit=15`);
      setLogs(res.data.logs);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
      setTotalLogs(res.data.totalLogs);
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-100 text-green-700 border-green-200';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-100 text-red-700 border-red-200';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Hàm format thời gian bằng JS Native (chuẩn Việt Nam)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour12: false })
    };
  };

  return (
    <div className="p-6 font-sans min-h-[90vh] bg-gray-50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase text-gray-800 flex items-center gap-3 border-l-4 border-red-600 pl-4">
            <Activity className="text-red-600" size={32} /> Lịch sử Hệ thống
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-2">
            Theo dõi và giám sát mọi hoạt động quản trị viên. Tổng: <span className="text-red-600">{totalLogs}</span> bản ghi.
          </p>
        </div>
        <button 
          onClick={() => fetchLogs(currentPage)}
          className="bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:border-red-600 hover:text-red-600 transition-colors flex items-center gap-2"
        >
          <Clock size={16} /> Làm mới
        </button>
      </div>

      {/* BẢNG LOG */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="text-center py-20 font-black text-xl text-gray-400">Đang tải lịch sử...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-900 text-white uppercase text-xs tracking-wider">
                <th className="p-5 font-black w-48">Thời gian</th>
                <th className="p-5 font-black">Người thao tác</th>
                <th className="p-5 font-black text-center">Hành động</th>
                <th className="p-5 font-black">Chi tiết</th>
                <th className="p-5 font-black text-right">IP (Tùy chọn)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => {
                const { day, time } = formatDate(log.createdAt);
                
                return (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors group">
                    
                    {/* CỘT THỜI GIAN */}
                    <td className="p-5 text-sm font-bold text-gray-600">
                      <span className="block text-gray-800">{day}</span>
                      <span className="text-xs text-gray-400">{time}</span>
                    </td>

                    {/* CỘT NGƯỜI THỰC HIỆN */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{log.admin?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400 font-medium">{log.admin?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* CỘT LOẠI HÀNH ĐỘNG */}
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase border shadow-sm ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* CỘT CHI TIẾT */}
                    <td className="p-5 text-sm font-medium text-gray-700 flex items-center gap-2">
                      <AlertCircle size={16} className="text-gray-400" />
                      {log.details}
                    </td>

                    {/* CỘT IP */}
                    <td className="p-5 text-right text-xs font-mono text-gray-400">
                      {log.ipAddress || 'N/A'}
                    </td>
                  </tr>
                );
              })}
              
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400 font-bold">Chưa có lịch sử hoạt động nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* BỘ ĐIỀU KHIỂN PHÂN TRANG */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center p-5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm font-bold text-gray-500">
              Trang <span className="font-black text-gray-800">{currentPage}</span> / {totalPages}
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1} 
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-600 hover:text-red-600 disabled:opacity-40 bg-white shadow-sm transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-1.5 font-black text-sm">
                {[...Array(totalPages)].map((_, index) => {
                  if (totalPages > 5 && (index + 1 < currentPage - 1 || index + 1 > currentPage + 1) && index !== 0 && index !== totalPages - 1) {
                    if (index + 1 === currentPage - 2 || index + 1 === currentPage + 2) return <span key={index} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                    return null;
                  }

                  return (
                    <button 
                      key={index} 
                      onClick={() => setCurrentPage(index + 1)} 
                      className={`w-10 h-10 rounded-lg shadow-sm transition-all ${currentPage === index + 1 ? 'bg-red-600 text-white border-red-600' : 'bg-white border hover:border-red-600 hover:text-red-600 text-gray-700'}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages} 
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-600 hover:text-red-600 disabled:opacity-40 bg-white shadow-sm transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;