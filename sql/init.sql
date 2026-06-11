SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

DROP DATABASE IF EXISTS penguin_booking;
CREATE DATABASE penguin_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE penguin_booking;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  nickname VARCHAR(50) DEFAULT '',
  skill_level ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  credit_score TINYINT UNSIGNED NOT NULL DEFAULT 100,
  banned_until DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_users_username (username),
  UNIQUE INDEX uk_users_phone (phone),
  INDEX idx_users_credit (credit_score, banned_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE venues (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  open_time TIME NOT NULL DEFAULT '08:00:00',
  close_time TIME NOT NULL DEFAULT '22:00:00',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tables (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  venue_id INT UNSIGNED NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tables_venue (venue_id),
  CONSTRAINT fk_tables_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  table_id INT UNSIGNED NOT NULL,
  venue_id INT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  hour_slot TINYINT UNSIGNED NOT NULL,
  status ENUM('pending_payment','paid','cancelled','expired') NOT NULL DEFAULT 'pending_payment',
  booking_type ENUM('solo','match') NOT NULL DEFAULT 'solo',
  match_request_id INT UNSIGNED NULL,
  paid_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bookings_slot (table_id, date, hour_slot, status),
  INDEX idx_bookings_user_date (user_id, date, hour_slot, status),
  INDEX idx_bookings_venue_date (venue_id, date, status),
  INDEX idx_bookings_expiration (status, created_at),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_bookings_table FOREIGN KEY (table_id) REFERENCES tables(id),
  CONSTRAINT fk_bookings_venue FOREIGN KEY (venue_id) REFERENCES venues(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE match_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  venue_id INT UNSIGNED NOT NULL,
  skill_level ENUM('beginner','intermediate','advanced') NOT NULL,
  preferred_date DATE NOT NULL,
  hour_slot TINYINT UNSIGNED NOT NULL,
  status ENUM('open','matched','expired','cancelled') NOT NULL DEFAULT 'open',
  matched_user_id INT UNSIGNED NULL,
  matched_booking_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_match_open (venue_id, preferred_date, status, skill_level),
  INDEX idx_match_user (user_id, status),
  CONSTRAINT fk_match_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_match_venue FOREIGN KEY (venue_id) REFERENCES venues(id),
  CONSTRAINT fk_match_matched_user FOREIGN KEY (matched_user_id) REFERENCES users(id),
  CONSTRAINT fk_match_booking FOREIGN KEY (matched_booking_id) REFERENCES bookings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE credit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  change_amount TINYINT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  balance_after TINYINT UNSIGNED NOT NULL,
  booking_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_credit_user (user_id, created_at),
  CONSTRAINT fk_credit_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_credit_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO venues (name, address, phone) VALUES
('朝阳社区乒乓球馆', '朝阳区建国路88号', '010-65001001'),
('海淀社区乒乓球馆', '海淀区中关村大街66号', '010-65001002'),
('西城社区乒乓球馆', '西城区金融街22号', '010-65001003'),
('东城社区乒乓球馆', '东城区东直门内大街10号', '010-65001004'),
('丰台社区乒乓球馆', '丰台区南三环西路16号', '010-65001005'),
('石景山社区乒乓球馆', '石景山区石景山路23号', '010-65001006'),
('通州社区乒乓球馆', '通州区新华西街5号', '010-65001007'),
('大兴社区乒乓球馆', '大兴区黄村东大街12号', '010-65001008');

INSERT INTO tables (venue_id, name) VALUES
(1,'1号台'),(1,'2号台'),(1,'3号台'),(1,'4号台'),(1,'5号台'),(1,'6号台'),(1,'7号台'),(1,'8号台'),
(2,'1号台'),(2,'2号台'),(2,'3号台'),(2,'4号台'),(2,'5号台'),(2,'6号台'),(2,'7号台'),(2,'8号台'),
(3,'1号台'),(3,'2号台'),(3,'3号台'),(3,'4号台'),(3,'5号台'),(3,'6号台'),(3,'7号台'),(3,'8号台'),
(4,'1号台'),(4,'2号台'),(4,'3号台'),(4,'4号台'),(4,'5号台'),(4,'6号台'),(4,'7号台'),(4,'8号台'),
(5,'1号台'),(5,'2号台'),(5,'3号台'),(5,'4号台'),(5,'5号台'),(5,'6号台'),(5,'7号台'),(5,'8号台'),
(6,'1号台'),(6,'2号台'),(6,'3号台'),(6,'4号台'),(6,'5号台'),(6,'6号台'),(6,'7号台'),(6,'8号台'),
(7,'1号台'),(7,'2号台'),(7,'3号台'),(7,'4号台'),(7,'5号台'),(7,'6号台'),(7,'7号台'),(7,'8号台'),
(8,'1号台'),(8,'2号台'),(8,'3号台'),(8,'4号台'),(8,'5号台'),(8,'6号台'),(8,'7号台'),(8,'8号台');
