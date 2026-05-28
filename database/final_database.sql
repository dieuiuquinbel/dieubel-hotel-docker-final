-- Final database script for hotel_booking_db.
-- Chay file nay tren database trong hoac khi muon reset sach du lieu demo.
-- File nay doc lap, khong can chay cac file 01 -> 06 truoc do.

CREATE DATABASE IF NOT EXISTS hotel_booking_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hotel_booking_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS admin_audit_logs;
DROP TABLE IF EXISTS favorite_rooms;
DROP TABLE IF EXISTS room_reviews;
DROP TABLE IF EXISTS customer_feedbacks;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS refund_requests;
DROP TABLE IF EXISTS booking_status_logs;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS user_vouchers;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS room_images;
DROP TABLE IF EXISTS booking_services;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS email_otps;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500) NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  hotel_name VARCHAR(150) NOT NULL,
  room_name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  room_type ENUM('standard', 'deluxe', 'superior', 'suite', 'family') NOT NULL,
  description TEXT,
  amenities_json JSON NULL,
  image_url VARCHAR(500),
  gallery_json JSON NULL,
  price_per_night DECIMAL(12,2) NOT NULL,
  rating_avg DECIMAL(3,1) NOT NULL DEFAULT 0,
  total_reviews INT NOT NULL DEFAULT 0,
  max_guests INT NOT NULL,
  inventory_count INT NOT NULL DEFAULT 1,
  breakfast_included BOOLEAN NOT NULL DEFAULT FALSE,
  free_cancellation BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_code VARCHAR(50) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests INT NOT NULL,
  rooms_count INT NOT NULL DEFAULT 1,
  booking_type ENUM('overnight', 'day_use') NOT NULL DEFAULT 'overnight',
  nights INT NOT NULL,
  room_price DECIMAL(12,2) NOT NULL,
  service_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  original_total_price DECIMAL(12,2) NULL,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  booking_status ENUM('pending', 'holding', 'confirmed', 'cancel_requested', 'checked_in', 'checked_out', 'cancelled', 'expired', 'completed', 'no_show') NOT NULL DEFAULT 'holding',
  payment_status ENUM('unpaid', 'deposit_paid', 'paid', 'pay_at_counter', 'refunded') NOT NULL DEFAULT 'unpaid',
  payment_method VARCHAR(50),
  voucher_code VARCHAR(50) NULL,
  payment_code VARCHAR(80) NULL,
  transfer_content VARCHAR(120) NULL,
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_deadline TIMESTAMP NULL,
  confirmed_at TIMESTAMP NULL,
  paid_at TIMESTAMP NULL,
  checked_in_at TIMESTAMP NULL,
  checked_out_at TIMESTAMP NULL,
  no_show_at TIMESTAMP NULL,
  checkin_qr_token VARCHAR(120) NULL,
  cancelled_at TIMESTAMP NULL,
  cancel_reason VARCHAR(255) NULL,
  note VARCHAR(255) NULL,
  admin_note TEXT NULL,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE email_otps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  email VARCHAR(150) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose ENUM('register_verify') NOT NULL DEFAULT 'register_verify',
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_email_otps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  invoice_code VARCHAR(50) NOT NULL UNIQUE,
  file_path VARCHAR(500) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE services (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255),
  price DECIMAL(12,2) NOT NULL,
  service_type ENUM('food', 'transport', 'spa', 'entertainment', 'other') NOT NULL DEFAULT 'other',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE booking_services (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_booking_services_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_services_service FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE room_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_room_images_room_url (room_id, image_url(255)),
  CONSTRAINT fk_room_images_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE vouchers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL,
  description VARCHAR(255),
  discount_type ENUM('percent', 'fixed', 'service') NOT NULL DEFAULT 'percent',
  discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_order_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(12,2) NULL,
  service_benefit VARCHAR(160) NULL,
  start_at TIMESTAMP NULL,
  end_at TIMESTAMP NULL,
  total_quantity INT NOT NULL DEFAULT 0,
  used_quantity INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_vouchers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  voucher_id BIGINT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  booking_id BIGINT NULL,
  status ENUM('saved', 'used', 'expired') NOT NULL DEFAULT 'saved',
  CONSTRAINT fk_user_vouchers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_vouchers_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
  CONSTRAINT fk_user_vouchers_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT uq_user_voucher UNIQUE (user_id, voucher_id)
);

