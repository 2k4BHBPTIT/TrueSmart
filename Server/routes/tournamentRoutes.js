const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const { checkAuth, checkAdmin } = require('../middleware/auth');

// GET all tournaments (public)
router.get('/', async (req, res) => {
  try {
    const { status, class: classFilter } = req.query;
    let query = {};
    if (status) query.status = status;
    if (classFilter) query.class = classFilter;

    const tournaments = await Tournament.find(query)
      .populate('players.user', 'name email role')
      .sort({ date: -1 });

    res.json({ tournaments });
  } catch (err) {
    console.error("Lỗi lấy danh sách giải đấu:", err);
    res.status(500).json({ msg: 'Lỗi server khi lấy danh sách giải đấu' });
  }
});

// GET single tournament (public)
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('players.user', 'name email role walletBalance');
    if (!tournament) {
      return res.status(404).json({ msg: 'Không tìm thấy giải đấu' });
    }
    res.json({ tournament });
  } catch (err) {
    console.error("Lỗi lấy thông tin giải đấu:", err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// REGISTER for tournament (protected - login required)
router.post('/:id/register', checkAuth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ msg: 'Không tìm thấy giải đấu' });
    }

    if (tournament.status !== 'registering' && tournament.status !== 'upcoming') {
      return res.status(400).json({ msg: 'Giải đấu không còn nhận đăng ký' });
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      return res.status(400).json({ msg: 'Giải đấu đã đủ số lượng cơ thủ' });
    }

    const isRegistered = tournament.players.some(
      p => p.user.toString() === req.user.id
    );
    if (isRegistered) {
      return res.status(400).json({ msg: 'Bạn đã đăng ký giải đấu này rồi' });
    }

    tournament.players.push({ user: req.user.id });
    await tournament.save();

    res.json({ msg: 'Đăng ký giải đấu thành công!', tournament });
  } catch (err) {
    console.error("Lỗi đăng ký giải đấu:", err);
    res.status(500).json({ msg: 'Lỗi server khi đăng ký' });
  }
});

// UNREGISTER from tournament (protected)
router.post('/:id/unregister', checkAuth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ msg: 'Không tìm thấy giải đấu' });
    }

    if (tournament.status === 'ongoing' || tournament.status === 'completed') {
      return res.status(400).json({ msg: 'Không thể hủy đăng ký khi giải đã bắt đầu hoặc kết thúc' });
    }

    tournament.players = tournament.players.filter(
      p => p.user.toString() !== req.user.id
    );
    await tournament.save();

    res.json({ msg: 'Hủy đăng ký thành công', tournament });
  } catch (err) {
    console.error("Lỗi hủy đăng ký:", err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// CREATE tournament (admin only)
router.post('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const tournament = new Tournament(req.body);
    await tournament.save();
    res.status(201).json({ msg: 'Tạo giải đấu thành công', tournament });
  } catch (err) {
    console.error("Lỗi tạo giải đấu:", err);
    res.status(500).json({ msg: 'Lỗi server khi tạo giải đấu' });
  }
});

// UPDATE tournament (admin only)
router.put('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!tournament) {
      return res.status(404).json({ msg: 'Không tìm thấy giải đấu' });
    }
    res.json({ msg: 'Cập nhật giải đấu thành công', tournament });
  } catch (err) {
    console.error("Lỗi cập nhật giải đấu:", err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// DELETE tournament (admin only)
router.delete('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ msg: 'Không tìm thấy giải đấu' });
    }
    res.json({ msg: 'Xóa giải đấu thành công' });
  } catch (err) {
    console.error("Lỗi xóa giải đấu:", err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

module.exports = router;
