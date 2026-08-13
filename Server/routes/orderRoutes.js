// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product'); // Thêm import Product model
const { checkAuth, checkAdmin } = require('../middleware/auth'); // Middleware kiểm tra Token + Admin
const sendEmail = require('../utils/sendEmail');

router.post('/', checkAuth, async (req, res) => {
  try {
    const { orderItems, shippingAddress, phone, paymentMethod, totalPrice, shippingFee, province } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ msg: 'Giỏ hàng trống!' });
    }
    if (!shippingAddress || !phone || !paymentMethod) {
      return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ thông tin giao hàng và thanh toán!' });
    }

    // ====================================================
    // BƯỚC 1: LẤY GIÁ SẢN PHẨM TỪ DB (CHỐNG CHỈNH SỬA F12)
    // ====================================================
    const productIds = orderItems.map(i => i?.product || i?._id).filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).select('_id name price countInStock image sold').lean();
    const dbProductMap = {};
    dbProducts.forEach(p => dbProductMap[String(p._id)] = p);

    // ====================================================
    // BƯỚC 2: VALIDATE TỪNG SẢN PHẨM & TÍNH SUBTOTAL TỐI THIỂU
    // ====================================================
    const validOrderItems = [];
    let subtotal = 0;
    let totalQty = 0;

    for (let i = 0; i < orderItems.length; i++) {
      const raw = orderItems[i] || {};
      const pid = String(raw.product || raw._id || '').trim();
      const db = dbProductMap[pid];

      if (!db) {
        return res.status(400).json({ msg: `Sản phẩm thứ ${i + 1} không tồn tại trong hệ thống!` });
      }

      const qty = Math.max(1, Math.min(99, parseInt(raw.quantity || raw.qty, 10) || 1));
      if (qty > Number(db.countInStock || 0)) {
        return res.status(400).json({
          msg: `Sản phẩm "${db.name}" không đủ tồn kho (Còn ${db.countInStock} / Yêu cầu ${qty})!`
        });
      }

      const realPrice = Math.max(0, Number(db.price) || 0);
      subtotal += realPrice * qty;
      totalQty += qty;

      validOrderItems.push({
        name: raw.name ? String(raw.name) : String(db.name),
        quantity: qty,
        image: raw.image || db.image || 'https://via.placeholder.com/300',
        price: realPrice,
        product: db._id
      });
    }

    // ====================================================
    // BƯỚC 3: TÍNH SHIPPING FEE TỪ BACKEND
    // ====================================================
    let backendShipping = 0;
    if (province) {
      const provStr = String(province);
      backendShipping = (provStr === '1' || provStr === '79') ? 30000 : 40000;
      if (totalQty > 2) backendShipping += (totalQty - 2) * 5000;
      if (subtotal >= 3000000) backendShipping = 0;
    } else {
      backendShipping = Math.min(Math.max(0, Number(shippingFee) || 0), 100000);
    }

    // ====================================================
    // BƯỚC 4: TÍNH TỔNG FINAL VÀ SO SÁNH VỚI CLIENT (5% TOLERANCE)
    // ====================================================
    const backendTotal = Math.max(0, subtotal + backendShipping);
    const clientTotal = Math.max(0, Number(totalPrice) || 0);
    if (clientTotal > 0) {
      const diffPct = Math.abs(backendTotal - clientTotal) / Math.max(backendTotal, 1) * 100;
      if (diffPct > 5) {
        return res.status(400).json({
          msg: 'Tổng tiền đơn hàng không khớp hệ thống. Vui lòng làm mới (F5) trang và đặt lại!'
        });
      }
    }
    const finalTotalPrice = backendTotal;

    // ====================================================
    // BƯỚC 5: XỬ LÝ THANH TOÁN & LƯỢT QUAY
    // ====================================================
    const userDoc = await User.findById(req.user.id);
    if (!userDoc) return res.status(404).json({ msg: 'Không tìm thấy thông tin người dùng' });

    let orderPaid = false;
    let newStatus = 'Chờ xác nhận';
    let spinsAdded = 0;

    if (paymentMethod === 'Ví TrueSmart') {
      if (Number(userDoc.walletBalance || 0) < finalTotalPrice) {
        return res.status(400).json({ msg: 'Số dư ví không đủ! Vui lòng nạp thêm tiền.' });
      }
      userDoc.walletBalance = Number(userDoc.walletBalance || 0) - finalTotalPrice;
      orderPaid = true;
      newStatus = 'Đã thanh toán';

      validOrderItems.forEach(item => {
        if (Number(item.price) >= 2000000) {
          spinsAdded += Math.max(1, parseInt(item.quantity, 10) || 1);
        }
      });
      if (spinsAdded > 0) {
        userDoc.luckySpins = Number(userDoc.luckySpins || 0) + spinsAdded;
      }
    }

    // ====================================================
    // BƯỚC 6: TẠO ĐƠN HÀNG
    // ====================================================
    const newOrder = new Order({
      user: req.user.id,
      orderItems: validOrderItems,
      shippingAddress,
      phone,
      paymentMethod,
      totalPrice: finalTotalPrice,
      shippingFee,
      province,
      isPaid: orderPaid,
      paidAt: orderPaid ? Date.now() : null,
      status: newStatus,
    });
    const savedOrder = await newOrder.save();

    // ====================================================
    // BƯỚC 7: LƯU USER (VÍ + LƯỢT QUAY)
    // ====================================================
    if (paymentMethod === 'Ví TrueSmart') {
      await userDoc.save();
    }

    // ====================================================
    // BƯỚC 8: CẬP NHẬT TỒN KHO (atomic $inc)
    // ====================================================
    const updateStockPromises = validOrderItems.map(item =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.quantity, sold: item.quantity }
      })
    );
    await Promise.all(updateStockPromises);

    const extraMsg = spinsAdded > 0
      ? { msg: `Đặt hàng thành công! Bạn được cộng thêm ${spinsAdded} lượt quay may mắn.` }
      : { msg: 'Đặt hàng thành công!' };

    // Send order confirmation email
    try {
      const itemsList = validOrderItems.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.price.toLocaleString('vi-VN')} đ</td>
          <td>${(item.price * item.quantity).toLocaleString('vi-VN')} đ</td>
        </tr>
      `).join('');

      const emailMessage = `
        <h2>Xác nhận đơn hàng #${savedOrder._id}</h2>
        <p>Cảm ơn bạn đã mua sắm tại TrueSmart!</p>
        <table border="1" cellpadding="10" cellspacing="0" width="100%">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Giá</th>
              <th>Tổng</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        <p><strong>Địa chỉ giao hàng:</strong> ${shippingAddress}</p>
        <p><strong>Tỉnh/Thành:</strong> ${province}</p>
        <p><strong>Số điện thoại:</strong> ${phone}</p>
        <p><strong>Phương thức thanh toán:</strong> ${paymentMethod}</p>
        <p><strong>Tổng tiền:</strong> ${finalTotalPrice.toLocaleString('vi-VN')} đ</p>
        <p><strong>Trạng thái:</strong> ${newStatus}</p>
        <p>Chúng tôi sẽ xác nhận đơn hàng của bạn sớm.</p>
      `;

      await sendEmail({
        email: userDoc.email,
        subject: `Xác nhận đơn hàng #${savedOrder._id}`,
        message: emailMessage
      });
    } catch (emailErr) {
      console.error('Error sending order confirmation email:', emailErr);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      order: savedOrder,
      newBalance: userDoc.walletBalance,
      updatedStocks: true,
      ...extraMsg
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ msg: 'Lỗi tạo đơn hàng', error: err?.message });
  }
});

