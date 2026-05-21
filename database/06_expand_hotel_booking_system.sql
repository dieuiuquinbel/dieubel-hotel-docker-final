SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Mo rong database DieuBel cho cac chuc nang frontend/admin dang co.
-- Chay sau cac file 01 -> 05 trong MySQL Workbench.

USE hotel_booking_db;

DROP PROCEDURE IF EXISTS add_column_if_missing;
DELIMITER $$
CREATE PROCEDURE add_column_if_missing(
  IN table_name_input VARCHAR(64),
  IN column_name_input VARCHAR(64),
  IN column_definition_input TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_input
      AND COLUMN_NAME = column_name_input
  ) THEN
    SET @add_column_sql = CONCAT('ALTER TABLE `', table_name_input, '` ADD COLUMN ', column_definition_input);
    PREPARE add_column_stmt FROM @add_column_sql;
    EXECUTE add_column_stmt;
    DEALLOCATE PREPARE add_column_stmt;
  END IF;
END$$
DELIMITER ;

-- 1. Bo sung cot cho bang users.
-- Tai khoan admin mac dinh duoc backend tao/cap nhat khi khoi dong:
-- username: admin
-- password: admin123
CALL add_column_if_missing('users', 'avatar_url', '`avatar_url` VARCHAR(500) NULL AFTER `phone`');
CALL add_column_if_missing('users', 'last_login_at', '`last_login_at` TIMESTAMP NULL AFTER `status`');

-- 2. Bo sung trang thai va cot nghiep vu cho bookings.
ALTER TABLE bookings
  MODIFY booking_status ENUM('pending', 'holding', 'confirmed', 'cancel_requested', 'checked_in', 'checked_out', 'cancelled', 'expired', 'completed', 'no_show') NOT NULL DEFAULT 'holding',
  MODIFY payment_status ENUM('unpaid', 'deposit_paid', 'paid', 'pay_at_counter', 'refunded') NOT NULL DEFAULT 'unpaid';

CALL add_column_if_missing('bookings', 'booking_type', '`booking_type` ENUM(''overnight'', ''day_use'') NOT NULL DEFAULT ''overnight'' AFTER `rooms_count`');
CALL add_column_if_missing('bookings', 'original_total_price', '`original_total_price` DECIMAL(12,2) NULL AFTER `service_price`');
CALL add_column_if_missing('bookings', 'discount_amount', '`discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER `original_total_price`');
CALL add_column_if_missing('bookings', 'deposit_amount', '`deposit_amount` DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER `total_price`');
CALL add_column_if_missing('bookings', 'paid_amount', '`paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER `deposit_amount`');
CALL add_column_if_missing('bookings', 'remaining_amount', '`remaining_amount` DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER `paid_amount`');
CALL add_column_if_missing('bookings', 'voucher_code', '`voucher_code` VARCHAR(50) NULL AFTER `payment_method`');
CALL add_column_if_missing('bookings', 'payment_code', '`payment_code` VARCHAR(80) NULL AFTER `voucher_code`');
CALL add_column_if_missing('bookings', 'transfer_content', '`transfer_content` VARCHAR(120) NULL AFTER `payment_code`');
CALL add_column_if_missing('bookings', 'payment_deadline', '`payment_deadline` TIMESTAMP NULL AFTER `booked_at`');
CALL add_column_if_missing('bookings', 'confirmed_at', '`confirmed_at` TIMESTAMP NULL AFTER `payment_deadline`');
CALL add_column_if_missing('bookings', 'paid_at', '`paid_at` TIMESTAMP NULL AFTER `confirmed_at`');
CALL add_column_if_missing('bookings', 'checked_in_at', '`checked_in_at` TIMESTAMP NULL AFTER `paid_at`');
CALL add_column_if_missing('bookings', 'checked_out_at', '`checked_out_at` TIMESTAMP NULL AFTER `checked_in_at`');
CALL add_column_if_missing('bookings', 'no_show_at', '`no_show_at` TIMESTAMP NULL AFTER `checked_out_at`');
CALL add_column_if_missing('bookings', 'checkin_qr_token', '`checkin_qr_token` VARCHAR(120) NULL AFTER `no_show_at`');
CALL add_column_if_missing('bookings', 'cancel_reason', '`cancel_reason` VARCHAR(255) NULL AFTER `cancelled_at`');
CALL add_column_if_missing('bookings', 'admin_note', '`admin_note` TEXT NULL AFTER `note`');

UPDATE bookings
SET
  original_total_price = COALESCE(original_total_price, total_price),
  deposit_amount = IF(deposit_amount = 0, CEIL(total_price * 0.1), deposit_amount),
  paid_amount = COALESCE(paid_amount, 0),
  remaining_amount = IF(remaining_amount = 0, GREATEST(total_price - COALESCE(paid_amount, 0), 0), remaining_amount),
  payment_deadline = COALESCE(payment_deadline, DATE_ADD(booked_at, INTERVAL 15 MINUTE))
WHERE id >= 0;

