const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, address, phone } = req.body;
    const newOrder = new Order({
      user: req.user.id, // Lấy từ middleware auth
      items,
      totalPrice,
      address,
      phone
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi khi đặt hàng' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
};