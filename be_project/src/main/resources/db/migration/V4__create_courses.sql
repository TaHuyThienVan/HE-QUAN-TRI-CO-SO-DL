-- Create courses table to keep capacity and metadata
CREATE TABLE IF NOT EXISTS courses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial subjects with default capacity 50
INSERT INTO courses (name, capacity) VALUES
('Triết học Mác-Lênin', 50),
('Kinh tế chính trị', 50),
('Lịch sử Đảng', 50),
('Pháp luật đại cương', 50),
('Tâm lý học', 50),
('Toán cao cấp (Giải tích)', 50),
('Toán cao cấp (Xác suất thống kê)', 50),
('Tin học đại cương', 50),
('Giáo dục Quốc phòng - An ninh', 50),
('Giáo dục thể chất', 50),
('Ngoại ngữ cơ bản', 50)
ON DUPLICATE KEY UPDATE capacity = VALUES(capacity);
