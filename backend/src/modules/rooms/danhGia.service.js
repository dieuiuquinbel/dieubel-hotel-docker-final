// Chức năng: Xử lý nghiệp vụ lưu trữ đánh giá, tính điểm trung bình và lấy danh sách đánh giá từ MySQL.
const ketNoiDb = require('../../config/coSoDuLieu');

function taoLoi(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/**
 * Tạo đánh giá mới cho đơn đặt phòng, tự động tính toán lại điểm trung bình của phòng
 */
async function taoDanhGiaPhong({ user, bookingCode, rating, content }) {
  const connection = await ketNoiDb.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Tìm đơn đặt phòng tương ứng
    const [bookings] = await connection.query(
      `SELECT id, room_id, user_id, booking_status FROM bookings WHERE booking_code = ? LIMIT 1`,
      [bookingCode]
    );

    if (bookings.length === 0) {
      throw taoLoi(404, 'Không tìm thấy đơn đặt phòng tương ứng.');
    }

    const booking = bookings[0];

    // 2. Xác minh quyền sở hữu — dùng Number() để tránh lỗi so sánh BigInt vs Number
    if (Number(booking.user_id) !== Number(user.id)) {
      throw taoLoi(403, 'Bạn không có quyền đánh giá đơn đặt phòng này.');
    }

    // 3. Xác minh trạng thái đơn hàng (phải là checked_out)
    if (booking.booking_status !== 'checked_out') {
      throw taoLoi(400, `Chỉ có thể đánh giá sau khi đã hoàn thành trả phòng. Trạng thái hiện tại: ${booking.booking_status}.`);
    }

    // 4. Kiểm tra xem đã được đánh giá chưa
    const [existingReviews] = await connection.query(
      `SELECT id FROM room_reviews WHERE booking_id = ? LIMIT 1`,
      [booking.id]
    );

    if (existingReviews.length > 0) {
      throw taoLoi(400, 'Đơn đặt phòng này đã được đánh giá trước đó.');
    }

    // 5. Thêm đánh giá mới vào MySQL
    const [result] = await connection.query(
      `INSERT INTO room_reviews (room_id, booking_id, user_id, rating, content, status) VALUES (?, ?, ?, ?, ?, 'visible')`,
      [booking.room_id, booking.id, user.id, Number(rating || 5), String(content || '').trim()]
    );

    // 6. Tính toán lại rating_avg và total_reviews cho phòng đó
    const [stats] = await connection.query(
      `SELECT COUNT(id) AS total_reviews, AVG(rating) AS rating_avg 
       FROM room_reviews 
       WHERE room_id = ? AND status = 'visible'`,
      [booking.room_id]
    );

    const totalReviews = stats[0].total_reviews || 0;
    const ratingAvg = parseFloat(stats[0].rating_avg || 0).toFixed(1);

    // 7. Cập nhật vào bảng rooms
    await connection.query(
      `UPDATE rooms SET rating_avg = ?, total_reviews = ? WHERE id = ?`,
      [ratingAvg, totalReviews, booking.room_id]
    );

    await connection.commit();

    return {
      id: result.insertId,
      roomId: booking.room_id,
      bookingId: booking.id,
      userId: user.id,
      rating: Number(rating),
      content,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Lấy danh sách đánh giá của phòng từ database
 */
async function layDanhGiaCuaPhong(roomId) {
  const [rows] = await ketNoiDb.query(
    `SELECT rr.id, rr.rating, rr.content, rr.created_at, u.full_name, u.username
     FROM room_reviews rr
     JOIN users u ON rr.user_id = u.id
     WHERE rr.room_id = ? AND rr.status = 'visible'
     ORDER BY rr.created_at DESC`,
    [roomId]
  );

  return rows.map((row) => ({
    id: `DB-RV-${row.id}`,
    user: row.full_name || row.username || 'Khách hàng ẩn danh',
    date: row.created_at,
    rating: Number(row.rating),
    comment: row.content || '',
  }));
}

module.exports = {
  taoDanhGiaPhong,
  layDanhGiaCuaPhong,
};
