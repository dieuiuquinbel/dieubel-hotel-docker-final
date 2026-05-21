SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    CONSTRAINT fk_email_otps_user FOREIGN KEY (user_id) REFERENCES users(id)
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
    nights INT NOT NULL,
    room_price DECIMAL(12,2) NOT NULL,
    service_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    note VARCHAR(255) NULL,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE invoices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    invoice_code VARCHAR(50) NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE services (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(120) NOT NULL,
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
    CONSTRAINT fk_booking_services_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    CONSTRAINT fk_booking_services_service FOREIGN KEY (service_id) REFERENCES services(id)
);
