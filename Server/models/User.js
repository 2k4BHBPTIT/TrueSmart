const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true,
    minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Tên không được quá 50 ký tự'],
    match: [/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng']
  },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  walletBalance: { 
    type: Number, 
    default: 0,
    min: [0, 'Số dư ví không được âm']
  },
  luckySpins: { 
    type: Number, 
    default: 0,
    min: [0, 'Số lượt quay không được âm']
  },
  vouchers: [
    {
      code: { type: String, required: true },
      discountAmt: { type: Number, required: true, min: [0, 'Giảm giá không được âm'] },
      itemName: String, 
      expiryDate: { type: Date, required: true },
      isUsed: { type: Boolean, default: false },
      usedAt: Date,
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }
  ],
  wishlist: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  savedAddresses: [{
    name: { type: String, required: true },
    phone: { type: String, required: true, validate: /^\d{10}$/ },
    address: { type: String, required: true },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    detail: { type: String },
    type: { type: String, enum: ['Nhà riêng', 'Cơ quan', 'Khách', 'Club Bida'], default: 'Nhà riêng' },
    isDefault: { type: Boolean, default: false }
  }],
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  lastLoginAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Indexes for better query performance
UserSchema.index({ role: 1 });

let User = mongoose.models.User;
if (!User) {
  User = mongoose.model('User', UserSchema);
}
module.exports = User;