import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Download, Plus } from 'lucide-react';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [filterDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/attendance?date=${filterDate}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Lỗi khi tải dữ liệu chấm công');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/users/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedEmployee) {
      alert('Vui lòng chọn nhân viên');
      return;
    }

    try {
      const response = await axios.post(
        '/api/attendance/check-in',
        { userId: selectedEmployee, date: filterDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Chấm công thành công');
      setSelectedEmployee('');
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.msg || 'Lỗi khi chấm công');
    }
  };

  const handleCheckOut = async (recordId) => {
    try {
      await axios.put(
        `/api/attendance/${recordId}/check-out`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Check out thành công');
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.msg || 'Lỗi khi check out');
    }
  };

  const exportAttendance = () => {
    if (attendance.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    let csv = 'Tên nhân viên,Email,Giờ vào,Giờ ra,Tổng giờ\n';
    attendance.forEach(record => {
      const checkIn = record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('vi-VN') : 'N/A';
      const checkOut = record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('vi-VN') : 'Chưa checkout';
      const totalHours = record.totalHours ? record.totalHours.toFixed(2) : '0';
      csv += `${record.userId.name},${record.userId.email},${checkIn},${checkOut},${totalHours}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `attendance-${filterDate}.csv`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Clock className="text-red-600" size={32} />
          Quản lý Chấm công
        </h1>
        <p className="text-gray-600 mt-2">Quản lý thời gian làm việc của nhân viên</p>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn ngày</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn nhân viên</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleCheckIn}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Plus size={20} />
              Chấm công vào
            </button>
            <button
              onClick={exportAttendance}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : attendance.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có dữ liệu chấm công cho ngày này</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">STT</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên nhân viên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Giờ vào</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Giờ ra</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tổng giờ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={record._id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-800">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{record.userId.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.userId.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('vi-VN') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('vi-VN') : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    {record.totalHours ? record.totalHours.toFixed(2) : 0} h
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {!record.checkOutTime && (
                      <button
                        onClick={() => handleCheckOut(record._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg transition"
                      >
                        Check out
                      </button>
                    )}
                    {record.checkOutTime && (
                      <span className="text-green-600 font-semibold">✓ Đã hoàn tất</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Statistics */}
      {attendance.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Thống kê ({filterDate})</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm">Tổng nhân viên</p>
              <p className="text-3xl font-bold text-blue-600">{attendance.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
              <p className="text-gray-600 text-sm">Đã check in</p>
              <p className="text-3xl font-bold text-green-600">{attendance.filter(a => a.checkInTime).length}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
              <p className="text-gray-600 text-sm">Chưa check out</p>
              <p className="text-3xl font-bold text-red-600">{attendance.filter(a => !a.checkOutTime).length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
              <p className="text-gray-600 text-sm">Trung bình giờ làm</p>
              <p className="text-3xl font-bold text-yellow-600">
                {(attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length).toFixed(1)} h
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
