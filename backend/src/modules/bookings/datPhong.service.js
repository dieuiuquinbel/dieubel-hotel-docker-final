// Chức năng: Nghiệp vụ tạo đơn đặt phòng, giữ tồn kho và tạo hóa đơn.
//  Tạo đơn đặt phòng, khóa MySQL, hóa đơn
const ketNoiDb = require("../../config/coSoDuLieu");
const { layPhongTheoId } = require("../rooms/phong.service");
const { taoFileHoaDon, dinhDangTien } = require("../invoices/hoaDon.service");
const { guiMail } = require("../notifications/thuDienTu.service");

function taoLoi(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function tinhSoDem(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff) || diff <= 0) return 1;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

async function sinhMaDatPhongDuyNhat(connection) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed easily confused characters: O, 0, I, 1, L
  let isUnique = false;
  let code = "";
  
  while (!isUnique) {
    let randomPart = "";
    for (let i = 0; i < 5; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    code = `DB-${randomPart}`;
    
    // Check if code already exists in bookings table
    const [rows] = await connection.query(
      "SELECT id FROM bookings WHERE booking_code = ? LIMIT 1",
      [code]
    );
    if (rows.length === 0) {
      isUnique = true;
    }
  }
  return code;
}

function chuanHoaDichVu(services = []) {
  if (!Array.isArray(services)) return [];

  return services
    .map((service) => ({
      title: String(service.title || service.service_name || "").trim(),
      price: Number(service.price ?? service.priceValue ?? 0),
      quantity: Math.max(Number(service.quantity || 1), 1),
    }))
    .filter((service) => service.title);
}

function dichVuThanhChu(services) {
  if (!services.length) return "Khong co";

  return services
    .map(
      (service) =>
        `${service.title} x${service.quantity} (${dinhDangTien(service.price * service.quantity)})`,
    )
    .join(", ");
}

