const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const Product = require('../models/Product');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// 1. PUBLIC: Lấy danh sách Deal đang chạy (Dành cho trang chủ)
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const activeDeals = await Deal.find({ endTime: { $gt: now } }).populate('product');
    
    const dealProducts = activeDeals.map(deal => {
      if (!deal.product) {
        return null;
      }
      return {
        ...deal.product._doc,
        dealPrice: deal.dealPrice,
        dealEndTime: deal.endTime,
        dealId: deal._id
      };
    }).filter(Boolean);

    res.json({ dealProducts });
  } catch (err) {
    console.error('Lỗi lấy danh sách Deal:', err);
    res.status(500).json({ msg: 'Lỗi lấy danh sách Deal' });
  }
});

// 2. ADMIN: Lấy tất cả Deal
router.get('/admin/all', checkAuth, checkAdmin, async (req, res) => {
  try {
    const deals = await Deal.find().populate('product').sort({ endTime: -1 });
    res.json(deals);
  } catch (err) {
    console.error('Lỗi server:', err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// 3. ADMIN: Tạo Deal mới
router.post('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { productId, dealPrice, endTime } = req.body;
    
    // VALIDATE
    if (!productId || !dealPrice || !endTime) {
      return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (dealPrice <= 0) {
      return res.status(400).json({ msg: 'Giá Deal phải > 0' });
    }
    if (new Date(endTime) <= new Date()) {
      return res.status(400).json({ msg: 'Thời gian kết thúc phải ở tương lai' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    if (dealPrice >= product.price) return res.status(400).json({ msg: 'Giá Deal phải RẺ HƠN giá gốc!' });

    // Xóa deal cũ của sp này (nếu có)
    await Deal.deleteOne({ product: productId });

    const newDeal = new Deal({
      product: productId,
      dealPrice,
      endTime
    });

    await newDeal.save();
    
    const populatedDeal = await Deal.findById(newDeal._id).populate('product');
    res.status(201).json(populatedDeal);
  } catch (err) {
    console.error('Lỗi tạo Deal:', err);
    res.status(500).json({ msg: 'Lỗi tạo Deal' });
  }
});

// 4. ADMIN: Xóa Deal
router.delete('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ msg: 'Không tìm thấy Deal' });
    res.json({ msg: 'Đã xóa Deal' });
  } catch (err) {
    console.error('Lỗi xóa Deal:', err);
    res.status(500).json({ msg: 'Lỗi xóa Deal' });
  }
});

module.exports = router;