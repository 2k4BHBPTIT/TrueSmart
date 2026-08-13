const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
    }],
    shippingAddress: { type: String, required: true },
    province: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    status: { type: String, default: 'Chờ xác nhận', enum: ['Chờ xác nhận', 'Đã thanh toán', 'Đang giao hàng', 'Hoàn thành', 'Đã hủy']}
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);