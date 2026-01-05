@echo off
REM ============================================
REM Script Setup Database - MathBridge (Windows)
REM ============================================

echo ============================================
echo MathBridge - Database Setup Script
echo ============================================
echo.

REM Chọn loại database
echo Chọn loại database bạn muốn sử dụng:
echo 1. H2 (Khuyến nghị - không cần cài đặt)
echo 2. MySQL/MariaDB
echo 3. PostgreSQL
echo.
set /p db_choice="Nhập số (1-3): "

if "%db_choice%"=="1" (
    echo.
    echo Đang cấu hình H2 Database...
    copy src\main\resources\application-h2.yml src\main\resources\application.yml
    echo ✓ Đã cấu hình H2 Database
    echo.
    echo H2 Database sẽ tự động tạo khi ứng dụng khởi động!
    echo Truy cập H2 Console tại: http://localhost:8081/h2-console
    echo JDBC URL: jdbc:h2:mem:mathbridge
    echo Username: sa
    echo Password: (để trống)
) else if "%db_choice%"=="2" (
    echo.
    echo Đang cấu hình MySQL...
    copy src\main\resources\application-mysql.yml src\main\resources\application.yml
    echo ✓ Đã copy cấu hình MySQL
    echo.
    echo Vui lòng:
    echo 1. Tạo database: CREATE DATABASE mathbridge;
    echo 2. Chạy script SQL: mysql -u root -p mathbridge ^< src\main\resources\db\schema-mysql.sql
    echo 3. Cập nhật username/password trong application.yml
) else if "%db_choice%"=="3" (
    echo.
    echo Đang cấu hình PostgreSQL...
    copy src\main\resources\application-postgresql.yml src\main\resources\application.yml
    echo ✓ Đã copy cấu hình PostgreSQL
    echo.
    echo Vui lòng:
    echo 1. Tạo database: CREATE DATABASE mathbridge;
    echo 2. Chạy script SQL: psql -U postgres -d mathbridge -f src\main\resources\db\schema-postgresql.sql
    echo 3. Cập nhật username/password trong application.yml
) else (
    echo Lựa chọn không hợp lệ!
    exit /b 1
)

echo.
echo ============================================
echo Setup hoàn tất!
echo Chạy ứng dụng bằng: mvnw.cmd spring-boot:run
echo ============================================
pause


