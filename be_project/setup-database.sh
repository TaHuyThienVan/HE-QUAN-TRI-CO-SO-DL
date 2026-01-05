#!/bin/bash

# ============================================
# Script Setup Database - MathBridge
# ============================================

echo "============================================"
echo "MathBridge - Database Setup Script"
echo "============================================"
echo ""

# Chọn loại database
echo "Chọn loại database bạn muốn sử dụng:"
echo "1. H2 (Khuyến nghị - không cần cài đặt)"
echo "2. MySQL/MariaDB"
echo "3. PostgreSQL"
echo ""
read -p "Nhập số (1-3): " db_choice

case $db_choice in
    1)
        echo ""
        echo "Đang cấu hình H2 Database..."
        cp src/main/resources/application-h2.yml src/main/resources/application.yml
        echo "✓ Đã cấu hình H2 Database"
        echo ""
        echo "H2 Database sẽ tự động tạo khi ứng dụng khởi động!"
        echo "Truy cập H2 Console tại: http://localhost:8081/h2-console"
        echo "JDBC URL: jdbc:h2:mem:mathbridge"
        echo "Username: sa"
        echo "Password: (để trống)"
        ;;
    2)
        echo ""
        echo "Đang cấu hình MySQL..."
        cp src/main/resources/application-mysql.yml src/main/resources/application.yml
        echo "✓ Đã copy cấu hình MySQL"
        echo ""
        echo "Vui lòng:"
        echo "1. Tạo database: CREATE DATABASE mathbridge;"
        echo "2. Chạy script SQL: mysql -u root -p mathbridge < src/main/resources/db/schema-mysql.sql"
        echo "3. Cập nhật username/password trong application.yml"
        ;;
    3)
        echo ""
        echo "Đang cấu hình PostgreSQL..."
        cp src/main/resources/application-postgresql.yml src/main/resources/application.yml
        echo "✓ Đã copy cấu hình PostgreSQL"
        echo ""
        echo "Vui lòng:"
        echo "1. Tạo database: CREATE DATABASE mathbridge;"
        echo "2. Chạy script SQL: psql -U postgres -d mathbridge -f src/main/resources/db/schema-postgresql.sql"
        echo "3. Cập nhật username/password trong application.yml"
        ;;
    *)
        echo "Lựa chọn không hợp lệ!"
        exit 1
        ;;
esac

echo ""
echo "============================================"
echo "Setup hoàn tất!"
echo "Chạy ứng dụng bằng: ./mvnw spring-boot:run"
echo "============================================"


