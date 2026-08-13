// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { checkAuth, checkAdmin } = require('../middleware/auth');

// ==========================================
// USER MANAGEMENT ENDPOINTS (Admin only)
// ==========================================

// API Xóa người dùng (Chỉ Admin)
router.delete('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Người dùng không tồn tại' });
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'Bạn không thể tự xóa tài khoản của chính mình!' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Đã xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server khi xóa người dùng' });
  }
});

// API Cập nhật người dùng (Chỉ Admin)
router.put('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { name, email, role, walletBalance, luckySpins } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Người dùng không tồn tại' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    if (walletBalance !== undefined) user.walletBalance = walletBalance;
    if (luckySpins !== undefined) user.luckySpins = luckySpins;

    await user.save();
    res.json({ msg: 'Cập nhật người dùng thành công', user });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server khi cập nhật người dùng' });
  }
});

// API Lấy tất cả người dùng cho Admin
router.get('/all', checkAuth, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server khi lấy người dùng' });
  }
});

router.post('/claim-prize', checkAuth, async (req, res) => {
  try {
    const { prize } = req.body;
    const user = await User.findById(req.user.id);

    if (user.luckySpins <= 0) return res.status(400).json({ msg: 'Bạn đã hết lượt quay!' });

    user.luckySpins -= 1;
    let newVoucherCode = null;

    if (prize.type !== 'miss') {
      newVoucherCode = 'XBIL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); 

      let discountAmt = 0;
      if (prize.text.includes('50K')) discountAmt = 50000;
      if (prize.text.includes('100K')) discountAmt = 100000;

      user.vouchers.push({
        code: newVoucherCode,
        itemName: prize.text, 
        type: prize.type,     
        discountAmt: discountAmt,
        expiryDate: expiryDate
      });
    }

    await user.save();
    res.json({ success: true, luckySpins: user.luckySpins, voucherCode: newVoucherCode });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server khi nhận thưởng' });
  }
});

router.post('/deposit', checkAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ msg: 'Số tiền nạp không hợp lệ' });

    const user = await User.findById(req.user.id);
    user.walletBalance += Number(amount);
    await user.save();

    res.json({ success: true, walletBalance: user.walletBalance, msg: `Đã nạp thành công!` });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server khi nạp tiền' });
  }
});

router.post('/address', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedAddresses.push(req.body); 
    await user.save();
    res.json({ msg: 'Đã thêm địa chỉ', addresses: user.savedAddresses });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

router.get('/wishlist', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

router.post('/wishlist', checkAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    
    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId); 
    } else {
      user.wishlist.splice(index, 1); 
    }
    
    await user.save();
    res.json({ msg: 'Đã cập nhật Wishlist' });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'Email này chưa được đăng ký trong hệ thống!' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const message = `<div style="padding: 20px; text-align: center;"><h2>Mã OTP của bạn là: ${otp}</h2></div>`;
    // Nhớ cấu hình hàm sendEmail của bạn cho đúng
    // await sendEmail({ email: user.email, subject: 'Mã xác nhận', message: message });

    res.status(200).json({ message: 'Mã xác nhận đã được gửi đến email của bạn!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ! Không thể gửi email lúc này.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email, resetPasswordOTP: otp, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn!' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải từ 6 ký tự trở lên!' });

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đặt lại mật khẩu.' });
  }
});

router.put('/address/default/:addressId', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedAddresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === req.params.addressId;
    });
    await user.save();
    res.json({ msg: 'Đã đặt địa chỉ mặc định!', addresses: user.savedAddresses });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// API Xóa địa chỉ đã lưu
router.delete('/address/:addressId', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Không tìm thấy người dùng' });

    // Lọc bỏ địa chỉ có ID khớp với tham số truyền vào
    user.savedAddresses = user.savedAddresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );

    await user.save();
    res.json({ msg: 'Đã xóa địa chỉ thành công', addresses: user.savedAddresses });
  } catch (err) {
    console.error("Lỗi xóa địa chỉ:", err);
    res.status(500).json({ msg: 'Lỗi server khi xóa địa chỉ' });
  }
});

module.exports = router;