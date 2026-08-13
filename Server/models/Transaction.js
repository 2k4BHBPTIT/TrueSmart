const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['DEPOSIT', 'WITHDRAW', 'PAYMENT'], default: 'DEPOSIT' },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  transferCode: { type: String, required: true }, // Mã chuyển khoản (VD: NAPXB12345)
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);