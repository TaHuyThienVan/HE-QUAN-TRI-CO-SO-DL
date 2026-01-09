# Hướng dẫn sửa lỗi "Request failed" khi đăng ký môn học

## ✅ Các sửa đổi đã thực hiện:

### 1. Backend:
- ✅ Thêm endpoint `/api/course-registrations` vào SecurityConfig
- ✅ Thêm logging chi tiết vào Controller và Service
- ✅ Tự động tạo Student record nếu chưa có
- ✅ Cải thiện error handling

### 2. Frontend:
- ✅ Cải thiện error handling và hiển thị thông báo
- ✅ Thêm logging để debug
- ✅ Tự động reload danh sách sau khi đăng ký thành công
- ✅ Hiển thị môn học đã đăng ký ở trang student

## 🔧 Các bước để fix:

### Bước 1: Rebuild Backend

```bash
cd be_project
mvn clean compile
mvn spring-boot:run
```

**Quan trọng:** Backend sẽ tự động tạo bảng `course_registrations` khi khởi động (nhờ JPA `ddl-auto: update`).

### Bước 2: Kiểm tra Backend đang chạy

- Mở browser: `http://localhost:8081`
- Hoặc kiểm tra console: Nếu thấy "Started BeProjectApplication" là OK

### Bước 3: Kiểm tra Database

1. Truy cập H2 Console: `http://localhost:8081/h2-console`
2. JDBC URL: `jdbc:h2:mem:mathbridge`
3. Username: `sa`
4. Password: (để trống)
5. Chạy query: `SELECT * FROM course_registrations;`

Nếu bảng chưa có, backend sẽ tự động tạo khi có request đầu tiên.

### Bước 4: Kiểm tra Frontend

1. Mở Developer Console (F12)
2. Vào tab Console
3. Thử đăng ký môn học
4. Xem logs:
   - "Button clicked, selectedSubject: ..."
   - "Đang đăng ký môn học: ..."
   - "Gửi request: ..."
   - "Response từ server: ..."

### Bước 5: Kiểm tra Network

1. Mở Developer Console (F12)
2. Vào tab Network
3. Thử đăng ký môn học
4. Tìm request `POST /api/course-registrations`
5. Kiểm tra:
   - Status code (phải là 201 Created)
   - Response body
   - Request headers (phải có Authorization: Bearer ...)

## 🐛 Các lỗi thường gặp và cách fix:

### Lỗi 1: "Request failed" - Không có thông báo chi tiết
**Nguyên nhân:** Backend không chạy hoặc CORS error
**Fix:**
- Kiểm tra backend có đang chạy không
- Kiểm tra console backend có log gì không
- Kiểm tra Network tab xem request có được gửi không

### Lỗi 2: "401 Unauthorized"
**Nguyên nhân:** Token hết hạn hoặc không hợp lệ
**Fix:**
- Đăng nhập lại
- Kiểm tra localStorage có token không

### Lỗi 3: "403 Forbidden"
**Nguyên nhân:** User không phải STUDENT role
**Fix:**
- Đảm bảo đăng nhập bằng tài khoản STUDENT
- Kiểm tra userRole trong localStorage

### Lỗi 4: "500 Internal Server Error"
**Nguyên nhân:** Lỗi database hoặc code backend
**Fix:**
- Kiểm tra console backend để xem lỗi chi tiết
- Kiểm tra database có bảng `course_registrations` chưa
- Kiểm tra có Student record chưa

### Lỗi 5: "Không tìm thấy thông tin học sinh"
**Nguyên nhân:** Chưa có Student record
**Fix:**
- Code đã tự động tạo Student record nếu chưa có
- Nếu vẫn lỗi, kiểm tra database có bảng `students` chưa

## 📝 Checklist để đảm bảo hoạt động:

- [ ] Backend đang chạy tại `http://localhost:8081`
- [ ] Frontend đang chạy tại `http://localhost:3000`
- [ ] Đã đăng nhập bằng tài khoản STUDENT
- [ ] Token có trong localStorage
- [ ] Database có bảng `course_registrations` (tự động tạo)
- [ ] Database có bảng `students` (tự động tạo)
- [ ] Console không có lỗi CORS

## 🧪 Test lại:

1. Vào trang: `http://localhost:3000/book-session`
2. Chọn môn học (ví dụ: "Triết học Mác-Lênin")
3. Nhấn "Đăng ký môn học này"
4. Kiểm tra:
   - ✅ Thông báo thành công (màu xanh) hiển thị
   - ✅ Console có log "Response từ server: ..."
   - ✅ Vào trang student: `http://localhost:3000/student`
   - ✅ Thấy môn học trong "Học phần đã đăng ký kỳ này"

## 📞 Nếu vẫn lỗi:

1. Mở Developer Console (F12)
2. Copy toàn bộ log từ Console tab
3. Copy response từ Network tab (request POST /api/course-registrations)
4. Kiểm tra backend console logs
5. Gửi thông tin này để debug tiếp





