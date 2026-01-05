# 🗄️ Database Setup - MathBridge

## ✅ Đã tạo CSDL hoàn chỉnh cho máy nào cũng có thể sử dụng!

### 📦 Các file đã tạo:

1. **Schema SQL:**
   - `be_project/src/main/resources/db/schema-h2.sql` - H2 Database
   - `be_project/src/main/resources/db/schema-mysql.sql` - MySQL/MariaDB
   - `be_project/src/main/resources/db/schema-postgresql.sql` - PostgreSQL

2. **Cấu hình:**
   - `be_project/src/main/resources/application-h2.yml` - Cấu hình H2
   - `be_project/src/main/resources/application-mysql.yml` - Cấu hình MySQL
   - `be_project/src/main/resources/application-postgresql.yml` - Cấu hình PostgreSQL

3. **Scripts:**
   - `be_project/setup-database.sh` - Script setup (Linux/Mac)
   - `be_project/setup-database.bat` - Script setup (Windows)

4. **Hướng dẫn:**
   - `DATABASE_SETUP.md` - Hướng dẫn chi tiết

---

## 🚀 Cách sử dụng nhanh:

### Option 1: H2 Database (Khuyến nghị - không cần cài đặt)

```bash
# Windows
cd be_project
copy src\main\resources\application-h2.yml src\main\resources\application.yml
mvnw.cmd spring-boot:run

# Linux/Mac
cd be_project
cp src/main/resources/application-h2.yml src/main/resources/application.yml
./mvnw spring-boot:run
```

Database sẽ tự động tạo khi ứng dụng khởi động!

### Option 2: Sử dụng script tự động

```bash
# Windows
cd be_project
setup-database.bat

# Linux/Mac
cd be_project
chmod +x setup-database.sh
./setup-database.sh
```

---

## 📋 Cấu trúc Database:

Database bao gồm **10 bảng**:

1. ✅ **users** - Người dùng hệ thống
2. ✅ **students** - Học sinh  
3. ✅ **tutors** - Giảng viên
4. ✅ **sessions** - Buổi học (hỗ trợ tranh slot)
5. ✅ **messages** - Tin nhắn
6. ✅ **feedbacks** - Phản hồi
7. ✅ **notifications** - Thông báo
8. ✅ **payments** - Thanh toán
9. ✅ **reviews** - Đánh giá
10. ✅ **tutor_reports** - Báo cáo giảng viên

Tất cả đều có:
- ✅ Foreign keys đầy đủ
- ✅ Indexes để tối ưu performance
- ✅ Constraints để đảm bảo data integrity
- ✅ Timestamps (created_at, updated_at)

---

## 💡 Lưu ý:

- **H2**: Embedded database, không cần cài đặt gì cả
- **MySQL/PostgreSQL**: Cần cài đặt database server trước
- Tất cả schema đều hỗ trợ UTF-8 (tiếng Việt)
- Có thể chuyển đổi giữa các database dễ dàng

---

## 📖 Xem hướng dẫn chi tiết:

Xem file `DATABASE_SETUP.md` để biết cách setup từng loại database.


