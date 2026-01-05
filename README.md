# 🎓 MathBridge - Hệ Thống Quản Lý Học Toán Trực Tuyến

Hệ thống web hoàn chỉnh để quản lý học tập, đăng ký học phần với tính năng tranh slot thông minh.

## ✨ Tính Năng Chính

- ✅ **Đăng ký/Đăng nhập** - Học sinh và Giảng viên
- ✅ **Đăng ký học phần** - Tranh slot học phần thông minh với real-time updates
- ✅ **Quản lý lịch học** - Xem và quản lý lịch học
- ✅ **Chat** - Nhắn tin giữa học sinh và giảng viên
- ✅ **Feedback** - Đánh giá buổi học
- ✅ **Thanh toán** - Quản lý thanh toán học phí
- ✅ **Database đa nền tảng** - Hỗ trợ H2, MySQL, PostgreSQL

---

## 🚀 Cài Đặt & Chạy Nhanh

### Yêu Cầu

- Java 21+
- Node.js 18+
- Maven (hoặc dùng mvnw có sẵn)

### Bước 1: Clone Project

```bash
git clone <repository-url>
cd HE-QUAN-TRI-CO-SO-DL
```

### Bước 2: Chạy Backend

```bash
cd be_project
./mvnw spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8081**

> 💡 **Lưu ý**: Database H2 sẽ tự động tạo khi ứng dụng khởi động (không cần cài đặt gì!)

### Bước 3: Chạy Frontend

Mở terminal mới:

```bash
cd fe_next_project
npm install
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

---

## 📖 Hướng Dẫn Sử Dụng

### 1. Đăng Ký Tài Khoản

- Truy cập: http://localhost:3000/register
- Chọn vai trò: **Học sinh** hoặc **Giảng viên**
- Điền thông tin và đăng ký

### 2. Đăng Nhập

**Học sinh:**
- Truy cập: http://localhost:3000/login
- Đăng nhập với email và mật khẩu

**Giảng viên:**
- Truy cập: http://localhost:3000/login-teacher
- Đăng nhập với email và mật khẩu

### 3. Đăng Ký Học Phần (Học sinh)

1. Đăng nhập với tài khoản học sinh
2. Click **"Đăng ký học phần"** trên trang chủ
3. Chọn giảng viên và ngày học
4. Chọn slot giờ học (màu xanh = có thể đăng ký)
5. Điền thông tin và click vào slot để đăng ký

> 💡 **Tính năng tranh slot**: Hệ thống tự động cập nhật trạng thái slot mỗi 3 giây để tránh đăng ký trùng!

### 4. Đặt Lịch Học (Giảng viên)

1. Đăng nhập với tài khoản giảng viên
2. Vào **"Đặt lịch học"**
3. Chọn ngày, giờ, học sinh và điền thông tin
4. Click **"Đặt lịch học"**

---

## 🗄️ Database

### Mặc Định: H2 Database (Không cần cài đặt)

Database H2 sẽ tự động tạo khi ứng dụng khởi động. Truy cập H2 Console tại:
- URL: http://localhost:8081/h2-console
- JDBC URL: `jdbc:h2:mem:mathbridge`
- Username: `sa`
- Password: (để trống)

### Chuyển Sang MySQL/PostgreSQL

Xem file `DATABASE_SETUP.md` để biết cách setup MySQL hoặc PostgreSQL.

---

## 📁 Cấu Trúc Project

```
HE-QUAN-TRI-CO-SO-DL/
├── be_project/              # Backend (Spring Boot)
│   ├── src/main/java/       # Java source code
│   ├── src/main/resources/  # Config files
│   │   ├── application.yml   # Main config (H2)
│   │   └── db/              # Database schemas
│   └── pom.xml              # Maven dependencies
│
└── fe_next_project/         # Frontend (Next.js)
    ├── src/app/             # Pages & components
    ├── src/lib/             # Utilities
    └── package.json         # NPM dependencies
```

---

## 🔧 Troubleshooting

### Lỗi kết nối database

Nếu gặp lỗi database, đảm bảo:
1. Backend đã chạy thành công
2. Port 8081 không bị chiếm dụng
3. Nếu dùng MySQL/PostgreSQL, đảm bảo đã cài đặt và tạo database

### Lỗi CORS

Đảm bảo backend và frontend đều đang chạy:
- Backend: http://localhost:8081
- Frontend: http://localhost:3000

### Lỗi đăng nhập

1. Kiểm tra đã đăng ký tài khoản chưa
2. Kiểm tra email và mật khẩu đúng chưa
3. Kiểm tra console để xem lỗi chi tiết

---

## 📚 API Documentation

Sau khi chạy backend, truy cập Swagger UI tại:
**http://localhost:8081/swagger-ui.html**

---

## 🎯 Tính Năng Nổi Bật

### Tranh Slot Học Phần

- ✅ Real-time polling (cập nhật mỗi 3 giây)
- ✅ Optimistic locking để tránh race condition
- ✅ Conflict detection tự động
- ✅ Thông báo rõ ràng khi slot bị tranh

### Database Đa Nền Tảng

- ✅ H2 (embedded - không cần cài đặt)
- ✅ MySQL/MariaDB
- ✅ PostgreSQL

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong console
2. Xem file `DATABASE_SETUP.md` cho vấn đề về database
3. Kiểm tra các file config trong `be_project/src/main/resources/`

---

## 📝 License

MIT License

---

## 🙏 Credits

Developed with ❤️ for MathBridge Learning Platform
