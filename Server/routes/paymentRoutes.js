const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const qs = require('qs');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { checkAuth } = require('../middleware/auth');

const vnp_TmnCode = "SDS2YVBM";
const vnp_HashSecret = "VOFDMCWFS5SB5HA916E62T4J8VHWUYJA";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

// FRONTEND_RETURN_URL: sau khi user thanh toán xong, redirect về trang nào của FE
const FRONTEND_URL = process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production'
     ? 'https://truesmart.vercel.app'
    : 'http://localhost:3000');
const vnp_ReturnUrl = `${FRONTEND_URL}/payments/vnpay-return`;
const momo_ReturnUrl = `${FRONTEND_URL}/payments/momo-return`;

// TXNREF_MAP: vnp_TxnRef / MoMo orderId <-> MongoDB Order._id (in-memory cache)
// Lưu ý: Khi scale multi-instance nên dùng Redis. Với 1 server đủ ổn trong thời gian payment < 30 phút
const txnRefToOrderId = new Map();
function cleanupOldTxnRefs() {
  const now = Date.now();
  const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 tiếng
  for (const [k, v] of txnRefToOrderId.entries()) {
    if (now - (v?.createdAt || 0) > MAX_AGE_MS) {
      txnRefToOrderId.delete(k);
    }
  }
}
setInterval(cleanupOldTxnRefs, 15 * 60 * 1000).unref();

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// ============================================================
// XỬ LÝ TẠO ĐƠN HÀNG CHO THANH TOÁN ONLINE
// ============================================================
async function createPendingOrderForOnlinePayment(req, res) {
  try {
    const { orderItems, shippingAddress, phone, shippingFee, province, bankCode } = req.body;
    const paymentMethod = (bankCode === 'MoMo' || bankCode === 'VNPay') ? String(bankCode) : 'VNPay';

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return { error: { code: 400, msg: 'Giỏ hàng trống!' } };
    }
    if (!shippingAddress || !phone) {
      return { error: { code: 400, msg: 'Vui lòng nhập đầy đủ thông tin giao hàng!' } };
    }
    if (!req.user || !req.user.id) {
      return { error: { code: 401, msg: 'Vui lòng đăng nhập để thanh toán!' } };
    }

    // Bước 1: Lấy giá + tồn kho từ DB
    const productIds = orderItems.map(i => i?.product || i?._id).filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).select('_id name price countInStock image sold').lean();
    const dbMap = {};
    dbProducts.forEach(p => dbMap[String(p._id)] = p);

    const validItems = [];
    let subtotal = 0;
    let totalQty = 0;

    for (let i = 0; i < orderItems.length; i++) {
      const raw = orderItems[i] || {};
      const pid = String(raw.product || raw._id || '').trim();
      const db = dbMap[pid];
      if (!db) return { error: { code: 400, msg: `Sản phẩm thứ ${i + 1} không tồn tại trong hệ thống!` } };

      const qty = Math.max(1, Math.min(99, parseInt(raw.quantity || raw.qty, 10) || 1));
      if (qty > Number(db.countInStock || 0)) {
        return { error: { code: 400, msg: `Sản phẩm "${db.name}" không đủ tồn kho!` } };
      }
      const realPrice = Math.max(0, Number(db.price) || 0);
      subtotal += realPrice * qty;
      totalQty += qty;
      validItems.push({
        name: raw.name ? String(raw.name) : String(db.name),
        quantity: qty,
        image: raw.image || db.image || 'https://via.placeholder.com/300',
        price: realPrice,
        product: db._id
      });
    }

    // Bước 2: Tính shipping backend
    let backendShipping = 0;
    if (province) {
      const pStr = String(province);
      backendShipping = (pStr === '1' || pStr === '79') ? 30000 : 40000;
      if (totalQty > 2) backendShipping += (totalQty - 2) * 5000;
      if (subtotal >= 3000000) backendShipping = 0;
    } else {
      backendShipping = Math.min(Math.max(0, Number(shippingFee) || 0), 100000);
    }
    const finalTotal = Math.max(0, subtotal + backendShipping);

    // Bước 3: Tạo đơn HÀNG CHƯA THANH TOÁN
    const userDoc = await User.findById(req.user.id);
    if (!userDoc) return { error: { code: 404, msg: 'Không tìm thấy thông tin người dùng' } };

    const newOrder = new Order({
      user: userDoc._id,
      orderItems: validItems,
      shippingAddress,
      phone,
      paymentMethod,
      totalPrice: finalTotal,
      isPaid: false,
      paidAt: null,
      status: 'Chờ xác nhận'
    });
    const savedOrder = await newOrder.save();

    // Không giảm tồn kho ở đây (chưa thanh toán). GIẢM KHI RETURN THÀNH CÔNG.

    return {
      order: savedOrder,
      userDoc,
      validItems,
      subtotal,
      finalTotal
    };
  } catch (e) {
    console.error('Lỗi tạo pending order:', e);
    return { error: { code: 500, msg: `Lỗi hệ thống: ${e?.message}` } };
  }
}

