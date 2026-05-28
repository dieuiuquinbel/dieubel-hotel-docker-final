// Chức năng: Xử lý xác nhận thanh toán và email thanh toán.
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
  <title>Lịch sử thanh toán - ${thoatHtml(payload.paymentCode)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 40px;
      background-color: #f8fafc;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 35px;
      color: #ffffff;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
    }
    .header-table td {
      border: none;
      padding: 0;
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .logo-sub {
      font-size: 12px;
      color: #a7f3d0;
      margin: 2px 0 0 0;
    }
    .invoice-title {
      text-align: right;
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }
    .invoice-code {
      text-align: right;
      font-size: 13px;
      color: #a7f3d0;
      margin: 5px 0 0 0;
    }
    .content {
      padding: 35px;
    }
    .info-grid {
      width: 100%;
      margin-bottom: 30px;
      border-collapse: collapse;
    }
    .info-grid td {
      width: 50%;
      vertical-align: top;
      padding: 0 15px 0 0;
      border: none;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 1px;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .info-text {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
      margin: 0;
    }
    .info-text strong {
      color: #0f172a;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .details-table th {
      background: #f1f5f9;
      color: #475569;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
    }
    .details-table td {
      padding: 16px;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .details-table tr:last-child td {
      border-bottom: none;
    }
    .total-row {
      background-color: #fafafa;
    }
    .total-label {
      font-weight: 700;
      color: #0f172a;
      text-align: right;
      padding: 16px;
    }
    .total-val {
      font-size: 18px;
      font-weight: 800;
      color: #059669;
      text-align: right;
      padding: 16px;
    }
    .qr-container {
      text-align: center;
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px dashed #cbd5e1;
    }
    .qr-image {
      max-width: 200px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px;
      background: #ffffff;
    }
    .footer {
      padding: 30px;
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <table class="header-table">
        <tr>
          <td>
            <div class="logo">StayNest</div>
            <div class="logo-sub">LỊCH SỬ THANH TOÁN (XÁC NHẬN)</div>
          </td>
          <td>
            <div class="invoice-title">MÃ GIAO DỊCH</div>
            <div class="invoice-code">${thoatHtml(payload.paymentCode)}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Info Grid -->
      <table class="info-grid">
        <tr>
          <td>
            <div class="section-title">Khách hàng</div>
            <p class="info-text">
              <strong>${thoatHtml(user.full_name || booking.guestName)}</strong><br />
              Email: ${thoatHtml(user.email || booking.guestEmail)}<br />
              Phương thức: <strong>${nhanPhuongThucThanhToan(payload.paymentMethod)}</strong>
            </p>
          </td>
          <td>
            <div class="section-title">Thông tin phòng</div>
            <p class="info-text">
              Khách sạn: <strong>DieuBel</strong><br />
              Phòng: <strong>${thoatHtml(booking.room_name)}</strong><br />
              Nhận phòng: <strong>${thoatHtml(booking.checkIn)}</strong><br />
              Trả phòng: <strong>${thoatHtml(booking.checkOut)}</strong>
            </p>
          </td>
        </tr>
      </table>

      <!-- Details Table -->
      <table class="details-table">
        <thead>
          <tr>
            <th>Chi tiết thanh toán</th>
            <th style="text-align: right; width: 150px;">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Mã đặt phòng: ${thoatHtml(booking.id)}</strong><br />
              <span style="font-size: 12px; color: #64748b;">Địa chỉ: ${thoatHtml(booking.address)}</span>
            </td>
            <td style="text-align: right; font-weight: 600;">${dinhDangTien(payload.amount)}</td>
          </tr>
          <tr>
            <td>
              <strong>Dịch vụ đi kèm</strong><br />
              <span style="font-size: 12px; color: #64748b;">${chuDichVu(booking.services)}</span>
            </td>
            <td style="text-align: right; font-weight: 600;">Đã bao gồm</td>
          </tr>
          <!-- Total Row -->
          <tr class="total-row">
            <td class="total-label">Tổng cộng đã thanh toán</td>
            <td class="total-val">${dinhDangTien(payload.amount)}</td>
          </tr>
        </tbody>
      </table>

      <!-- QR Code Section -->
      ${payload.checkInQrToken ? `
      <div class="qr-container">
        <div class="section-title" style="margin-bottom: 12px;">Mã QR Nhận Phòng</div>
        <p style="font-size: 13px; color: #64748b; margin: 0 0 15px 0;">Vui lòng xuất trình mã QR này cho nhân viên lễ tân khi đến nhận phòng.</p>
        ${payload.paymentQrUrl ? `<img class="qr-image" src="${thoatHtml(payload.paymentQrUrl)}" alt="Check-in QR" />` : ''}
        <p style="font-size: 14px; font-weight: 700; color: #059669; margin: 10px 0 0 0;">Token: ${thoatHtml(payload.checkInQrToken)}</p>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      Cảm ơn quý khách đã tin tưởng và lựa chọn đặt phòng tại <strong>DieuBel</strong>!<br />
      Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: <strong>0345583772</strong> hoặc email: support@staynest.com
    </div>
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
    subject: `Xác nhận thanh toán DieuBel - ${payload.paymentCode}`,
    html: `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Xác nhận thanh toán DieuBel - ${payload.paymentCode}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; color: #ffffff; text-align: center;">
      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">StayNest</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #a7f3d0;">Thanh toán thành công!</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 35px;">
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 15px 0; text-align: center;">Giao Dịch Đã Ghi Nhận</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        Chào bạn, giao dịch thanh toán cho đơn đặt phòng của bạn đã được hệ thống ghi nhận thành công. Chi tiết giao dịch thanh toán:
      </p>
      
      <!-- Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Mã thanh toán</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">${payload.paymentCode}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Khách sạn</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">DieuBel</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Tên phòng</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${booking.room_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Ngày nhận phòng</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${booking.checkIn}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Ngày trả phòng</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${booking.checkOut}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Dịch vụ đã đặt</td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${chuDichVu(booking.services)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Mã QR nhận phòng</td>
          <td style="padding: 12px 0; font-size: 14px; color: #059669; font-weight: 700; text-align: right;">${payload.checkInQrToken || 'Chưa phát hành'}</td>
        </tr>
        <tr>
          <td style="padding: 16px 0 0 0; font-size: 16px; color: #0f172a; font-weight: 700;">Số tiền đã thanh toán</td>
          <td style="padding: 16px 0 0 0; font-size: 20px; color: #059669; font-weight: 800; text-align: right;">${dinhDangTien(payload.amount)}</td>
        </tr>
      </table>
      
      <p style="color: #64748b; font-size: 13px; line-height: 1.5; text-align: center; margin: 0;">
        ⚠️ Khi đến nhận phòng, quý khách vui lòng xuất trình mã QR nhận phòng (được gửi đính kèm file HTML trong email này) cho nhân viên lễ tân để làm thủ tục nhanh chóng.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 25px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
      Cảm ơn quý khách đã tin tưởng và đặt phòng tại <strong>DieuBel</strong>!<br />
      Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: <strong>0345583772</strong> hoặc email: support@staynest.com<br />
      © 2026 StayNest Hotel Group. All rights reserved.
    </div>
  </div>
</body>
</html>`,
    text: `Thanh toán thành công ${payload.paymentCode}. Khách sạn: DieuBel. Mã QR nhận phòng: ${payload.checkInQrToken || ''}. Tổng tiền: ${dinhDangTien(payload.amount)}.`,
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