CREATE TABLE payment_transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  transaction_code VARCHAR(80) NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('online_full', 'counter_deposit', 'bank_transfer', 'cash') NOT NULL DEFAULT 'bank_transfer',
  payment_status ENUM('pending', 'confirmed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  bank_name VARCHAR(100) NULL,
  transfer_content VARCHAR(120) NULL,
  confirmed_by BIGINT NULL,
  confirmed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_transactions_admin FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE booking_status_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  old_status VARCHAR(40) NULL,
  new_status VARCHAR(40) NOT NULL,
  note VARCHAR(255) NULL,
  changed_by BIGINT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_status_logs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_status_logs_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE refund_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  refund_code VARCHAR(50) NOT NULL UNIQUE,
  booking_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  cancel_fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  refund_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  bank_name VARCHAR(120) NOT NULL,
  bank_account_name VARCHAR(160) NOT NULL,
  bank_account_number VARCHAR(80) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(160) NOT NULL,
  reason TEXT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  admin_note TEXT NULL,
  processed_by BIGINT NULL,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_refund_requests_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_refund_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_refund_requests_admin FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_refund_requests_booking (booking_id)
);

CREATE TABLE support_tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_code VARCHAR(50) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  booking_id BIGINT NULL,
  category ENUM('booking', 'payment', 'refund', 'service', 'account', 'other') NOT NULL DEFAULT 'other',
  title VARCHAR(160) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('new', 'processing', 'resolved', 'closed') NOT NULL DEFAULT 'new',
  admin_reply TEXT NULL,
  replied_by BIGINT NULL,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_support_tickets_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_support_tickets_admin FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE customer_feedbacks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  feedback_code VARCHAR(50) NOT NULL UNIQUE,
  booking_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  feedback_type ENUM('feedback', 'complaint', 'payment', 'support') NOT NULL DEFAULT 'feedback',
  title VARCHAR(160) NULL,
  content TEXT NOT NULL,
  status ENUM('new', 'processing', 'resolved', 'closed') NOT NULL DEFAULT 'new',
  admin_reply TEXT NULL,
  replied_by BIGINT NULL,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_customer_feedbacks_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_customer_feedbacks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_customer_feedbacks_admin FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE room_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT NOT NULL,
  booking_id BIGINT NULL,
  user_id BIGINT NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  content TEXT NULL,
  status ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_room_reviews_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_room_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_room_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE favorite_rooms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_favorite_rooms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_rooms_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT uq_favorite_room UNIQUE (user_id, room_id)
);

