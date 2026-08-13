const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User'); // Import model User
const { checkAuth, checkAdmin } = require('../middleware/auth');

// 1. DÀNH CHO KHÁCH: Tạo lệnh nạp tiền mới
router.post('/deposit', checkAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount < 10000) return res.status(400).json({ msg: 'Số tiền nạp tối thiểu là 10.000đ' });

    // Tạo mã chuyển khoản ngẫu nhiên (VD: NAPXB-6A8B)
    const transferCode = 'NAPXB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newTx = new Transaction({
      user: req.user.id,
      amount,
      type: 'DEPOSIT',
      transferCode
    });

    await newTx.save();
    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi tạo lệnh nạp tiền' });
  }
});

// 2. DÀNH CHO KHÁCH: Lấy lịch sử giao dịch của mình
router.get('/my-transactions', checkAuth, async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi lấy lịch sử' });
  }
});

// 3. DÀNH CHO ADMIN: Lấy tất cả lệnh nạp tiền để duyệt
router.get('/admin/all', checkAuth, checkAdmin, async (req, res) => {
  try {
    const txs = await Transaction.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// 4. DÀNH CHO ADMIN: Duyệt (Xác nhận) nạp tiền & Cộng tiền vào ví khách
router.put('/admin/approve/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ msg: 'Không tìm thấy giao dịch' });
    if (tx.status === 'SUCCESS') return res.status(400).json({ msg: 'Giao dịch này đã được duyệt rồi!' });

    // Đổi trạng thái giao dịch thành THÀNH CÔNG
    tx.status = 'SUCCESS';
    await tx.save();

    // CỘNG TIỀN VÀO VÍ KHÁCH HÀNG
    await User.findByIdAndUpdate(tx.user, { $inc: { walletBalance: tx.amount } });

    res.json({ msg: 'Duyệt thành công, đã cộng tiền cho khách!' });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi khi duyệt nạp tiền' });
  }
});

module.exports = router;