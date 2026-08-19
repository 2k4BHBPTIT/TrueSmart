# TrueSmart - E-Commerce Platform

TrueSmart là một nền tảng thương mại điện tử hiện đại được xây dựng với công nghệ web tiên tiến. Ứng dụng cung cấp trải nghiệm mua sắm toàn diện với các tính năng như quản lý sản phẩm, giỏ hàng, thanh toán, quản trị hệ thống, và hơn thế nữa.

## Các Tính Năng Chính

### Cho Khách Hàng
- **Duyệt Sản Phẩm**: Danh sách sản phẩm, lọc theo danh mục, tìm kiếm
- **Chi Tiết Sản Phẩm**: Xem thông tin chi tiết, hình ảnh, đánh giá
- **Giỏ Hàng**: Thêm/xóa sản phẩm, cập nhật số lượng
- **Thanh Toán**: Quy trình thanh toán an toàn, xác nhận đơn hàng
- **Tài Khoản Cá Nhân**: Quản lý thông tin, lịch sử đơn hàng, ví tiền
- **Vòng Quay May Mắn**: Tính năng giải trí và giành giải thưởng
- **Trò Chuyện Trực Tiếp**: Hỗ trợ khách hàng thời gian thực

### Cho Quản Trị Viên
- **Bảng Điều Khiển**: Tổng quan thông tin hệ thống
- **Quản Lý Sản Phẩm**: Thêm, sửa, xóa sản phẩm và danh mục
- **Quản Lý Đơn Hàng**: Xem và xử lý đơn hàng
- **Quản Lý Người Dùng**: Quản lý tài khoản khách hàng
- **Quản Lý Nhà Cung Cấp**: Quản lý mối quan hệ với nhà cung cấp
- **Quản Lý Giao Dịch**: Theo dõi các giao dịch tài chính
- **Chương Trình Khuyến Mãi**: Tạo và quản lý các khuyến mãi/giảm giá
- **Cài Đặt Hệ Thống**: Tuỳ chỉnh cấu hình nền tảng
- **Nhật Ký Hệ Thống**: Theo dõi các hoạt động hệ thống


## Công Nghệ Sử Dụng

### Frontend
- **React**: Thư viện UI
- **Vite**: Bundler và dev server
- **Tailwind CSS**: Framework CSS
- **Axios**: HTTP client
- **ESLint**: Linting tool

### Backend
- **Node.js**: Runtime JavaScript server-side
- **Express.js**: Web framework
- **MongoDB**: Database NoSQL
- **JWT**: Xác thực người dùng

## Yêu Cầu Hệ Thống

Xem file [requirement.md](./requirement.md) để biết chi tiết yêu cầu hệ thống và dependencies.

## Cài Đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd TrueSmart
```

### 2. Cài Đặt Backend
```bash
cd Server
npm install
```

### 3. Cài Đặt Frontend
```bash
cd Client
npm install
```

## Chạy Ứng Dụng

### Chạy Backend
```bash
cd Server
npm start
# Server sẽ chạy trên http://localhost:5000 (port mặc định)
```

### Chạy Frontend
```bash
cd Client
npm run dev
# Client sẽ chạy trên http://localhost:5173 (Vite dev server)
```

### Build Production
```bash
# Frontend
cd Client
npm run build

# Backend được deploy tùy theo nhu cầu
```

## Cấu Trúc Thư Mục

```
TrueSmart/
├── Client/                    # Frontend React
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/              # API calls
│   │   ├── components/       # React components
│   │   ├── context/          # Context API
│   │   ├── pages/            # Pages
│   │   └── assets/           # Static assets
│   ├── public/
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── Server/                    # Backend Node.js
│   ├── controllers/          # Logic xử lý
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── middleware/           # Middleware
│   ├── config/               # Configuration
│   ├── utils/                # Utility functions
│   ├── server.js             # Entry point
│   └── package.json
│
├── render.yaml               # Deployment config
└── README.md                 # File này
```

## Cấu Hình Môi Trường

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## API Documentation

API endpoints được chia theo các route:
- `/api/auth` - Xác thực
- `/api/products` - Sản phẩm
- `/api/orders` - Đơn hàng
- `/api/users` - Người dùng
- `/api/suppliers` - Nhà cung cấp
- `/api/transactions` - Giao dịch
- `/api/chat` - Trò chuyện
- `/api/deals` - Khuyến mãi
- `/api/settings` - Cài đặt hệ thống
- `/api/logs` - Nhật ký hệ thống

## Đóng Góp

Các contributor vui lòng tuân theo quy trình:
1. Fork repository
2. Tạo branch mới cho feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## Giấy Phép

Dự án này được cấp phép theo [MIT License](LICENSE) - xem file LICENSE để chi tiết.

## Hỗ Trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng:
- Mở Issue trên GitHub
- Liên hệ qua email: builetien77@gmail.com
- Sử dụng tính năng Live Chat trên ứng dụng

## Tác Giả

TrueSmart Development Team

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Tích hợp AI cho gợi ý sản phẩm
- [ ] Nâng cấp hiệu suất
- [ ] Mở rộng các phương thức thanh toán
- [ ] Hệ thống loyalty points

---
