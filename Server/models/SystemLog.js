// server/models/SystemLog.js
const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  // Người thực hiện hành động (Tham chiếu đến bảng User)
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Loại hành động (Vd: CREATE_PRODUCT, DELETE_ORDER, UPDATE_USER)
  action: { 
    type: String, 
    required: true 
  },
  // Mô tả chi tiết (Vd: "Đã thêm gậy Peri ST04", "Đã xóa đơn hàng #123")
  details: { 
    type: String, 
    required: true 
  },
  // Địa chỉ IP của người dùng (Tùy chọn, thêm vào để tăng cường bảo mật)
  ipAddress: { 
    type: String 
  }
}, { timestamps: true }); // Tự động có createdAt để biết thời gian thực hiện

module.exports = mongoose.model('SystemLog', systemLogSchema);