CREATE TABLE admin_audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT NULL,
  action_type VARCHAR(80) NOT NULL,
  target_table VARCHAR(80) NOT NULL,
  target_id VARCHAR(80) NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO rooms (
  hotel_name, room_name, slug, city, address, room_type, description,
  amenities_json, image_url, gallery_json, price_per_night, rating_avg,
  total_reviews, max_guests, inventory_count, breakfast_included,
  free_cancellation, is_active
) VALUES
('Ha Thanh Lake View', 'Deluxe Lake View', 'ha-thanh-lake-view-deluxe-lake-view', 'Ha Noi', '41 P. Trich Sai, Tay Ho, Ha Noi', 'deluxe', 'Phong deluxe huong ho, phu hop cap doi hoac khach cong tac.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'parking'), 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'), 850000, 8.8, 143, 2, 5, TRUE, TRUE, TRUE),
('Moonlight Tay Ho', 'Superior City View', 'moonlight-tay-ho-superior-city-view', 'Ha Noi', '98 Quang An, Tay Ho, Ha Noi', 'superior', 'Phong superior co cua so lon, gan khu ho Tay.', JSON_ARRAY('wifi', 'air_conditioner', 'balcony'), 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'), 690000, 8.3, 87, 2, 2, FALSE, TRUE, TRUE),
('Old Quarter Boutique', 'Standard Cozy Room', 'old-quarter-boutique-standard-cozy-room', 'Ha Noi', '22 Hang Be, Hoan Kiem, Ha Noi', 'standard', 'Phong nho gon, trung tam pho co, hop di chuyen ngan ngay.', JSON_ARRAY('wifi', 'air_conditioner'), 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'), 520000, 7.9, 65, 2, 4, FALSE, FALSE, TRUE),
('Da Nang Beach Resort', 'Ocean Suite', 'da-nang-beach-resort-ocean-suite', 'Da Nang', '15 Vo Nguyen Giap, Son Tra, Da Nang', 'suite', 'Suite rong, tam nhin bien, thich hop nghi duong cao cap.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'pool', 'parking'), 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'), 1850000, 9.3, 241, 3, 6, TRUE, TRUE, TRUE),
('Da Nang Riverside Hotel', 'Family Balcony Room', 'da-nang-riverside-hotel-family-balcony-room', 'Da Nang', '64 Bach Dang, Hai Chau, Da Nang', 'family', 'Phong gia dinh co ban cong, gan song Han.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'balcony'), 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80'), 1240000, 8.7, 112, 4, 3, TRUE, TRUE, TRUE),
('Saigon Riverside Hotel', 'Family River Suite', 'saigon-riverside-hotel-family-river-suite', 'Ho Chi Minh', '12 Ton Duc Thang, District 1, Ho Chi Minh', 'family', 'Suite gia dinh rong, co khu tiep khach va bua sang.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'parking'), 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80'), 1450000, 9.1, 214, 4, 2, TRUE, TRUE, TRUE),
('Saigon Central Loft', 'Business Deluxe', 'saigon-central-loft-business-deluxe', 'Ho Chi Minh', '88 Nguyen Hue, District 1, Ho Chi Minh', 'deluxe', 'Phong deluxe danh cho chuyen di cong tac, ngay trung tam.', JSON_ARRAY('wifi', 'air_conditioner', 'parking'), 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80'), 980000, 8.5, 96, 2, 8, FALSE, TRUE, TRUE),
('Hoi An Lantern Stay', 'Garden Superior', 'hoi-an-lantern-stay-garden-superior', 'Hoi An', '07 Tran Hung Dao, Hoi An, Quang Nam', 'superior', 'Phong view vuon, phu hop ky nghi nhe nhang tai Hoi An.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'pool'), 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'), 790000, 8.9, 154, 2, 4, TRUE, TRUE, TRUE),
('Phu Quoc Pearl Resort', 'Island Pool Villa', 'phu-quoc-pearl-resort-island-pool-villa', 'Phu Quoc', 'Bai Truong, Duong To, Phu Quoc', 'suite', 'Villa rieng co ho boi, phu hop ky nghi gia dinh va cap doi.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'pool', 'parking'), 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'), 2450000, 9.4, 318, 4, 4, TRUE, TRUE, TRUE),
('Nha Trang Ocean Pearl', 'Superior Sea View', 'nha-trang-ocean-pearl-superior-sea-view', 'Nha Trang', '32 Tran Phu, Loc Tho, Nha Trang', 'superior', 'Phong view bien, gan quang truong va cac nha hang ven bien.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'pool'), 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'), 940000, 8.6, 132, 2, 7, TRUE, TRUE, TRUE),
('Da Lat Pine Valley Lodge', 'Attic Standard Room', 'da-lat-pine-valley-lodge-attic-standard-room', 'Da Lat', '18 Trieu Viet Vuong, Da Lat', 'standard', 'Phong ap mai am cung, gan rung thong va quan ca phe yen tinh.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast'), 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'), 620000, 8.4, 108, 2, 4, TRUE, FALSE, TRUE),
('Sa Pa Cloud Nine Lodge', 'Mountain Deluxe', 'sa-pa-cloud-nine-lodge-mountain-deluxe', 'Sa Pa', 'Muong Hoa, Sa Pa, Lao Cai', 'deluxe', 'Phong deluxe ngam nui, phu hop ky nghi yen tinh va san may.', JSON_ARRAY('wifi', 'breakfast', 'balcony'), 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80'), 890000, 8.8, 145, 2, 5, TRUE, TRUE, TRUE),
('DieuBel Grand Hoan Kiem', 'Executive Deluxe', 'dieubel-grand-hoan-kiem-executive-deluxe', 'Ha Noi', '18 Ly Thai To, Hoan Kiem, Ha Noi', 'deluxe', 'Phong deluxe gan ho Hoan Kiem, phu hop cong tac va nghi ngan ngay.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'parking'), 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'), 1120000, 9.0, 188, 2, 7, TRUE, TRUE, TRUE),
('Westlake Maison DieuBel', 'Family Lake Suite', 'westlake-maison-dieubel-family-lake-suite', 'Ha Noi', '12 Dang Thai Mai, Tay Ho, Ha Noi', 'family', 'Suite gia dinh rong, nhin ho Tay, co khu tiep khach va ban cong.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'balcony', 'parking'), 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'), 1680000, 9.2, 226, 5, 4, TRUE, TRUE, TRUE),
('My Khe Azure Resort', 'Premier Ocean Deluxe', 'my-khe-azure-resort-premier-ocean-deluxe', 'Da Nang', '120 Vo Nguyen Giap, Ngu Hanh Son, Da Nang', 'deluxe', 'Phong deluxe view bien My Khe, co cua kinh lon va khong gian nghi duong hien dai.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'pool', 'parking', 'balcony'), 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=1200&q=80'), 1580000, 9.1, 254, 3, 6, TRUE, TRUE, TRUE),
('Saigon Sky Residence', 'Executive Suite', 'saigon-sky-residence-executive-suite', 'Ho Chi Minh', '21 Nguyen Thi Minh Khai, District 1, Ho Chi Minh', 'suite', 'Suite cao tang voi tam nhin thanh pho, co khu lam viec rieng va phong khach.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'pool', 'parking'), 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80'), 2050000, 9.3, 288, 3, 5, TRUE, TRUE, TRUE);

