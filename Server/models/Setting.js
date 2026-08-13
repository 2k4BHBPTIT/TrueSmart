// server/models/Setting.js
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'TrueSmart' },
  hotline: { type: String, default: '0948.122.666' },
  // ... (Giữ nguyên các trường cũ của bạn như logoUrl, address, v.v.) ...

  // ==========================================
  // THÊM MỚI: CẤU HÌNH GIAO DIỆN TRANG CHỦ (CMS)
  // ==========================================
  // 1. Thứ tự hiển thị các khối từ trên xuống dưới
  layoutOrder: { 
    type: [String], 
    default: ['banner', 'flashSale', 'featured', 'featuredPhones', 'featuredTablets', 'featuredLaptops', 'featuredRepair', 'video', 'brands'] 
  },
  sectionVisibility: {
    banner: { type: Boolean, default: true },
    flashSale: { type: Boolean, default: true },
    featured: { type: Boolean, default: true },
    featuredPhones: { type: Boolean, default: true },
    featuredTablets: { type: Boolean, default: true },
    featuredLaptops: { type: Boolean, default: true },
    featuredRepair: { type: Boolean, default: true },
    video: { type: Boolean, default: true },
    brands: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);