// ============================================================
// 1. TẠO URL THANH TOÁN (VNPay / MoMo)
// ============================================================
router.post('/create-url', checkAuth, async (req, res) => {
  try {
    const result = await createPendingOrderForOnlinePayment(req, res);
    if (result.error) {
      return res.status(result.error.code).json({ msg: result.error.msg });
    }

    const { order, finalTotal } = result;

    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress || '127.0.0.1';

    const date = new Date();
    const createDate =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0') +
      date.getHours().toString().padStart(2, '0') +
      date.getMinutes().toString().padStart(2, '0') +
      date.getSeconds().toString().padStart(2, '0');

    const bankCode = (req.body.bankCode === 'MoMo' ? '' : req.body.vnp_BankCode) || '';
    const txnRef = `TS${String(order._id)}${date.getSeconds()}`;

    // Lưu mapping txnRef -> orderId
    txnRefToOrderId.set(txnRef, { orderId: String(order._id), createdAt: Date.now() });

    if (req.body.bankCode === 'MoMo') {
      // MoMo sandbox - tạo redirect URL đơn giản (không cần signature đúng cho sandbox demo)
      // Production MoMo cần POST createOrder sang MOMO server nhận payUrl
      const momoPayload = {
        orderId: txnRef,
        amount: finalTotal,
        orderInfo: encodeURIComponent(`Thanh toán đơn hàng TrueSmart #${String(order._id).slice(-6)}`),
        returnUrl: momo_ReturnUrl,
        notifyUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/momo-ipn`
      };
      const payUrl = `https://test-payment.momo.vn/gw_payment/transactionProcessor?partnerCode=MOMOBJCL20200919&accessKey=3MIq46aV0eKz60fL&orderId=${momoPayload.orderId}&amount=${momoPayload.amount}&orderInfo=${momoPayload.orderInfo}&returnUrl=${encodeURIComponent(momoPayload.returnUrl)}&notifyUrl=${encodeURIComponent(momoPayload.notifyUrl)}&extraData=&requestId=${Date.now()}&requestType=captureMoMoWallet&signature=demo`;
      return res.status(200).json({ payUrl, orderId: order._id, txnRef });
    }

    // VNPay default
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = txnRef;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${String(order._id).slice(-6)}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = Math.max(0, finalTotal) * 100;
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    const finalPayUrl = vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });
    return res.status(200).json({ payUrl: finalPayUrl, orderId: order._id, txnRef });
  } catch (error) {
    console.error("Lỗi tạo payment URL:", error);
    res.status(500).json({ msg: "Lỗi server khi tạo link thanh toán" });
  }
});

// ============================================================
// 2. VNPay RETURN (user nhấn "Quay lại website")
// ============================================================
router.get('/vnpay-return', async (req, res) => {
  try {
    const query = req.query;
    const secureHash = query['vnp_SecureHash'];
    const txnRef = query['vnp_TxnRef'];
    const responseCode = query['vnp_ResponseCode'];

    // Xác minh signature VNPay
    const origQuery = { ...query };
    delete origQuery['vnp_SecureHash'];
    delete origQuery['vnp_SecureHashType'];
    const sortedQuery = sortObject(origQuery);
    const signData = qs.stringify(sortedQuery, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const computedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    let status = 'failed';
    let orderId = null;

    const ref = txnRefToOrderId.get(txnRef);
    orderId = ref?.orderId || null;

    if (String(secureHash).toLowerCase() === String(computedHash).toLowerCase()) {
      if (responseCode === '00' || responseCode === '0') {
        // Thành công
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            if (!order.status || order.status === 'Chờ xác nhận') order.status = 'Đã thanh toán';
            await order.save();

            // GIẢM TỒN KHO
            const validItems = Array.isArray(order.orderItems) ? order.orderItems : [];
            const stockUpdates = validItems.map(it => {
              const q = Math.max(1, parseInt(it.quantity || 1, 10) || 1);
              return Product.findByIdAndUpdate(it.product, {
                $inc: { countInStock: -q, sold: q }
              }).catch(() => null);
            });
            await Promise.all(stockUpdates);

            // CỘNG LƯỢT QUAY (nếu SP >= 2tr)
            try {
              let spins = 0;
              validItems.forEach(it => {
                if (Number(it.price) >= 2000000) spins += (parseInt(it.quantity, 10) || 1);
              });
              if (spins > 0) {
                const u = await User.findById(order.user);
                if (u) {
                  u.luckySpins = (Number(u.luckySpins) || 0) + spins;
                  await u.save();
                }
              }
            } catch (_) {}

            status = 'success';
          } else if (order && order.isPaid) {
            status = 'success'; // đã thanh toán rồi
          }
        }
      }
    }

    // Redirect về Frontend trang Profile Orders với queryparam status
    res.redirect(`${FRONTEND_URL}/profile/orders?payment=${status}${orderId ? '&orderId=' + orderId : ''}`);
  } catch (e) {
    console.error('VNPay return error:', e);
    res.redirect(`${FRONTEND_URL}/profile/orders?payment=failed`);
  }
});

