// server/routes/logRoutes.js
const express = require('express');
const router = express.Router();
const SystemLog = require('../models/SystemLog');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// API: Lấy danh sách lịch sử hoạt động (Có phân trang)
router.get('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    // Lấy số trang và giới hạn từ query (Mặc định trang 1, 15 dòng/trang)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // Lấy tổng số lượng Log để chia trang
    const totalLogs = await SystemLog.countDocuments();

    // Query lấy dữ liệu: Sắp xếp mới nhất lên đầu, populate lấy tên và email của Admin
    const logs = await SystemLog.find()
      .populate('admin', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Trả về cho Frontend
    res.json({
      logs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
      totalLogs
    });

  } catch (err) {
    console.error("Lỗi lấy lịch sử hệ thống:", err);
    res.status(500).json({ msg: 'Lỗi server khi lấy lịch sử hệ thống' });
  }
});

// API: Ghi lại một Log mới (Bạn có thể gọi API này hoặc dùng hàm trực tiếp ở các file khác)
router.post('/record', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { action, details } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const newLog = new SystemLog({
      admin: req.user.id,
      action,
      details,
      ipAddress
    });

    await newLog.save();
    res.status(201).json({ msg: 'Đã ghi log thành công' });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi ghi log' });
  }
});

module.exports = router;