INSERT INTO services (service_name, description, price, service_type, is_active) VALUES
('Bua sang buffet', 'Bua sang tai nha hang khach san.', 120000, 'food', TRUE),
('Dua don san bay', 'Xe rieng mot chieu tu hoac ra san bay.', 350000, 'transport', TRUE),
('Trang tri phong ky niem', 'Trang tri sinh nhat, tuan trang mat hoac dip dac biet.', 280000, 'other', TRUE),
('Spa thu gian', 'Goi massage thu gian 60 phut.', 450000, 'spa', TRUE),
('Thue xe may trong ngay', 'Xe may phuc vu di chuyen noi thanh.', 160000, 'transport', TRUE);

INSERT INTO vouchers (
  code, title, description, discount_type, discount_value, min_order_amount,
  max_discount_amount, service_benefit, start_at, end_at, total_quantity, is_active
) VALUES
('DIEUBEL10', 'Giam 10% booking dau tien', 'Uu dai cho khach moi dat phong lan dau.', 'percent', 0.10, 500000, 300000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 500, TRUE),
('NOIDIA06', 'Giam 6% khach san noi dia', 'Ap dung cho khach san trong nuoc tu 1.000.000 d.', 'percent', 0.06, 1000000, 250000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 400, TRUE),
('FAMILY08', 'Giam 8% phong gia dinh', 'Uu dai cho nhom ban va gia dinh.', 'percent', 0.08, 1500000, 350000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 300, TRUE),
('WEEKEND150', 'Giam 150.000 d cuoi tuan', 'Ap dung cho don tu 1.200.000 d.', 'fixed', 150000, 1200000, 150000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 250, TRUE),
('FREEBREAKFAST', 'Tang bua sang mien phi', 'Tang bua sang cho mot don dat phong du dieu kien.', 'service', 0, 700000, NULL, 'Bua sang mien phi', NOW(), DATE_ADD(NOW(), INTERVAL 75 DAY), 300, TRUE),
('AIRPORTCAR', 'Mien phi dua don san bay', 'Tang mot chieu dua don san bay cho don cao cap.', 'service', 0, 2500000, NULL, 'Dua don san bay mot chieu', NOW(), DATE_ADD(NOW(), INTERVAL 75 DAY), 120, TRUE);

INSERT INTO room_images (room_id, image_url, sort_order, is_cover)
SELECT id, image_url, 0, TRUE
FROM rooms
WHERE image_url IS NOT NULL;

INSERT INTO room_images (room_id, image_url, sort_order, is_cover)
SELECT id, JSON_UNQUOTE(JSON_EXTRACT(gallery_json, '$[1]')), 1, FALSE
FROM rooms
WHERE JSON_LENGTH(gallery_json) > 1;

