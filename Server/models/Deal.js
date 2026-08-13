const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true,
    unique: true // Mỗi sản phẩm chỉ có 1 deal đang chạy cùng lúc
  },
  dealPrice: { 
    type: Number, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Deal', DealSchema);