async function taoDatPhong({ user, payload }) {
  if (!user?.email_verified) {
    throw taoLoi(403, "Vui long xac minh email truoc khi dat phong.");
  }

  const room = await layPhongTheoId(payload.roomId);

  if (!room) {
    throw taoLoi(404, "Khong tim thay phong.");
  }

  const checkIn = payload.checkIn || payload.check_in_date;
  const checkOut = payload.checkOut || payload.check_out_date;
  const guests = Math.max(Number(payload.guests || 1), 1);
  const roomsCount = Math.max(
    Number(payload.rooms || payload.roomsCount || 1),
    1,
  );
  const nights = tinhSoDem(checkIn, checkOut);
  const selectedServices = chuanHoaDichVu(payload.services);
  const servicePrice = selectedServices.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0,
  );
  const roomPrice = Number(room.price_per_night || 0) * nights * roomsCount;
  const totalPrice = roomPrice + servicePrice;
  const servicesText = dichVuThanhChu(selectedServices);

  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();

    const bookingCode = await sinhMaDatPhongDuyNhat(connection);

    const [lockedRooms] = await connection.query(
      `SELECT id, inventory_count
       FROM rooms
       WHERE id = ? AND is_active = TRUE
       FOR UPDATE`,
      [room.id],
    );

    if (!lockedRooms.length) {
      throw taoLoi(404, "Khong tim thay phong dang hoat dong.");
    }

    const currentInventory = Number(lockedRooms[0].inventory_count || 0);
    if (currentInventory < roomsCount) {
      throw taoLoi(
        409,
        `Chi con ${currentInventory} phong trong MySQL, khong du de giu ${roomsCount} phong.`,
      );
    }

    await connection.query(
      "UPDATE rooms SET inventory_count = inventory_count - ? WHERE id = ?",
      [roomsCount, room.id],
    );

    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (
        booking_code,
        user_id,
        room_id,
        check_in_date,
        check_out_date,
        guests,
        rooms_count,
        nights,
        room_price,
        service_price,
        original_total_price,
        deposit_amount,
        paid_amount,
        remaining_amount,
        total_price,
        booking_status,
        payment_status,
        payment_method,
        payment_deadline,
        note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'holding', 'unpaid', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), ?)`,
      [
        bookingCode,
        user.id,
        room.id,
        checkIn,
        checkOut,
        guests,
        roomsCount,
        nights,
        roomPrice,
        servicePrice,
        totalPrice,
        Math.ceil(totalPrice * 0.1),
        totalPrice,
        totalPrice,
        payload.paymentMethod || "pay_at_hotel",
        servicesText,
      ],
    );

    const booking = {
      id: bookingResult.insertId,
      booking_code: bookingCode,
      user_id: user.id,
      room_id: room.id,
      check_in_date: checkIn,
      check_out_date: checkOut,
      guests,
      rooms_count: roomsCount,
      nights,
      room_price: roomPrice,
      service_price: servicePrice,
      total_price: totalPrice,
      deposit_amount: Math.ceil(totalPrice * 0.1),
      paid_amount: 0,
      remaining_amount: totalPrice,
      payment_method: payload.paymentMethod || "pay_at_hotel",
    };

    const invoice = await taoFileHoaDon({
      booking,
      room,
      user,
      servicesText,
    });

    await connection.query(
      `INSERT INTO invoices (booking_id, invoice_code, file_path, total_amount)
       VALUES (?, ?, ?, ?)`,
      [booking.id, invoice.invoiceCode, invoice.filePath, totalPrice],
    );

    await connection.commit();

    room.inventory_count = currentInventory - roomsCount;

    let emailWarning = null;
    try {
      await guiEmailXacNhanDatPhong({
        user,
        room,
        booking,
        servicesText,
        invoicePath: invoice.filePath,
        invoiceCode: invoice.invoiceCode,
      });
    } catch (emailError) {
      emailWarning =
        "Da tao don dat phong nhung khong gui duoc email xac nhan.";
      console.warn(
        `Khong the gui email xac nhan ${booking.booking_code}: ${emailError.message}`,
      );
    }

    return {
      booking,
      room,
      invoice,
      emailWarning,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function guiEmailXacNhanDatPhong({
  user,
  room,
  booking,
  servicesText,
  invoicePath,
  invoiceCode,
}) {
  await guiMail({
    to: user.email,
    subject: `Xác nhận đặt phòng StayNest - ${booking.booking_code}`,
    html: `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Xác nhận đặt phòng StayNest - ${booking.booking_code}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px; color: #ffffff; text-align: center;">
      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">StayNest</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #93c5fd;">Đặt phòng thành công!</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 35px;">
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 15px 0; text-align: center;">Thông Tin Xác Nhận</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        Chào bạn, đơn đặt phòng của bạn tại <strong>StayNest</strong> đã được ghi nhận thành công. Dưới đây là chi tiết đặt phòng của bạn:
      </p>
      
      <!-- Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Mã đặt phòng</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">${booking.booking_code}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Khách sạn</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">DieuBel</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Tên phòng</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${room.room_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Loại phòng</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${room.room_type}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Ngày nhận phòng</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${booking.check_in_date}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Ngày trả phòng</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${booking.check_out_date}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Số lượng đặt</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${booking.guests} khách / ${booking.rooms_count} phòng</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Dịch vụ đã đặt</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${servicesText || 'Không có'}</td>
        </tr>
        <tr>
          <td style="padding: 16px 0 0 0; font-size: 16px; color: #0f172a; font-weight: 700;">Tổng số tiền</td>
          <td style="padding: 16px 0 0 0; font-size: 20px; color: #1e40af; font-weight: 800; text-align: right;">${dinhDangTien(booking.total_price)}</td>
        </tr>
      </table>
      
      <p style="color: #64748b; font-size: 13px; line-height: 1.5; text-align: center; margin: 0;">
        Hóa đơn điện tử chi tiết <strong>${invoiceCode}</strong> đã được gửi đính kèm dưới dạng file HTML trong email này.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 25px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
      Cảm ơn quý khách đã tin tưởng và đặt phòng tại <strong>DieuBel</strong>!<br />
      © 2026 StayNest Hotel Group. All rights reserved.
    </div>
  </div>
</body>
</html>`,
    text: `Đặt phòng thành công ${booking.booking_code}. Khách sạn: DieuBel. Tổng tiền ${dinhDangTien(booking.total_price)}.`,
    attachments: [
      {
        filename: `${invoiceCode}.html`,
        path: invoicePath,
      },
    ],
  });
}

async function layDanhSachHoaDon() {
  const [rows] = await ketNoiDb.query(
    `SELECT
       i.id,
       i.invoice_code,
       i.file_path,
       i.total_amount,
       i.created_at,
       b.booking_code,
       b.check_in_date,
       b.check_out_date,
       u.full_name,
       u.email,
       r.hotel_name,
       r.room_name
     FROM invoices i
     JOIN bookings b ON b.id = i.booking_id
     JOIN users u ON u.id = b.user_id
     JOIN rooms r ON r.id = b.room_id
     ORDER BY i.created_at DESC`,
  );

  return rows;
}

async function layHoaDonTheoId(invoiceId) {
  const [rows] = await ketNoiDb.query(
    `SELECT id, invoice_code, file_path
     FROM invoices
     WHERE id = ?
     LIMIT 1`,
    [invoiceId],
  );

  return rows[0] || null;
}

module.exports = {
  taoDatPhong,
  layHoaDonTheoId,
  layDanhSachHoaDon,
};
