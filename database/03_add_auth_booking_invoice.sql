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
    SET @sql = CONCAT('ALTER TABLE `', table_name_input, '` ADD COLUMN ', column_definition_input);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL add_column_if_missing('users', 'username', '`username` VARCHAR(80) NULL UNIQUE AFTER `full_name`');
CALL add_column_if_missing('users', 'email_verified', '`email_verified` BOOLEAN NOT NULL DEFAULT FALSE AFTER `phone`');

UPDATE users
SET username = LOWER(SUBSTRING_INDEX(email, '@', 1))
WHERE username IS NULL OR username = '';

ALTER TABLE users
  MODIFY username VARCHAR(80) NOT NULL;

CREATE TABLE IF NOT EXISTS email_otps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  email VARCHAR(150) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose ENUM('register_verify') NOT NULL DEFAULT 'register_verify',
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_email_otps_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CALL add_column_if_missing('bookings', 'booking_code', '`booking_code` VARCHAR(50) NULL UNIQUE AFTER `id`');
CALL add_column_if_missing('bookings', 'rooms_count', '`rooms_count` INT NOT NULL DEFAULT 1 AFTER `guests`');

UPDATE bookings
SET booking_code = CONCAT('SN-', id, '-', DATE_FORMAT(booked_at, '%Y%m%d'))
WHERE booking_code IS NULL OR booking_code = '';

ALTER TABLE bookings
  MODIFY booking_code VARCHAR(50) NOT NULL;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  invoice_code VARCHAR(50) NOT NULL UNIQUE,
  file_path VARCHAR(500) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

DROP PROCEDURE IF EXISTS add_column_if_missing;
