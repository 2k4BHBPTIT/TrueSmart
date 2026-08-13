const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // ID khách hoặc Guest ID
  userName: { type: String, default: 'Khách hàng' }, // Tên khách
  message: { type: String, required: true }, // Nội dung tin nhắn
  isAdmin: { type: Boolean, default: false }, // false: Khách gửi, true: Admin gửi
  isRead: { type: Boolean, default: false } // Đánh dấu đã đọc
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);