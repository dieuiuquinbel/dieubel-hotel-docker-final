// Module hoa don: tao file HTML hoa don va dinh dang tien cho noi dung xuat file.
const fs = require('fs/promises');
const path = require('path');

const THU_MUC_HOA_DON = path.resolve(process.env.INVOICE_DIR || path.join(__dirname, '../../storage/invoices'));

function dinhDangTien(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} VND`;
}

function thoatHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function taoHtmlHoaDon({ invoiceCode, booking, room, user, servicesText }) {
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>${thoatHtml(invoiceCode)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 40px; }
      h1 { margin: 0 0 8px; color: #1d4ed8; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      td, th { border: 1px solid #dbe4ef; padding: 12px; text-align: left; }
      th { background: #eff6ff; }
      .total { font-size: 20px; font-weight: 800; color: #1d4ed8; }
    </style>
  </head>
  <body>
    <h1>Hoa don StayNest</h1>
    <p>Ma hoa don: <strong>${thoatHtml(invoiceCode)}</strong></p>
    <p>Ma dat phong: <strong>${thoatHtml(booking.booking_code)}</strong></p>
    <table>
      <tr><th>Khach hang</th><td>${thoatHtml(user.full_name)} (${thoatHtml(user.email)})</td></tr>
      <tr><th>Khach san</th><td>${thoatHtml(room.hotel_name)}</td></tr>
      <tr><th>Phong</th><td>${thoatHtml(room.room_name)}</td></tr>
      <tr><th>Loai phong</th><td>${thoatHtml(room.room_type)}</td></tr>
      <tr><th>Ngay nhan phong</th><td>${thoatHtml(booking.check_in_date)}</td></tr>
      <tr><th>Ngay tra phong</th><td>${thoatHtml(booking.check_out_date)}</td></tr>
      <tr><th>So khach / so phong</th><td>${thoatHtml(booking.guests)} khach / ${thoatHtml(booking.rooms_count)} phong</td></tr>
      <tr><th>Dich vu da chon</th><td>${thoatHtml(servicesText || 'Khong co')}</td></tr>
      <tr><th>Tong tien</th><td class="total">${dinhDangTien(booking.total_price)}</td></tr>
    </table>
  </body>
</html>`;
}

async function taoFileHoaDon({ booking, room, user, servicesText }) {
  await fs.mkdir(THU_MUC_HOA_DON, { recursive: true });

  const invoiceCode = `INV-${booking.id}-${Date.now()}`;
  const filePath = path.join(THU_MUC_HOA_DON, `${invoiceCode}.html`);
  const html = taoHtmlHoaDon({ invoiceCode, booking, room, user, servicesText });

  await fs.writeFile(filePath, html, 'utf8');

  return {
    invoiceCode,
    filePath,
  };
}

module.exports = {
  taoFileHoaDon,
  dinhDangTien,
};
