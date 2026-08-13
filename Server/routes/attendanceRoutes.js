const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// Get attendance records for a specific date (Admin only)
router.get('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ msg: 'Date parameter is required' });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(attendance);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ msg: 'Lỗi khi lấy dữ liệu chấm công' });
  }
});

// Check in for a user (Admin only)
router.post('/check-in', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { userId, date } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ msg: 'UserId and date are required' });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Check if attendance record already exists for this user on this date
    let attendance = await Attendance.findOne({
      userId: userId,
      date: { $gte: startDate, $lte: endDate }
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ msg: 'Nhân viên này đã chấm công vào hôm nay' });
    }

    if (!attendance) {
      attendance = new Attendance({
        userId: userId,
        date: new Date(date),
        checkInTime: new Date()
      });
    } else {
      attendance.checkInTime = new Date();
    }

    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    console.error('Error checking in:', err);
    res.status(500).json({ msg: 'Lỗi khi chấm công' });
  }
});

// Check out for a user (Admin only)
router.put('/:id/check-out', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ msg: 'Không tìm thấy bản ghi chấm công' });
    }

    if (!attendance.checkInTime) {
      return res.status(400).json({ msg: 'Nhân viên chưa chấm công vào' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ msg: 'Nhân viên đã chấm công ra rồi' });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.json(attendance);
  } catch (err) {
    console.error('Error checking out:', err);
    res.status(500).json({ msg: 'Lỗi khi chấm công ra' });
  }
});

// Get attendance statistics for a date range (Admin only)
router.get('/stats', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const stats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          totalHours: { $sum: '$totalHours' },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]);

    res.json(stats);
  } catch (err) {
    console.error('Error getting attendance stats:', err);
    res.status(500).json({ msg: 'Lỗi khi lấy thống kê chấm công' });
  }
});

// Update attendance record (Admin only)
router.put('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    ).populate('userId', 'name email');

    if (!attendance) {
      return res.status(404).json({ msg: 'Không tìm thấy bản ghi chấm công' });
    }

    res.json(attendance);
  } catch (err) {
    console.error('Error updating attendance:', err);
    res.status(500).json({ msg: 'Lỗi khi cập nhật chấm công' });
  }
});

// Delete attendance record (Admin only)
router.delete('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({ msg: 'Không tìm thấy bản ghi chấm công' });
    }

    res.json({ msg: 'Đã xóa bản ghi chấm công' });
  } catch (err) {
    console.error('Error deleting attendance:', err);
    res.status(500).json({ msg: 'Lỗi khi xóa chấm công' });
  }
});

module.exports = router;
