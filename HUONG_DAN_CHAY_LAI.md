# Hướng dẫn chạy lại hệ thống sau khi cập nhật

## ✅ Đã hoàn thành các thay đổi:

1. ✅ Backend: Tạo API đăng ký môn học (CourseRegistration)
2. ✅ Backend: Tạo migration script V3 để tạo bảng `course_registrations`
3. ✅ Frontend: Thêm nút "Đăng ký môn học này" ở trang đăng ký học phần
4. ✅ Frontend: Thêm mục "Học phần đã đăng ký kỳ này" ở trang sinh viên

## 📋 Các bước để chạy lại:

### 1. Backend (Spring Boot)

```bash
# Di chuyển vào thư mục backend
cd be_project

# Clean và compile lại (để đảm bảo code mới được build)
mvn clean compile

# Chạy ứng dụng Spring Boot
mvn spring-boot:run
```

**Lưu ý:** 
- Backend sẽ tự động tạo bảng `course_registrations` khi khởi động (nhờ JPA `ddl-auto: update`)
- Backend chạy tại: `http://localhost:8081`

### 2. Frontend (Next.js)

Mở terminal mới và chạy:

```bash
# Di chuyển vào thư mục frontend
cd fe_next_project

# Cài đặt dependencies (nếu chưa có)
npm install

# Chạy ứng dụng Next.js
npm run dev
```

**Lưu ý:**
- Frontend chạy tại: `http://localhost:3000`

### 3. Kiểm tra Database

Nếu bạn muốn kiểm tra bảng đã được tạo chưa:

1. Truy cập H2 Console: `http://localhost:8081/h2-console`
2. JDBC URL: `jdbc:h2:mem:mathbridge`
3. Username: `sa`
4. Password: (để trống)
5. Chạy query: `SELECT * FROM course_registrations;`

## 🧪 Kiểm tra chức năng:

### 1. Đăng ký môn học:
- Vào trang: `http://localhost:3000/book-session`
- Chọn môn học từ dropdown
- Nhấn nút "📝 Đăng ký môn học này"
- Kiểm tra thông báo thành công

### 2. Xem môn học đã đăng ký:
- Vào trang: `http://localhost:3000/student`
- Tìm mục "📚 Học phần đã đăng ký kỳ này"
- Kiểm tra danh sách môn học đã đăng ký

## ⚠️ Lưu ý quan trọng:

1. **Database:** Nếu bạn đang dùng H2 (mặc định), dữ liệu sẽ mất khi restart. Nếu muốn lưu lâu dài, cần chuyển sang MySQL/PostgreSQL.

2. **Migration:** Với cấu hình hiện tại (`ddl-auto: update`), JPA sẽ tự động tạo bảng từ Entity, không cần chạy migration script thủ công.

3. **CORS:** Đảm bảo backend cho phép frontend gọi API (đã cấu hình trong `application.yml`)

## 🐛 Nếu gặp lỗi:

1. **Lỗi compile:** Chạy `mvn clean compile` lại
2. **Lỗi port đã được sử dụng:** Đổi port trong `application.yml` hoặc tắt ứng dụng đang chạy
3. **Lỗi CORS:** Kiểm tra `cors.origins` trong `application.yml`
4. **Lỗi database:** Kiểm tra kết nối database trong `application.yml`

## 📝 Tóm tắt:

1. ✅ Code đã hoàn thành
2. ✅ Chỉ cần rebuild và restart backend + frontend
3. ✅ Database sẽ tự động tạo bảng khi backend khởi động
4. ✅ Sẵn sàng để test!





