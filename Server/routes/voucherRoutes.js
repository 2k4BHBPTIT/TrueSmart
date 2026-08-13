const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { checkAuth, checkAdmin } = require('../middleware/auth');
const SystemLog = require('../models/SystemLog');

// 1. ADMIN TẠO VOUCHER MỚI
router.post('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { userId, code, discountAmt, itemName, expiryDate } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'Người dùng không tồn tại' });

    const newVoucher = {
      code: code.toUpperCase(),
      discountAmt,
      itemName,
      expiryDate,
      isUsed: false,
      createdAt: new Date(),
      createdBy: req.user?.id || null
    };

    user.vouchers.push(newVoucher);
    await user.save();

    await SystemLog.create({
      admin: req.user?.id,
      action: 'CREATE_VOUCHER',
      details: `Tạo voucher ${code} cho user ${userId}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'Unknown'
    });

    res.status(201).json({ msg: 'Voucher đã được tạo', voucher: newVoucher });
  } catch (err) {
    console.error("Lỗi tạo voucher:", err);
    res.status(500).json({ msg: 'Lỗi server', error: err.message });
  }
});

// 2. USER LẤY DANH SÁCH VOUCHER (TẤT CẢ)
router.get('/mine', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('vouchers');
    if (!user) return res.status(404).json({ msg: 'Không tìm thấy user' });

    res.json({ vouchers: user.vouchers });
  } catch (err) {
    console.error("Lỗi lấy voucher:", err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// 3. USER ÁP DỤNG VOUCHER VÀO ĐƠN HÀNG
router.post('/apply', checkAuth, async (req, res) => {
  try {
    const { code } = req.body;
    // Chấp nhận cả orderTotal hoặc cartTotal để linh hoạt, mặc định là 0 nếu không có
    const orderTotal = Number(req.body.orderTotal || req.body.cartTotal) || 0;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Không tìm thấy user' });

    const now = new Date();
    const voucher = user.vouchers.find(v => v.code === code.toUpperCase());
    
    if (!voucher) return res.status(404).json({ msg: 'Voucher không tồn tại hoặc đã hết hạn' });
    if (voucher.isUsed) return res.status(400).json({ msg: 'Voucher đã được sử dụng' });
    if (new Date(voucher.expiryDate) < now) {
      return res.status(400).json({ msg: 'Voucher đã hết hạn' });
    }

    // Tính giảm giá: sử dụng trực tiếp trường discountAmt từ voucher, với xử lý bảo vệ
    let discountAmount = 0;
    
    // Xử lý discountAmt từ voucher
    if (voucher.discountAmt !== null && voucher.discountAmt !== undefined) {
      const discountNum = Number(voucher.discountAmt);
      if (!isNaN(discountNum) && discountNum >= 0) {
        discountAmount = discountNum;
      }
    }
    
    // Nếu discountAmount vẫn bằng 0, thử sử dụng itemName làm dự phòng (ví dụ: "Giảm 10%", "Giảm 50K")
    if (discountAmount === 0 && voucher.itemName) {
      const itemName = String(voucher.itemName).toUpperCase();
      
      if (itemName.includes('%')) {
        const percent = parseInt(itemName.replace(/[^0-9]/g, '')) || 0;
        discountAmount = Math.floor((orderTotal * percent) / 100);
      } else if (itemName.includes('K')) {
        const amount = parseInt(itemName.replace(/[^0-9]/g, '')) || 0;
        discountAmount = amount * 1000;
      } else {
        // Giả định là số tiền VNĐ trực tiếp nếu có số trong chuỗi
        const amount = parseInt(itemName.replace(/[^0-9]/g, '')) || 0;
        discountAmount = amount;
      }
    }
    
    // Đảm bảo discountAmount là số hợp lệ
    if (isNaN(discountAmount) || discountAmount < 0) {
      discountAmount = 0;
    }

    // Không giảm quá tổng tiền đơn hàng
    discountAmount = Math.min(discountAmount, orderTotal);

    res.json({ 
      msg: 'Áp dụng mã giảm giá thành công',
      discount: discountAmount,
      finalTotal: Math.max(0, orderTotal - discountAmount),
      voucher
    });
  } catch (err) {
    console.error("Lỗi áp dụng voucher:", err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// 4. ĐÁNH DẤU VOUCHER ĐÃ SỬ DỤNG (sau khi order thành công)
router.put('/use/:code', checkAuth, async (req, res) => {
  try {
    const { code } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Không tìm thấy user' });

    const voucher = user.vouchers.find(v => v.code === code.toUpperCase());
    if (!voucher) return res.status(404).json({ msg: 'Không tìm thấy voucher' });
    if (voucher.isUsed) return res.status(400).json({ msg: 'Voucher đã được sử dụng' });

    voucher.isUsed = true;
    voucher.usedAt = new Date();
    await user.save();

    res.json({ 
      msg: 'Voucher đã được đánh dấu là đã sử dụng', 
      voucher,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        luckySpins: user.luckySpins,
        vouchers: user.vouchers.filter(v => !v.isUsed) // Trả về danh sách voucher chưa dùng để Header cập nhật số lượng
      }
    });
  } catch (err) {
    console.error("Lỗi đánh dấu voucher đã dùng:", err);
    res.status(500).json({ msg: 'Lỗi server khi cập nhật trạng thái voucher' });
  }
});

// 5. USER XÓA VOUCHER KHỎI KHO
router.delete('/:code', checkAuth, async (req, res) => {
  try {
    const { code } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Không tìm thấy user' });

    const voucherIndex = user.vouchers.findIndex(v => v.code === code.toUpperCase());
    if (voucherIndex === -1) return res.status(404).json({ msg: 'Voucher không tồn tại' });

    // Xóa voucher khỏi mảng
    user.vouchers.splice(voucherIndex, 1);
    await user.save();

    res.json({ 
      msg: 'Voucher đã được xóa',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        luckySpins: user.luckySpins,
        vouchers: user.vouchers.filter(v => !v.isUsed)
      }
    });
  } catch (err) {
    console.error("Lỗi xóa voucher:", err);
    res.status(500).json({ msg: 'Lỗi server khi xóa voucher' });
  }
});

module.exports = router;
