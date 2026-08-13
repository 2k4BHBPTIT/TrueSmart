const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên nhà cung cấp (VD: Công ty Aileex)
  contactPerson: { type: String },        // Tên người đại diện
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  status: { 
    type: String, 
    enum: ['Đang hợp tác', 'Ngừng hợp tác'], 
    default: 'Đang hợp tác' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);