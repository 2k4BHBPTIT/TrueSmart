const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { checkAuth, checkAdmin } = require('../middleware/auth'); // Mở comment nếu bạn đã có middleware này

// 1. Lấy danh sách Nhà cung cấp
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi máy chủ' });
  }
});

// 2. Thêm mới Nhà cung cấp
router.post('/', async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();
    res.json({ msg: 'Đã thêm nhà cung cấp', supplier: newSupplier });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi khi thêm nhà cung cấp' });
  }
});

// 3. Cập nhật thông tin
router.put('/:id', async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ msg: 'Đã cập nhật thành công', supplier: updatedSupplier });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi cập nhật' });
  }
});

// 4. Xóa Nhà cung cấp
router.delete('/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Đã xóa nhà cung cấp' });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi khi xóa' });
  }
});

module.exports = router;