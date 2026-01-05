# Hướng dẫn Setup Database - MathBridge

Hệ thống hỗ trợ nhiều loại database để máy nào cũng có thể sử dụng được.

## 📋 Các loại database được hỗ trợ

1. **H2 Database** (Khuyến nghị - không cần cài đặt)
2. **MySQL/MariaDB**
3. **PostgreSQL**

---

## 🚀 Cách 1: Sử dụng H2 Database (Khuyến nghị)

H2 là embedded database, không cần cài đặt gì cả!

### Bước 1: Cập nhật application.yml

Đổi tên file `application.yml` thành `application-h2.yml` hoặc copy nội dung từ `application-h2.yml` vào `application.yml`

### Bước 2: Thêm dependency vào pom.xml (nếu chưa có)

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Bước 3: Chạy ứng dụng

```bash
cd be_project
./mvnw spring-boot:run
```

Database sẽ tự động tạo khi ứng dụng khởi động!

### Bước 4: Truy cập H2 Console (tùy chọn)

Mở trình duyệt: http://localhost:8081/h2-console
- JDBC URL: `jdbc:h2:mem:mathbridge`
- Username: `sa`
- Password: (để trống)

---

## 🗄️ Cách 2: Sử dụng MySQL/MariaDB

### Bước 1: Cài đặt MySQL

**Windows:**
- Tải MySQL từ: https://dev.mysql.com/downloads/installer/
- Hoặc dùng XAMPP/WAMP

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
```

**Mac:**
```bash
brew install mysql
```

### Bước 2: Tạo database

```sql
CREATE DATABASE mathbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mathbridge_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON mathbridge.* TO 'mathbridge_user'@'localhost';
FLUSH PRIVILEGES;
```

### Bước 3: Chạy script SQL

```bash
mysql -u mathbridge_user -p mathbridge < be_project/src/main/resources/db/schema-mysql.sql
```

Hoặc sử dụng MySQL Workbench để import file `schema-mysql.sql`

### Bước 4: Cập nhật application.yml

Copy nội dung từ `application-mysql.yml` vào `application.yml` và cập nhật:
- `username`: tên user MySQL của bạn
- `password`: mật khẩu MySQL của bạn
- `url`: địa chỉ MySQL (mặc định localhost:3306)

### Bước 5: Thêm dependency vào pom.xml

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Bước 6: Chạy ứng dụng

```bash
cd be_project
./mvnw spring-boot:run
```

---

## 🐘 Cách 3: Sử dụng PostgreSQL

### Bước 1: Cài đặt PostgreSQL

**Windows:**
- Tải từ: https://www.postgresql.org/download/windows/

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**Mac:**
```bash
brew install postgresql
```

### Bước 2: Tạo database

```bash
sudo -u postgres psql
```

Trong PostgreSQL console:
```sql
CREATE DATABASE mathbridge;
CREATE USER mathbridge_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE mathbridge TO mathbridge_user;
\q
```

### Bước 3: Chạy script SQL

```bash
psql -U mathbridge_user -d mathbridge -f be_project/src/main/resources/db/schema-postgresql.sql
```

### Bước 4: Cập nhật application.yml

Copy nội dung từ `application-postgresql.yml` vào `application.yml` và cập nhật:
- `username`: tên user PostgreSQL của bạn
- `password`: mật khẩu PostgreSQL của bạn
- `url`: địa chỉ PostgreSQL (mặc định localhost:5432)

### Bước 5: Thêm dependency vào pom.xml

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Bước 6: Chạy ứng dụng

```bash
cd be_project
./mvnw spring-boot:run
```

---

## 📝 Cấu trúc Database

Database bao gồm các bảng sau:

1. **users** - Người dùng hệ thống
2. **students** - Học sinh
3. **tutors** - Giảng viên
4. **sessions** - Buổi học
5. **messages** - Tin nhắn
6. **feedbacks** - Phản hồi
7. **notifications** - Thông báo
8. **payments** - Thanh toán
9. **reviews** - Đánh giá
10. **tutor_reports** - Báo cáo giảng viên

---

## 🔧 Troubleshooting

### Lỗi kết nối database

1. Kiểm tra database đã được tạo chưa
2. Kiểm tra username/password đúng chưa
3. Kiểm tra port database có đúng không
4. Kiểm tra firewall có chặn port không

### Lỗi encoding (tiếng Việt)

- MySQL: Đảm bảo database dùng `utf8mb4`
- PostgreSQL: Đảm bảo database dùng `UTF8`
- H2: Tự động hỗ trợ UTF-8

### Lỗi foreign key constraint

- Đảm bảo đã chạy script SQL đầy đủ
- Kiểm tra thứ tự tạo bảng (users → students/tutors → sessions → ...)

---

## 💡 Khuyến nghị

- **Development**: Dùng H2 (không cần cài đặt)
- **Production**: Dùng MySQL hoặc PostgreSQL (ổn định hơn)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Logs trong console
2. File `application.yml` có đúng cấu hình không
3. Database đã được tạo và có quyền truy cập chưa


