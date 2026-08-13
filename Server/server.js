require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// TỐI ƯU 1: Require Model một lần duy nhất ở đây
const Chat = require('./models/chat'); 
const Product = require('./models/Product');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Danh sách các URL được phép truy cập
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3002',
];
const envOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(',').map((u) => u.trim()).filter(Boolean)
  : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins, process.env.FRONTEND_URL].filter(Boolean))];
console.log('🌐 CORS allowedOrigins:', allowedOrigins);

// TỐI ƯU 2: Cấp quyền CORS cho Socket.io giống hệt Express
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});
const rooms = {};

const buildBotReply = async (message) => {
  const text = String(message || '').toLowerCase();
  const productQuery = text.match(/(iphone|samsung|xiaomi|oppo|vivo|laptop|loa|tai nghe|airpods|apple watch|ipad|macbook|màn hình|pin|sạc|phụ kiện|bảo hành|giá|trả góp|khuyến mãi)/i);

  if (/giá|bao nhiêu|mức giá|price/i.test(text)) {
    return 'Chúng tôi có nhiều mẫu phù hợp với từng ngân sách. Bạn có thể cho tôi biết bạn muốn tìm sản phẩm nào như iPhone, Samsung, loa, laptop, phụ kiện... để tôi gợi ý đúng nhất.';
  }

  if (/bảo hành|đổi trả|hỗ trợ|sửa chữa|lỗi/i.test(text)) {
    return 'TrueSmart hỗ trợ bảo hành chính hãng, đổi trả theo chính sách và tư vấn sửa chữa. Nếu bạn cho tôi biết sản phẩm đang gặp vấn đề, tôi sẽ đề xuất hướng xử lý phù hợp.';
  }

  if (/trả góp|góp|thanh toán/i.test(text)) {
    return 'Chúng tôi có hỗ trợ trả góp với nhiều chương trình ưu đãi. Bạn có thể hỏi về mẫu sản phẩm cụ thể để tôi gợi ý phương án phù hợp.';
  }

  if (/khuyến mãi|sale|giảm giá|ưu đãi/i.test(text)) {
    return 'Hiện tại có nhiều chương trình flash sale và ưu đãi cho sản phẩm mới. Nếu bạn cần, tôi có thể gợi ý các sản phẩm đang được quan tâm hoặc phù hợp với nhu cầu của bạn.';
  }

  if (productQuery) {
    const keyword = productQuery[1];
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    }).limit(3).lean();

    if (products.length > 0) {
      const list = products.map((p) => `- ${p.name} (${p.price?.toLocaleString('vi-VN')}đ)`).join('\n');
      return `Dựa trên nhu cầu của bạn, tôi đề xuất các sản phẩm phù hợp:\n${list}\n\nBạn muốn tôi giới thiệu thêm mẫu cao cấp hơn, giá rẻ hơn hay phù hợp cho công việc/game không?`;
    }
  }

  if (/đề xuất|gợi ý|tư vấn|muốn|cần|nhu cầu/i.test(text)) {
    const products = await Product.find({ isFeatured: true }).limit(4).lean();
    if (products.length > 0) {
      const list = products.map((p) => `- ${p.name} (${p.price?.toLocaleString('vi-VN')}đ)`).join('\n');
      return `Tôi gợi ý cho bạn các sản phẩm nổi bật:\n${list}\n\nBạn muốn tôi ưu tiên theo mức giá, thương hiệu hay mục đích sử dụng không?`;
    }
  }

  return 'Xin chào! Tôi có thể tư vấn sản phẩm, gợi ý mẫu phù hợp, báo giá sơ bộ và hướng dẫn mua hàng. Bạn có thể hỏi như: “Tôi cần một chiếc iPhone giá tốt”, “Loa bluetooth cho phòng khách”, hoặc “Sản phẩm nào phù hợp cho học tập”';
};

io.on('connection', (socket) => {
  socket.on('join_chat', (userId) => {
    socket.join(`chat_${userId}`);
  });

  socket.on('send_chat_message', async (data) => {
    const newMsg = new Chat({ userId: data.userId, userName: data.userName, message: data.message, isAdmin: false });
    await newMsg.save();

    io.emit('admin_receive_message', newMsg);
    io.to(`chat_${data.userId}`).emit('receive_message', newMsg);

    const botReply = await buildBotReply(data.message);
    const botMessage = new Chat({ userId: data.userId, message: botReply, isAdmin: true });
    await botMessage.save();

    io.to(`chat_${data.userId}`).emit('receive_message', botMessage);
  });

  socket.on('admin_reply_message', async (data) => {
    const newMsg = new Chat({ userId: data.userId, message: data.message, isAdmin: true });
    await newMsg.save();

    io.to(`chat_${data.userId}`).emit('receive_message', newMsg);
  });
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins, // Tái sử dụng mảng đã lọc
  credentials: true,
}));

// Cấu hình thư mục chứa ảnh (Để hiển thị ảnh sản phẩm)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('API TrueSmart đang hoạt động...');
});

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/vouchers', require('./routes/voucherRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  const errorHandler = require('./middleware/errorHandler');
  errorHandler(err, req, res, next);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Endpoint không tìm thấy' });
});

// Khởi động server
const startServer = async () => {
  try {
    await connectDB();
    let PORT = parseInt(process.env.PORT, 10) || 5000;
    const originalPort = PORT;
    const maxPort = PORT + 100; // Try up to 100 ports

    while (PORT < maxPort) {
      try {
        await new Promise((resolve, reject) => {
          server.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
            resolve();
          });
          server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
              reject(new Error('EADDRINUSE'));
            } else {
              reject(error);
            }
          });
        });
        break; // Success, exit the loop
      } catch (error) {
        if (error.message === 'EADDRINUSE') {
          console.log(`Port ${PORT} is in use, trying ${PORT + 1}...`);
          PORT++;
        } else {
          throw error;
        }
      }
    }

    if (PORT >= maxPort) {
      console.error(`No free ports found between ${originalPort} and ${maxPort - 1}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Lỗi khi khởi động server:', error);
    process.exit(1);
  }
};

startServer();