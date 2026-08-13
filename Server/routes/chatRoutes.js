const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// DÀNH CHO ADMIN: Lấy danh sách những khách hàng đã từng chat
router.get('/inbox', checkAuth, checkAdmin, async (req, res) => {
  try {
    // Nhóm các tin nhắn theo userId để tạo danh sách Inbox
    const inbox = await Chat.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          lastMessage: { $first: '$message' },
          lastTime: { $first: '$createdAt' },
          unreadCount: { 
            $sum: { $cond: [{ $and: [{ $eq: ['$isAdmin', false] }, { $eq: ['$isRead', false] }] }, 1, 0] } 
          }
      }},
      { $sort: { lastTime: -1 } }
    ]);
    res.json(inbox);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi lấy danh sách hòm thư' });
  }
});

// DÀNH CHO CẢ HAI: Lấy lịch sử chat của 1 khách hàng cụ thể
router.get('/:userId', async (req, res) => {
  try {
    const messages = await Chat.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    // Nếu Admin lấy tin nhắn, đánh dấu là đã đọc
    if (req.user && req.user.role === 'admin') {
      await Chat.updateMany({ userId: req.params.userId, isAdmin: false }, { isRead: true });
    }
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi lấy lịch sử chat' });
  }
});

module.exports = router;