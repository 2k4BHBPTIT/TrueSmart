const Product = require('../models/Product');

// 1. Lấy danh sách sản phẩm (có lọc & phân trang)
exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    let query = { countInStock: { $gt: 0 } }; // Chỉ lấy sp còn hàng

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
};

// 2. Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, importPrice, description, countInStock, condition, weight, tipSize } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '/uploads/no-image.jpg';

    if (!name || !price || !category) {
      return res.status(400).json({ msg: 'Vui lòng nhập đủ thông tin bắt buộc' });
    }

    const newProduct = new Product({
      name,
      category,
      price,
      importPrice: importPrice || 0,
      description,
      countInStock: countInStock || 0,
      stock: countInStock || 0,
      condition: condition || 'Mới',
      image,
      specs: { weight, tipSize }
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ msg: 'Dữ liệu không hợp lệ', error: err.message });
  }
};

// 3. Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const updatedData = { ...req.body };
    if (req.file) updatedData.image = `/uploads/${req.file.filename}`;
    if (updatedData.countInStock !== undefined) {
      updatedData.stock = updatedData.countInStock;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    
    res.json(product);
  } catch (err) {
    res.status(400).json({ msg: 'Cập nhật thất bại', error: err.message });
  }
};

// 4. Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    res.json({ msg: 'Đã xóa sản phẩm' });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi khi xóa sản phẩm' });
  }
};