-- 3. Anh phong tach rieng de gallery day du hon.
CREATE TABLE IF NOT EXISTS room_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_room_images_room_url (room_id, image_url(255)),
  CONSTRAINT fk_room_images_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 4. Voucher va kho voucher cua tung tai khoan.
CREATE TABLE IF NOT EXISTS vouchers (
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

CREATE TABLE IF NOT EXISTS user_vouchers (
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

-- 5. Lich su thanh toan va tien trinh xu ly don.
CREATE TABLE IF NOT EXISTS payment_transactions (
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

CREATE TABLE IF NOT EXISTS booking_status_logs (
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

-- 6A. Yeu cau huy phong / hoan tien.
CREATE TABLE IF NOT EXISTS refund_requests (
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

-- 6B. Trung tam ho tro / khieu nai tren MePage.
CREATE TABLE IF NOT EXISTS support_tickets (
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

-- 6. Phan hoi / khieu nai cua khach hang.
CREATE TABLE IF NOT EXISTS customer_feedbacks (
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

-- 7. Danh gia, yeu thich va audit admin.
CREATE TABLE IF NOT EXISTS room_reviews (
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

CREATE TABLE IF NOT EXISTS favorite_rooms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_favorite_rooms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_rooms_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT uq_favorite_room UNIQUE (user_id, room_id)
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT NULL,
  action_type VARCHAR(80) NOT NULL,
  target_table VARCHAR(80) NOT NULL,
  target_id VARCHAR(80) NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Seed voucher mau.
INSERT INTO vouchers (
  code, title, description, discount_type, discount_value, min_order_amount, max_discount_amount,
  service_benefit, start_at, end_at, total_quantity, is_active
) VALUES
('DIEUBEL10', 'Giảm 10% booking đầu tiên', 'Ưu đãi cho khách mới đặt phòng lần đầu.', 'percent', 0.10, 500000, 300000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 500, TRUE),
('NOIDIA06', 'Giảm 6% khách sạn nội địa', 'Áp dụng cho khách sạn trong nước từ 1.000.000 đ.', 'percent', 0.06, 1000000, 250000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 400, TRUE),
('FAMILY08', 'Giảm 8% phòng gia đình', 'Ưu đãi cho nhóm bạn và gia đình.', 'percent', 0.08, 1500000, 350000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 300, TRUE),
('WEEKEND150', 'Giảm 150.000 đ cuối tuần', 'Áp dụng cho đơn từ 1.200.000 đ.', 'fixed', 150000, 1200000, 150000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 250, TRUE),
('FREEBREAKFAST', 'Tặng bữa sáng miễn phí', 'Tặng bữa sáng cho một đơn đặt phòng đủ điều kiện.', 'service', 0, 700000, NULL, 'Bữa sáng miễn phí', NOW(), DATE_ADD(NOW(), INTERVAL 75 DAY), 300, TRUE),
('AIRPORTCAR', 'Miễn phí đưa đón sân bay', 'Tặng một chiều đưa đón sân bay cho đơn cao cấp.', 'service', 0, 2500000, NULL, 'Đưa đón sân bay một chiều', NOW(), DATE_ADD(NOW(), INTERVAL 75 DAY), 120, TRUE)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  discount_type = VALUES(discount_type),
  discount_value = VALUES(discount_value),
  min_order_amount = VALUES(min_order_amount),
  max_discount_amount = VALUES(max_discount_amount),
  service_benefit = VALUES(service_benefit),
  end_at = VALUES(end_at),
  total_quantity = VALUES(total_quantity),
  is_active = VALUES(is_active);

-- 9. Seed them dich vu khach san.
INSERT INTO services (service_name, description, price, service_type, is_active)
SELECT seed.service_name, seed.description, seed.price, seed.service_type, seed.is_active
FROM (
  SELECT 'Bữa sáng buffet' service_name, 'Bữa sáng tại nhà hàng khách sạn.' description, 120000 price, 'food' service_type, TRUE is_active
  UNION ALL SELECT 'Đưa đón sân bay', 'Xe riêng một chiều từ hoặc ra sân bay.', 350000, 'transport', TRUE
  UNION ALL SELECT 'Trang trí phòng kỷ niệm', 'Trang trí sinh nhật, tuần trăng mật hoặc dịp đặc biệt.', 280000, 'other', TRUE
  UNION ALL SELECT 'Spa thư giãn', 'Gói massage thư giãn 60 phút.', 450000, 'spa', TRUE
  UNION ALL SELECT 'Thuê xe máy trong ngày', 'Xe máy phục vụ di chuyển nội thành.', 160000, 'transport', TRUE
) seed
WHERE NOT EXISTS (
  SELECT 1 FROM services s WHERE s.service_name = seed.service_name
);

-- 10. Seed anh cover phu tu gallery_json co san.
INSERT INTO room_images (room_id, image_url, sort_order, is_cover)
SELECT id, image_url, 0, TRUE
FROM rooms
WHERE image_url IS NOT NULL
ON DUPLICATE KEY UPDATE image_url = VALUES(image_url);

DROP PROCEDURE IF EXISTS add_column_if_missing;