// 2. LẤY TẤT CẢ ĐƠN HÀNG (DÀNH CHO ADMIN)
router.get('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Lỗi lấy đơn hàng:', err);
    res.status(500).json({ msg: 'Lỗi server khi lấy danh sách đơn hàng' });
  }
});

// 3. LẤY TẤT CẢ ĐƠN HÀNG (ALIAS /ALL DÀNH CHO ADMIN)
router.get('/all', checkAuth, checkAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Lỗi lấy đơn hàng:', err);
    res.status(500).json({ msg: 'Lỗi server khi lấy danh sách đơn hàng' });
  }
});

// 4. ADMIN XÁC NHẬN ĐÃ THU TIỀN (KHÔNG TỰ ĐỘNG CHUYỂN THÀNH HOÀN THÀNH)
router.put('/:id/pay', checkAuth, checkAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });

    order.isPaid = true;
    order.paidAt = Date.now();

    // Giữ nguyên trạng thái hiện tại nếu đã có status chuyên biệt,
    // chỉ auto set = 'Đã thanh toán' khi đang ở trạng thái mặc định 'Chờ xác nhận'
    if (!order.status || order.status === 'Chờ xác nhận') {
      order.status = 'Đã thanh toán';
    }
    // Nếu đã ở Đang giao / Hoàn thành / Đã hủy / Đã thanh toán → giữ nguyên

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error('Lỗi cập nhật thanh toán:', err);
    res.status(500).json({ msg: 'Lỗi khi cập nhật thanh toán' });
  }
});

// 5. ADMIN ĐỔI TRẠNG THÁI GIAO HÀNG
router.put('/:id/status', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'email name');

    if (!order) return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });

    const oldStatus = order.status;
    order.status = status;
    const updatedOrder = await order.save();

    // Send status update email
    try {
      const statusMessages = {
        'Chờ xác nhận': 'Đơn hàng của bạn đang chờ được xác nhận',
        'Đã thanh toán': 'Đơn hàng của bạn đã được thanh toán',
        'Đang giao hàng': 'Đơn hàng của bạn đang được giao',
        'Hoàn thành': 'Đơn hàng của bạn đã được giao thành công',
        'Đã hủy': 'Đơn hàng của bạn đã bị hủy'
      };

      const emailMessage = `
        <h2>Cập nhật trạng thái đơn hàng #${order._id}</h2>
        <p>Trạng thái đơn hàng của bạn đã được cập nhật:</p>
        <p><strong>${statusMessages[status] || 'Trạng thái: ' + status}</strong></p>
        <p>Tổng tiền: ${order.totalPrice.toLocaleString('vi-VN')} đ</p>
        <p>Cảm ơn bạn đã mua sắm tại TrueSmart!</p>
      `;

      await sendEmail({
        email: order.user.email,
        subject: `Cập nhật đơn hàng #${order._id}`,
        message: emailMessage
      });
    } catch (emailErr) {
      console.error('Error sending status update email:', emailErr);
      // Don't fail the status update if email fails
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi khi cập nhật trạng thái đơn hàng' });
  }
});

// 6. LẤY LỊCH SỬ MUA HÀNG
router.get('/mine', checkAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Lỗi lấy lịch sử đơn hàng:", err);
    res.status(500).json({ msg: 'Lỗi server khi lấy lịch sử mua hàng' });
  }
});

module.exports = router;