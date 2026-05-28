// Chức năng: Nghiệp vụ quản trị khách hàng và dashboard tổng quan.
// File này xử lý tổng quan admin, danh sách khách hàng và các thao tác tạo/sửa/xóa/khóa tài khoản khách.
const bcrypt = require("bcryptjs");
const ketNoiDb = require("../../config/coSoDuLieu");
const { damBaoCauTrucVanHanh } = require("../system/cauTrucVanHanh.service");

function taoLoi(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function chuanHoaEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function chuanHoaTenDangNhap(username = "") {
  return String(username).trim().toLowerCase();
}

function taoEmailNoiBo(username) {
  return `${username}.${Date.now()}@guest.dieubel.local`;
}

function mapKhachHang(row) {
  return {
    id: row.id,
    full_name: row.full_name,
    username: row.username,
    email: row.email,
    phone: row.phone,
    email_verified: Boolean(row.email_verified),
    role: row.role,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    booking_count: Number(row.booking_count || 0),
    total_spent: Number(row.total_spent || 0),
    last_booking_at: row.last_booking_at,
  };
}

async function layTongQuanQuanTri() {
  await damBaoCauTrucVanHanh();

  const [[bookingStats]] = await ketNoiDb.query(
    `SELECT
       COUNT(*) AS total_bookings,
       SUM(booking_status IN ('holding', 'pending')) AS pending_bookings,
       SUM(booking_status = 'confirmed') AS confirmed_bookings,
       SUM(booking_status = 'checked_in') AS checked_in_bookings,
       SUM(booking_status = 'cancel_requested') AS cancel_requested_bookings,
       SUM(booking_status IN ('cancelled', 'no_show')) AS cancelled_bookings,
       SUM(booking_status = 'confirmed' AND check_in_date = CURDATE()) AS arrivals_today,
       COALESCE(SUM(CASE WHEN booking_status IN ('holding', 'pending') THEN rooms_count ELSE 0 END), 0) AS pending_rooms,
       COALESCE(SUM(CASE WHEN booking_status = 'confirmed' THEN rooms_count ELSE 0 END), 0) AS confirmed_rooms,
       COALESCE(SUM(CASE WHEN booking_status = 'checked_in' THEN rooms_count ELSE 0 END), 0) AS checked_in_rooms,
       COALESCE(SUM(CASE WHEN payment_status IN ('paid', 'deposit_paid') THEN paid_amount ELSE 0 END), 0) AS paid_revenue,
       COALESCE(SUM(remaining_amount), 0) AS receivable_amount
     FROM bookings`,
  );

  const [[customerStats]] = await ketNoiDb.query(
    `SELECT
       COUNT(*) AS total_customers,
       SUM(status = 'active') AS active_customers,
       SUM(role = 'admin') AS admin_accounts,
       SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS new_customers_7d
     FROM users`,
  );

  const [[roomStats]] = await ketNoiDb.query(
    `SELECT
       COUNT(*) AS total_room_types,
       COALESCE(SUM(inventory_count), 0) AS available_rooms,
       SUM(inventory_count > 0 AND inventory_count <= 3) AS low_inventory_rooms,
       SUM(inventory_count <= 0) AS sold_out_rooms
     FROM rooms
     WHERE is_active = TRUE`,
  );

  const [[refundStats]] = await ketNoiDb.query(
    `SELECT
       COUNT(*) AS total_refund_requests,
       SUM(status = 'pending') AS pending_refunds,
       COALESCE(SUM(CASE WHEN status = 'pending' THEN refund_amount ELSE 0 END), 0) AS pending_refund_amount
     FROM refund_requests`,
  );

  return {
    stats: {
      totalBookings: Number(bookingStats.total_bookings || 0),
      pendingBookings: Number(bookingStats.pending_bookings || 0),
      confirmedBookings: Number(bookingStats.confirmed_bookings || 0),
      checkedInBookings: Number(bookingStats.checked_in_bookings || 0),
      cancelRequestedBookings: Number(
        bookingStats.cancel_requested_bookings || 0,
      ),
      cancelledBookings: Number(bookingStats.cancelled_bookings || 0),
      arrivalsToday: Number(bookingStats.arrivals_today || 0),
      pendingRooms: Number(bookingStats.pending_rooms || 0),
      confirmedRooms: Number(bookingStats.confirmed_rooms || 0),
      checkedInRooms: Number(bookingStats.checked_in_rooms || 0),
      reservedRooms:
        Number(bookingStats.pending_rooms || 0) +
        Number(bookingStats.confirmed_rooms || 0),
      paidRevenue: Number(bookingStats.paid_revenue || 0),
      receivableAmount: Number(bookingStats.receivable_amount || 0),
      totalCustomers: Number(customerStats.total_customers || 0),
      activeCustomers: Number(customerStats.active_customers || 0),
      adminAccounts: Number(customerStats.admin_accounts || 0),
      newCustomers7d: Number(customerStats.new_customers_7d || 0),
      totalRoomTypes: Number(roomStats.total_room_types || 0),
      availableRooms: Number(roomStats.available_rooms || 0),
      lowInventoryRooms: Number(roomStats.low_inventory_rooms || 0),
      soldOutRooms: Number(roomStats.sold_out_rooms || 0),
      totalRefundRequests: Number(refundStats.total_refund_requests || 0),
      pendingRefunds: Number(refundStats.pending_refunds || 0),
      pendingRefundAmount: Number(refundStats.pending_refund_amount || 0),
    },
  };
}

async function layDanhSachKhachHang({
  search = "",
  status = "",
  role = "customer",
} = {}) {
  await damBaoCauTrucVanHanh();

  const conditions = [];
  const values = [];

  if (role !== "all") {
    conditions.push("u.role = ?");
    values.push(role);
  }

  if (status && status !== "all") {
    conditions.push("u.status = ?");
    values.push(status);
  }

  const keyword = String(search || "")
    .trim()
    .toLowerCase();
  if (keyword) {
    conditions.push(
      "(LOWER(u.full_name) LIKE ? OR LOWER(u.username) LIKE ? OR LOWER(u.email) LIKE ? OR u.phone LIKE ?)",
    );
    values.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const [rows] = await ketNoiDb.query(
    `SELECT
       u.id,
       u.full_name,
       u.username,
       u.email,
       u.phone,
       u.email_verified,
       u.role,
       u.status,
       u.created_at,
       u.updated_at,
       COUNT(b.id) AS booking_count,
       COALESCE(SUM(CASE WHEN b.payment_status IN ('paid', 'deposit_paid') THEN b.paid_amount ELSE 0 END), 0) AS total_spent,
       MAX(b.booked_at) AS last_booking_at
     FROM users u
     LEFT JOIN bookings b ON b.user_id = u.id
     ${whereClause}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT 300`,
    values,
  );

  return rows.map(mapKhachHang);
}

async function layChiTietKhachHang(userId) {
  await damBaoCauTrucVanHanh();

  const [customers] = await ketNoiDb.query(
    `SELECT
       u.id,
       u.full_name,
       u.username,
       u.email,
       u.phone,
       u.email_verified,
       u.role,
       u.status,
       u.created_at,
       u.updated_at,
       COUNT(b.id) AS booking_count,
       COALESCE(SUM(CASE WHEN b.payment_status IN ('paid', 'deposit_paid') THEN b.paid_amount ELSE 0 END), 0) AS total_spent,
       MAX(b.booked_at) AS last_booking_at
     FROM users u
     LEFT JOIN bookings b ON b.user_id = u.id
     WHERE u.id = ?
     GROUP BY u.id
     LIMIT 1`,
    [userId],
  );

  if (!customers.length) throw taoLoi(404, "Khong tim thay khach hang.");

  const [bookings] = await ketNoiDb.query(
    `SELECT
       b.booking_code,
       b.booking_status,
       b.payment_status,
       b.total_price,
       b.paid_amount,
       b.remaining_amount,
       b.booked_at,
       DATE_FORMAT(b.check_in_date, '%Y-%m-%d') AS check_in_date,
       DATE_FORMAT(b.check_out_date, '%Y-%m-%d') AS check_out_date,
       r.hotel_name,
       r.room_name
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     WHERE b.user_id = ?
     ORDER BY b.booked_at DESC
     LIMIT 30`,
    [userId],
  );

  return {
    customer: mapKhachHang(customers[0]),
    bookings,
  };
}

async function taoKhachHang({ payload, adminId }) {
  await damBaoCauTrucVanHanh();

  const username = chuanHoaTenDangNhap(payload.username);
  const password = String(payload.password || "");
  const fullName = String(
    payload.full_name || payload.fullName || payload.display_name || username,
  ).trim();
  const phone = String(payload.phone || "").trim() || null;
  const status = payload.status === "inactive" ? "inactive" : "active";
  const emailInput = String(payload.email || "").trim();
  const email = emailInput
    ? chuanHoaEmail(emailInput)
    : taoEmailNoiBo(username);

  if (!username || !password) {
    throw taoLoi(400, "Vui long nhap username va mat khau.");
  }

  if (password.length < 6) {
    throw taoLoi(400, "Mat khau can it nhat 6 ky tu.");
  }

  if (!fullName) {
    throw taoLoi(400, "Vui long nhap ten hien thi hoac username.");
  }

  const [duplicateRows] = await ketNoiDb.query(
    "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
    [email, username],
  );

  if (duplicateRows.length) {
    throw taoLoi(409, "Email hoac ten tai khoan da ton tai.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await ketNoiDb.query(
    `INSERT INTO users (full_name, username, email, password_hash, phone, email_verified, role, status)
     VALUES (?, ?, ?, ?, ?, TRUE, 'customer', ?)`,
    [fullName, username, email, passwordHash, phone, status],
  );

  await ketNoiDb.query(
    `INSERT INTO admin_audit_logs (admin_id, action_type, target_table, target_id, description)
     VALUES (?, 'create_customer', 'users', ?, ?)`,
    [adminId, result.insertId, `Tao tai khoan khach hang ${username}`],
  );

  return layChiTietKhachHang(result.insertId);
}

async function capNhatKhachHang({ userId, payload, adminId }) {
  await damBaoCauTrucVanHanh();

  const fullName = String(payload.full_name || payload.fullName || "").trim();
  const phone = String(payload.phone || "").trim() || null;
  const username = chuanHoaTenDangNhap(payload.username);
  const email = chuanHoaEmail(payload.email);
  const status = payload.status === "inactive" ? "inactive" : "active";

  if (!fullName || !username || !email) {
    throw taoLoi(400, "Vui long nhap ten, username va email.");
  }

  const [duplicateRows] = await ketNoiDb.query(
    "SELECT id FROM users WHERE (email = ? OR username = ?) AND id <> ? LIMIT 1",
    [email, username, userId],
  );

  if (duplicateRows.length) {
    throw taoLoi(409, "Email hoac ten tai khoan da ton tai.");
  }

  const [result] = await ketNoiDb.query(
    `UPDATE users
     SET full_name = ?,
         username = ?,
         email = ?,
         phone = ?,
         status = ?
     WHERE id = ? AND role <> 'admin'`,
    [fullName, username, email, phone, status, userId],
  );

  if (!result.affectedRows) {
    throw taoLoi(
      404,
      "Khong tim thay khach hang hoac khong duoc sua tai khoan admin.",
    );
  }

  await ketNoiDb.query(
    `INSERT INTO admin_audit_logs (admin_id, action_type, target_table, target_id, description)
     VALUES (?, 'update_customer', 'users', ?, ?)`,
    [adminId, userId, "Cap nhat thong tin khach hang"],
  );

  return layChiTietKhachHang(userId);
}

async function capNhatTrangThaiKhachHang({ userId, status, adminId }) {
  await damBaoCauTrucVanHanh();

  const nextStatus = status === "inactive" ? "inactive" : "active";
  const [result] = await ketNoiDb.query(
    "UPDATE users SET status = ? WHERE id = ? AND role <> 'admin'",
    [nextStatus, userId],
  );

  if (!result.affectedRows) {
    throw taoLoi(
      404,
      "Không tìm thấy khách hàng hoặc không được khóa tài khoản admin.",
    );
  }

  await ketNoiDb.query(
    `INSERT INTO admin_audit_logs (admin_id, action_type, target_table, target_id, description)
     VALUES (?, 'update_customer_status', 'users', ?, ?)`,
    [adminId, userId, `Cập nhật trạng thái khách hàng: ${nextStatus}`],
  );

  return layChiTietKhachHang(userId);
}

async function xoaKhachHang({ userId, adminId }) {
  await damBaoCauTrucVanHanh();

  const [[bookingStats]] = await ketNoiDb.query(
    "SELECT COUNT(*) AS total FROM bookings WHERE user_id = ?",
    [userId],
  );

  if (Number(bookingStats.total || 0) > 0) {
    await capNhatTrangThaiKhachHang({ userId, status: "inactive", adminId });
    return {
      mode: "soft",
      message:
        "Khách hàng đã có đơn đặt phòng nên hệ thống đã khóa tài khoản thay vì xóa dữ liệu.",
      customers: await layDanhSachKhachHang(),
    };
  }

  await ketNoiDb.query("DELETE FROM email_otps WHERE user_id = ?", [userId]);

  const [result] = await ketNoiDb.query(
    "DELETE FROM users WHERE id = ? AND role <> 'admin'",
    [userId],
  );
  if (!result.affectedRows) {
    throw taoLoi(
      404,
      "Không tìm thấy khách hàng hoặc không được xóa tài khoản admin.",
    );
  }

  await ketNoiDb.query(
    `INSERT INTO admin_audit_logs (admin_id, action_type, target_table, target_id, description)
     VALUES (?, 'delete_customer', 'users', ?, ?)`,
    [adminId, userId, "Xóa khách hàng chưa có đơn đặt phòng"],
  );

  return {
    mode: "hard",
    message: "Đã xóa khách hàng chưa có đơn đặt phòng khỏi MySQL.",
    customers: await layDanhSachKhachHang(),
  };
}

module.exports = {
  layTongQuanQuanTri,
  layDanhSachKhachHang,
  layChiTietKhachHang,
  taoKhachHang,
  capNhatKhachHang,
  capNhatTrangThaiKhachHang,
  xoaKhachHang,
};
