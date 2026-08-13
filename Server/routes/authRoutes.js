const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { register, login } = require('../controllers/authController');
const { checkAuth } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Đăng ký
router.post('/register', register);

// Đăng nhập
router.post('/login', login);

// Lấy thông tin user đang đăng nhập (dựa vào token trong cookie)
router.get('/me', checkAuth, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server khi lấy thông tin người dùng' });
  }
});

// Đăng xuất
router.post('/logout', (req, res) => {
  res
    .cookie('token', '', { maxAge: 0, httpOnly: true })
    .json({ msg: 'Đã đăng xuất' });
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || '973145122274-hm8shq5rv2ueo41kpidijd9pglctnk4v.apps.googleusercontent.com',
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: name,
        email: email,
        password: sub,
        role: 'user',
        walletBalance: 0,
        luckySpins: 0,
        vouchers: []
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'BiMatCuaHuyBich',
      { expiresIn: '7d' }
    );

    res.json({
      msg: 'Đăng nhập Google thành công',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        walletBalance: user.walletBalance, 
        luckySpins: user.luckySpins, 
        vouchers: user.vouchers, 
        savedAddresses: user.savedAddresses 
      }
    });

  } catch (error) {
    console.error("Lỗi Google Login:", error);
    res.status(500).json({ msg: 'Xác thực Google thất bại' });
  }
});

module.exports = router;
