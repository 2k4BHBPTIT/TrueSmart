const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { checkAuth, checkAdmin } = require('../middleware/auth');
const SystemLog = require('../models/SystemLog');

router.get('/', async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 16, condition } = req.query;
    let query = {};
    const trimmedSearch = search ? String(search).trim() : '';

    if (trimmedSearch) {
      const words = trimmedSearch.split(/\s+/).filter(Boolean);
      const andConditions = [];
      const searchFields = [
        { name: { $regex: trimmedSearch, $options: 'i' } },
        { category: { $regex: trimmedSearch, $options: 'i' } },
        { brand: { $regex: trimmedSearch, $options: 'i' } },
        { condition: { $regex: trimmedSearch, $options: 'i' } },
        { description: { $regex: trimmedSearch, $options: 'i' } }
      ];

      if (words.length === 1) {
        query.$or = searchFields;
      } else {
        const orPerWord = words.map((word) => [
          { name: { $regex: word, $options: 'i' } },
          { category: { $regex: word, $options: 'i' } },
          { brand: { $regex: word, $options: 'i' } },
          { condition: { $regex: word, $options: 'i' } },
          { description: { $regex: word, $options: 'i' } }
        ]);
        query.$and = orPerWord.map((ors) => ({ $or: ors }));
      }
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (condition) {
      query.condition = condition;
    }

    let sortOptions = {};
    if (sort === 'price-asc') sortOptions.price = 1;
    if (sort === 'price-desc') sortOptions.price = -1;

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .select('-importPrice')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi lấy dữ liệu sản phẩm' });
  }
});

router.get('/get-featured', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isFeatured: true };
    if (category) {
      query.category = category;
    }
    const featuredProducts = await Product.find(query).sort({ createdAt: -1 });
    res.json(featuredProducts);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi lấy sản phẩm nổi bật' });
  }
});

router.get('/admin/all', checkAuth, checkAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

router.put('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const allowedFields = ['name', 'category', 'price', 'importPrice', 'description', 'image', 'stock', 'countInStock', 'sold', 'isFeatured', 'rating', 'numReviews'];

    const filteredData = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: filteredData },
      { new: true, runValidators: true }
    ).select('-importPrice');

    if (!updatedProduct) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });

    res.json(updatedProduct);
  } catch (err) {
    console.error('Lỗi khi cập nhật sản phẩm:', err);
    res.status(500).json({ msg: 'Lỗi cập nhật', error: err.message });
  }
});

router.delete('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });

    await SystemLog.create({
      admin: req.user?.id,
      action: 'DELETE_PRODUCT',
      details: `Đã xóa sản phẩm: ${product.name} (ID: ${req.params.id})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'Unknown'
    });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Đã xóa sản phẩm', productId: req.params.id });
  } catch (err) {
    console.error('Lỗi khi xóa sản phẩm:', err);
    res.status(500).json({ msg: 'Lỗi khi xóa sản phẩm', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-importPrice');
    if (!product) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

router.post('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { name, price, category, description, countInStock, isFeatured } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ msg: 'Vui lòng nhập tên, giá và danh mục' });
    }

    const newProduct = new Product({
      name,
      category,
      price,
      importPrice: req.body.importPrice || 0,
      description: description || '',
      countInStock: countInStock || 0,
      stock: countInStock || 0,
      image: req.body.image || '/uploads/no-image.jpg',
      isFeatured: isFeatured || false
    });

    await newProduct.save();

    await SystemLog.create({
      admin: req.user?.id,
      action: 'CREATE_PRODUCT',
      details: `Đã tạo sản phẩm ID: ${newProduct._id}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'Unknown'
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Lỗi khi tạo sản phẩm:', err);
    res.status(500).json({ msg: 'Lỗi tạo sản phẩm', error: err.message });
  }
});

module.exports = router;