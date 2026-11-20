-- ============================================================
-- BHC.CINE - DATABASE SCHEMA (PHẦN THÀNH VIÊN 1: MOVIES, ROOMS, SHOWTIMES)
-- Hệ quản trị CSDL: MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS bhc_cine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bhc_cine;

-- 1. Bảng phim (movies)
CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  genre VARCHAR(150) NOT NULL,
  duration INT NOT NULL CHECK (duration > 0),
  release_date DATE NOT NULL,
  poster_url VARCHAR(500) NOT NULL,
  trailer_url VARCHAR(500) DEFAULT NULL,
  rating VARCHAR(20) DEFAULT 'P',
  status ENUM('now_showing', 'coming_soon') NOT NULL DEFAULT 'now_showing',
  is_featured BOOLEAN DEFAULT FALSE,
  rank_order INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng phòng chiếu (rooms)
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cinema_name VARCHAR(150) NOT NULL DEFAULT 'BHC.CINE Downtown',
  cinema_address VARCHAR(255) DEFAULT '24 Nguyễn Trãi, Thanh Xuân, Hà Nội',
  screen_type VARCHAR(50) DEFAULT '2D Standard',
  total_rows INT NOT NULL CHECK (total_rows BETWEEN 1 AND 26),
  seats_per_row INT NOT NULL CHECK (seats_per_row BETWEEN 1 AND 30),
  vip_rows VARCHAR(50) DEFAULT 'D,E',
  double_rows VARCHAR(50) DEFAULT 'H',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Bảng suất chiếu (showtimes)
CREATE TABLE IF NOT EXISTS showtimes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  room_id INT NOT NULL,
  show_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  base_price INT NOT NULL DEFAULT 80000 CHECK (base_price >= 0),
  vip_price INT NOT NULL DEFAULT 110000 CHECK (vip_price >= 0),
  double_price INT NOT NULL DEFAULT 180000 CHECK (double_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_showtimes_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_showtimes_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_showtime_room_date (room_id, show_date),
  INDEX idx_showtime_movie_date (movie_id, show_date)
);

-- ============================================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ============================================================

INSERT INTO movies (title, description, genre, duration, release_date, poster_url, trailer_url, rating, status, is_featured, rank_order) VALUES
('Chị Chị Em Em 3', 'Câu chuyện kịch tính về tình chị em, tham vọng và những bí mật ẩn giấu sau ánh hào quang Sài Gòn xưa.', 'Tình cảm', 120, '2026-11-10', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'T16', 'now_showing', TRUE, 1),
('The Last Orbit', 'Phi hành đoàn cuối cùng trên trạm vũ trụ phải tìm cách trở về Trái Đất khi quỹ đạo bắt đầu sụp đổ.', 'Khoa học viễn tưởng', 138, '2026-11-12', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80', 'https://www.youtube.com/embed/zSWdZVtXT7E', 'T13', 'now_showing', FALSE, 2),
('Bên Kia Đường Chân Trời', 'Hành trình xuyên Việt đầy cảm xúc của hai người bạn trẻ đi tìm lại ký ức tuổi thơ bị lãng quên.', 'Tâm lý', 112, '2026-11-05', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80', 'https://www.youtube.com/embed/YoHD9XEInc0', 'P', 'now_showing', FALSE, 3),
('Thành Phố Không Ngủ', 'Một thám tử trẻ lần theo dấu vết vụ án bí ẩn kéo dài suốt 10 năm giữa lòng đô thị về đêm.', 'Hành động', 125, '2026-11-08', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80', 'https://www.youtube.com/embed/EXeTwQWrcwY', 'T18', 'now_showing', FALSE, NULL),
('Mùa Hè Năm Ấy', 'Bản tình ca nhẹ nhàng về mối tình đầu thời đại học và những lựa chọn trưởng thành.', 'Tình cảm', 105, '2026-12-01', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'P', 'coming_soon', FALSE, NULL),
('Khu Rừng Kỳ Diệu', 'Cuộc phiêu lưu hoạt hình đầy màu sắc của cô bé lạc vào vương quốc sinh vật phát sáng.', 'Hoạt hình', 96, '2026-12-15', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'P', 'coming_soon', FALSE, NULL),
('Đêm Trường Quỷ Ám', 'Nhóm sinh viên kiến trúc khám phá một biệt thự cổ bỏ hoang và đánh thức lời nguyền xưa.', 'Kinh dị', 108, '2026-12-20', 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'T18', 'coming_soon', FALSE, NULL),
('Vương Quốc Bị Lãng Quên', 'Chiến binh trẻ lên đường tìm lại thanh kiếm cổ để bảo vệ vương quốc khỏi thế lực bóng tối.', 'Phiêu lưu', 130, '2027-01-05', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'T13', 'coming_soon', FALSE, NULL);

INSERT INTO rooms (name, cinema_name, cinema_address, screen_type, total_rows, seats_per_row, vip_rows, double_rows) VALUES
('Phòng 01', 'BHC.CINE Downtown', '24 Nguyễn Trãi, Thanh Xuân, Hà Nội', '2D Standard', 8, 12, 'D,E', 'H'),
('Phòng 02', 'BHC.CINE Downtown', '24 Nguyễn Trãi, Thanh Xuân, Hà Nội', '2D Dolby Atmos', 8, 10, 'E,F', 'H'),
('Phòng 04', 'BHC.CINE Downtown', '24 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'IMAX - LASER', 8, 12, 'D,E', 'H');

INSERT INTO showtimes (movie_id, room_id, show_date, start_time, end_time, base_price, vip_price, double_price) VALUES
(1, 1, CURDATE(), '10:00:00', '12:00:00', 75000, 105000, 170000),
(1, 1, CURDATE(), '14:00:00', '16:00:00', 80000, 110000, 180000),
(1, 1, CURDATE(), '19:30:00', '21:30:00', 90000, 120000, 200000),
(2, 3, CURDATE(), '19:30:00', '21:48:00', 110000, 145000, 240000),
(3, 2, CURDATE(), '18:00:00', '19:52:00', 80000, 110000, 180000),
(4, 2, CURDATE(), '20:30:00', '22:35:00', 85000, 115000, 190000),
(2, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:30:00', '21:48:00', 110000, 145000, 240000),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00:00', '22:00:00', 90000, 120000, 200000);
