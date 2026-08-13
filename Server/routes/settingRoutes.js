// server/routes/settingRoutes.js
const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// 1. API GET: Lấy cấu hình hệ thống (Public cho toàn trang web)
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    // Nếu DB chưa có cấu hình nào, tự động tạo 1 bản ghi mặc định
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error("Lỗi lấy cấu hình:", err);
    res.status(500).json({ msg: 'Lỗi server khi lấy cài đặt' });
  }
});

// 2. API PUT: Cập nhật cấu hình (Chỉ Admin)
router.put('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    // Tìm bản ghi đầu tiên và cập nhật, nếu chưa có (upsert: true) thì tạo mới
    const updatedSettings = await Setting.findOneAndUpdate(
      {}, 
      { $set: req.body }, 
      { new: true, upsert: true }
    );
    res.json({ msg: 'Đã lưu cấu hình hệ thống!', settings: updatedSettings });
  } catch (err) {
    console.error("Lỗi cập nhật cấu hình:", err);
    res.status(500).json({ msg: 'Lỗi server khi lưu cài đặt' });
  }
});

module.exports = router;