// ============================================================
// 3. MoMo RETURN
// ============================================================
router.get('/momo-return', async (req, res) => {
  try {
    const { orderId, errorCode } = req.query;
    let status = 'failed';
    let finalOrderId = null;
    const ref = orderId ? txnRefToOrderId.get(orderId) : null;
    finalOrderId = ref?.orderId || null;

    if ((!errorCode || errorCode === '0' || errorCode === 0) && finalOrderId) {
      const order = await Order.findById(finalOrderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        if (!order.status || order.status === 'Chờ xác nhận') order.status = 'Đã thanh toán';
        await order.save();

        const items = Array.isArray(order.orderItems) ? order.orderItems : [];
        await Promise.all(items.map(it => {
          const q = Math.max(1, parseInt(it.quantity || 1, 10) || 1);
          return Product.findByIdAndUpdate(it.product, { $inc: { countInStock: -q, sold: q } }).catch(() => null);
        }));

        // Lượt quay
        try {
          let spins = 0;
          items.forEach(it => { if (Number(it.price) >= 2000000) spins += (parseInt(it.quantity, 10) || 1); });
          if (spins > 0) {
            const u = await User.findById(order.user);
            if (u) { u.luckySpins = (Number(u.luckySpins) || 0) + spins; await u.save(); }
          }
        } catch (_) {}
        status = 'success';
      } else if (order && order.isPaid) {
        status = 'success';
      }
    }
    res.redirect(`${FRONTEND_URL}/profile/orders?payment=${status}${finalOrderId ? '&orderId=' + finalOrderId : ''}`);
  } catch (e) {
    console.error('MoMo return error:', e);
    res.redirect(`${FRONTEND_URL}/profile/orders?payment=failed`);
  }
});

// ============================================================
// 4. VNPay IPN (Server to Server notification) - Chỉ log + xác minh, ko duplicate update
// ============================================================
router.get('/vnpay-ipn', async (req, res) => {
  try {
    const query = req.query;
    const secureHash = query['vnp_SecureHash'];
    const orig = { ...query };
    delete orig['vnp_SecureHash'];
    delete orig['vnp_SecureHashType'];
    const sorted = sortObject(orig);
    const signData = qs.stringify(sorted, { encode: false });
    const computedHash = crypto.createHmac("sha512", vnp_HashSecret).update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (String(secureHash).toLowerCase() !== computedHash.toLowerCase()) {
      return res.json({ RspCode: '97', Message: 'Fail checksum' });
    }
    const txnRef = query['vnp_TxnRef'];
    const responseCode = query['vnp_ResponseCode'];
    const ref = txnRefToOrderId.get(txnRef);
    if (ref) {
      const order = await Order.findById(ref.orderId);
      if (order && !order.isPaid && (responseCode === '00' || responseCode === '0')) {
        order.isPaid = true;
        order.paidAt = Date.now();
        if (!order.status || order.status === 'Chờ xác nhận') order.status = 'Đã thanh toán';
        await order.save();

        // Giảm stock
        const items = Array.isArray(order.orderItems) ? order.orderItems : [];
        await Promise.all(items.map(it => {
          const q = Math.max(1, parseInt(it.quantity || 1, 10) || 1);
          return Product.findByIdAndUpdate(it.product, { $inc: { countInStock: -q, sold: q } }).catch(() => null);
        }));
      }
    }
    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (e) {
    console.error('VNPay IPN err:', e);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
});

module.exports = router;
