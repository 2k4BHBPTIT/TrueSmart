const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Liên kết với tài khoản người mua
    name: { type: String, required: true }, // Tên người bình luận
    rating: { type: Number, required: true }, // Số sao (1-5)
    comment: { type: String, required: true }, // Nội dung
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true
    },
    importPrice: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Giá nhập không thể là số âm']
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sản phẩm'],
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả sản phẩm']
    },
    category: {
        type: String,
        required: [true, 'Vui lòng chọn danh mục'],
        enum: ['Phones', 'Laptops', 'Tablets', 'Smartwatches', 'Speakers', 'Accessories', 'Repair'],
        trim: true
    },
    condition: {
        type: String,
        default: 'Mới',
        trim: true
    },
  image: {
    type: String,
    default: '/uploads/no-image.jpg'
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Số lượng tồn kho không được âm']
  },
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0, min: [0, 'Đánh giá không được âm'], max: [5, 'Đánh giá tối đa là 5 sao'] },
  numReviews: { type: Number, required: true, default: 0, min: [0, 'Số lượng đánh giá không được âm'] },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Số lượng tồn kho không được âm']
  },
  sold: {
    type: Number,
    default: 0,
    min: [0, 'Số lượng đã bán không được âm']
  },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);