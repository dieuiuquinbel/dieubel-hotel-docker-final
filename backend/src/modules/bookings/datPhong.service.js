// Module tao dat phong: giu ton kho, tao booking, hoa don va email xac nhan.
const ketNoiDb = require('../../config/coSoDuLieu');
const { layPhongTheoId } = require('../rooms/phong.service');
const { taoFileHoaDon, dinhDangTien } = require('../invoices/hoaDon.service');
const { guiMail } = require('../notifications/thuDienTu.service');

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

function taoMaDatPhong() {
  return `SN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`;
}

function chuanHoaDichVu(services = []) {
  if (!Array.isArray(services)) return [];

  return services
    .map((service) => ({
      title: String(service.title || service.service_name || '').trim(),
      price: Number(service.price ?? service.priceValue ?? 0),
      quantity: Math.max(Number(service.quantity || 1), 1),
    }))
    .filter((service) => service.title);
}

function dichVuThanhChu(services) {
  if (!services.length) return 'Khong co';

  return services
    .map((service) => `${service.title} x${service.quantity} (${dinhDangTien(service.price * service.quantity)})`)
    .join(', ');
}

async function taoDatPhong({ user, payload }) {
  if (!user?.email_verified) {
    throw taoLoi(403, 'Vui long xac minh email truoc khi dat phong.');
  }

  const room = await layPhongTheoId(payload.roomId);

  if (!room) {
    throw taoLoi(404, 'Khong tim thay phong.');
  }

  const checkIn = payload.checkIn || payload.check_in_date;
  const checkOut = payload.checkOut || payload.check_out_date;
  const guests = Math.max(Number(payload.guests || 1), 1);
  const roomsCount = Math.max(Number(payload.rooms || payload.roomsCount || 1), 1);
  const nights = tinhSoDem(checkIn, checkOut);
  const selectedServices = chuanHoaDichVu(payload.services);
  const servicePrice = selectedServices.reduce((sum, service) => sum + service.price * service.quantity, 0);
  const roomPrice = Number(room.price_per_night || 0) * nights * roomsCount;
  const totalPrice = roomPrice + servicePrice;
  const bookingCode = taoMaDatPhong();
  const servicesText = dichVuThanhChu(selectedServices);

  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();

    const [lockedRooms] = await connection.query(
      `SELECT id, inventory_count
       FROM rooms
       WHERE id = ? AND is_active = TRUE
       FOR UPDATE`,
      [room.id],
    );

    if (!lockedRooms.length) {
      throw taoLoi(404, 'Khong tim thay phong dang hoat dong.');
    }

    const currentInventory = Number(lockedRooms[0].inventory_count || 0);
    if (currentInventory < roomsCount) {
      throw taoLoi(409, `Chi con ${currentInventory} phong trong MySQL, khong du de giu ${roomsCount} phong.`);
    }

    await connection.query(
      'UPDATE rooms SET inventory_count = inventory_count - ? WHERE id = ?',
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
        payload.paymentMethod || 'pay_at_hotel',
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
      payment_method: payload.paymentMethod || 'pay_at_hotel',
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
      emailWarning = 'Da tao don dat phong nhung khong gui duoc email xac nhan.';
      console.warn(`Khong the gui email xac nhan ${booking.booking_code}: ${emailError.message}`);
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

async function guiEmailXacNhanDatPhong({ user, room, booking, servicesText, invoicePath, invoiceCode }) {
  await guiMail({
    to: user.email,
    subject: `Xac nhan dat phong StayNest - ${booking.booking_code}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a">
        <h2>Dat phong thanh cong</h2>
        <p>Ma dat phong: <strong>${booking.booking_code}</strong></p>
        <p>Khach san: <strong>${room.hotel_name}</strong></p>
        <p>Phong: <strong>${room.room_name}</strong></p>
        <p>Loai phong: <strong>${room.room_type}</strong></p>
        <p>Ngay nhan phong: <strong>${booking.check_in_date}</strong></p>
        <p>Ngay tra phong: <strong>${booking.check_out_date}</strong></p>
        <p>So khach: <strong>${booking.guests}</strong> - So phong: <strong>${booking.rooms_count}</strong></p>
        <p>Dich vu da dat: <strong>${servicesText}</strong></p>
        <p>Tong tien: <strong>${dinhDangTien(booking.total_price)}</strong></p>
        <p>Hoa don: <strong>${invoiceCode}</strong></p>
      </div>
    `,
    text: `Dat phong thanh cong ${booking.booking_code}. Tong tien ${dinhDangTien(booking.total_price)}.`,
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
