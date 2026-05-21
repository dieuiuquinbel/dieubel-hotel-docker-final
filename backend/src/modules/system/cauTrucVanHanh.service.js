// Module system: dam bao cac bang/cot mo rong ton tai truoc khi xu ly nghiep vu.
const ketNoiDb = require('../../config/coSoDuLieu');

let khoiTaoCauTrucVanHanhPromise = null;

async function damBaoCauTrucVanHanh() {
  if (!khoiTaoCauTrucVanHanhPromise) {
    khoiTaoCauTrucVanHanhPromise = (async () => {
      await ketNoiDb.query(
        `ALTER TABLE bookings
         MODIFY booking_status ENUM(
           'pending',
           'holding',
           'confirmed',
           'cancel_requested',
           'checked_in',
           'checked_out',
           'cancelled',
           'expired',
           'completed',
           'no_show'
         ) NOT NULL DEFAULT 'holding'`,
      );

      await ketNoiDb.query(
        `ALTER TABLE bookings
         MODIFY payment_status ENUM(
           'unpaid',
           'deposit_paid',
           'paid',
           'pay_at_counter',
           'refunded'
         ) NOT NULL DEFAULT 'unpaid'`,
      );

      await ketNoiDb.query(
        `CREATE TABLE IF NOT EXISTS vouchers (
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
        )`,
      );

      await ketNoiDb.query(
        `CREATE TABLE IF NOT EXISTS user_vouchers (
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
        )`,
      );

      await ketNoiDb.query(
        `CREATE TABLE IF NOT EXISTS payment_transactions (
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
        )`,
      );

      await ketNoiDb.query(
        `CREATE TABLE IF NOT EXISTS booking_status_logs (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          booking_id BIGINT NOT NULL,
          old_status VARCHAR(40) NULL,
          new_status VARCHAR(40) NOT NULL,
          note VARCHAR(255) NULL,
          changed_by BIGINT NULL,
          changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_booking_status_logs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
          CONSTRAINT fk_booking_status_logs_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
        )`,
      );

      await ketNoiDb.query(
        `CREATE TABLE IF NOT EXISTS refund_requests (
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
          status ENUM('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
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
        )`,
      );

      await ketNoiDb.query(
        `CREATE TABLE IF NOT EXISTS support_tickets (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          ticket_code VARCHAR(50) NOT NULL UNIQUE,
          user_id BIGINT NOT NULL,
          booking_id BIGINT NULL,
          category ENUM('booking','payment','refund','service','account','other') NOT NULL DEFAULT 'other',
          title VARCHAR(160) NOT NULL,
          content TEXT NOT NULL,
          status ENUM('new','processing','resolved','closed') NOT NULL DEFAULT 'new',
          admin_reply TEXT NULL,
          replied_by BIGINT NULL,
          replied_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_support_tickets_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
          CONSTRAINT fk_support_tickets_admin FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL
        )`,
      );

      await ketNoiDb.query(
        `CREATE TABLE IF NOT EXISTS customer_feedbacks (
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
        )`,
      );

      await ketNoiDb.query(
        `CREATE TABLE IF NOT EXISTS admin_audit_logs (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          admin_id BIGINT NULL,
          action_type VARCHAR(80) NOT NULL,
          target_table VARCHAR(80) NOT NULL,
          target_id VARCHAR(80) NULL,
          description VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_admin_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
        )`,
      );

      await ketNoiDb.query(
        `INSERT INTO vouchers (
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
          is_active = VALUES(is_active)`,
      );
    })().catch((error) => {
      khoiTaoCauTrucVanHanhPromise = null;
      throw error;
    });
  }

  return khoiTaoCauTrucVanHanhPromise;
}

module.exports = {
  damBaoCauTrucVanHanh,
};
