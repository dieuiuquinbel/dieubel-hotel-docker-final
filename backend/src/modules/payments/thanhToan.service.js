// Module thanh toan demo: ghi nhan giao dich va gui thong bao thanh toan.
const fs = require('fs/promises');
const path = require('path');
const { guiMail } = require('../notifications/thuDienTu.service');

const THU_MUC_LICH_SU_THANH_TOAN = path.resolve(process.env.PAYMENT_HISTORY_DIR || path.join(__dirname, '../../storage/lich-su-ck'));

function thoatHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function dinhDangTien(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} VND`;
}

function nhanPhuongThucThanhToan(method) {
  return method === 'counter_deposit' ? 'Coc giu phong 10%' : 'Thanh toan toan bo';
}

function chuDichVu(services = []) {
  if (!Array.isArray(services) || !services.length) return 'Khong co dich vu them';

  return services
    .map((service) => `${service.title || service.id || 'Dich vu'} - ${dinhDangTien(service.priceValue || service.price || 0)}`)
    .join('<br/>');
}

function taoHtmlLichSuThanhToan({ user, payload }) {
  const booking = payload.booking || {};

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${thoatHtml(payload.paymentCode)}</title>
  <style>
    body{font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;padding:28px}
    .box{border:1px solid #dbeafe;border-radius:16px;padding:20px;max-width:860px}
    .muted{color:#64748b}
    .total{font-size:24px;font-weight:800;color:#1d4ed8}
    img{max-width:260px;border:1px solid #e2e8f0;border-radius:16px;padding:10px}
  </style>
</head>
<body>
  <div class="box">
    <h1>Lich su chuyen khoan demo</h1>
    <p>Ma hoa don/chuyen khoan: <strong>${thoatHtml(payload.paymentCode)}</strong></p>
    <p>Phuong thuc: <strong>${nhanPhuongThucThanhToan(payload.paymentMethod)}</strong></p>
    <p>So tien: <span class="total">${dinhDangTien(payload.amount)}</span></p>
    <p>Khach hang: <strong>${thoatHtml(user.full_name || booking.guestName)}</strong> - ${thoatHtml(user.email || booking.guestEmail)}</p>
    <hr/>
    <h2>Thong tin phong</h2>
    <p>Ma dat cho: <strong>${thoatHtml(booking.id)}</strong></p>
    <p>Khach san: <strong>${thoatHtml(booking.hotel_name)}</strong></p>
    <p>Phong: <strong>${thoatHtml(booking.room_name)}</strong></p>
    <p>Dia chi: ${thoatHtml(booking.address)}</p>
    <p>Ngay nhan: <strong>${thoatHtml(booking.checkIn)}</strong></p>
    <p>Ngay tra: <strong>${thoatHtml(booking.checkOut)}</strong></p>
    <p>Dich vu: <br/>${chuDichVu(booking.services)}</p>
    <p class="muted">QR nhan phong: ${thoatHtml(payload.checkInQrToken || '')}</p>
    ${payload.paymentQrUrl ? `<img src="${thoatHtml(payload.paymentQrUrl)}" alt="VietQR" />` : ''}
  </div>
</body>
</html>`;
}

async function ghiLichSuThanhToan({ user, payload }) {
  await fs.mkdir(THU_MUC_LICH_SU_THANH_TOAN, { recursive: true });
  const safeCode = String(payload.paymentCode || `HD-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(THU_MUC_LICH_SU_THANH_TOAN, `${safeCode}.html`);
  const html = taoHtmlLichSuThanhToan({ user, payload });

  await fs.writeFile(filePath, html, 'utf8');

  return {
    filePath,
    historyDir: THU_MUC_LICH_SU_THANH_TOAN,
  };
}

async function guiEmailXacNhanThanhToan({ user, payload, filePath }) {
  const booking = payload.booking || {};

  return guiMail({
    to: user.email || booking.guestEmail,
    subject: `Xac nhan thanh toan DieuBel - ${payload.paymentCode}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a">
        <h2>Thanh toan da duoc ghi nhan</h2>
        <p>Ma hoa don/chuyen khoan: <strong>${thoatHtml(payload.paymentCode)}</strong></p>
        <p>So tien: <strong>${dinhDangTien(payload.amount)}</strong></p>
        <p>Khach san: <strong>${thoatHtml(booking.hotel_name)}</strong></p>
        <p>Phong: <strong>${thoatHtml(booking.room_name)}</strong></p>
        <p>Ngay nhan phong: <strong>${thoatHtml(booking.checkIn)}</strong></p>
        <p>Ngay tra phong: <strong>${thoatHtml(booking.checkOut)}</strong></p>
        <p>Dich vu da dat:<br/>${chuDichVu(booking.services)}</p>
        <p>Ma QR nhan phong: <strong>${thoatHtml(payload.checkInQrToken || '')}</strong></p>
        <p>Khi den khach san, vui long xuat trinh ma QR nhan phong de nhan vien kiem tra.</p>
      </div>
    `,
    text: `Thanh toan da ghi nhan ${payload.paymentCode}. Ma QR nhan phong: ${payload.checkInQrToken || ''}.`,
    attachments: filePath
      ? [
          {
            filename: `${payload.paymentCode}.html`,
            path: filePath,
          },
        ]
      : [],
  });
}

async function xacNhanThanhToanDemo({ user, payload }) {
  if (!payload?.paymentCode || !payload?.booking?.id) {
    const error = new Error('Thieu thong tin thanh toan demo.');
    error.status = 400;
    throw error;
  }

  const history = await ghiLichSuThanhToan({ user, payload });
  const mailResult = await guiEmailXacNhanThanhToan({
    user,
    payload,
    filePath: history.filePath,
  });

  return {
    ...history,
    mail: mailResult,
  };
}

module.exports = {
  xacNhanThanhToanDemo,
};
