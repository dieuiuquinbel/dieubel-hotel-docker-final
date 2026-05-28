// Chức năng: Tạo, lưu và đồng bộ file hóa đơn HTML.
//Xử lý tạo và xuất file hóa đơn dạng HTML
const fs = require("fs/promises");
const path = require("path");
const ketNoiDb = require("../../config/coSoDuLieu");

function giaiThuMucHoaDon() {
  const configuredDir = String(process.env.INVOICE_DIR || "").trim();

  if (!configuredDir) {
    return path.resolve(__dirname, "../../storage/invoices");
  }

  if (path.isAbsolute(configuredDir)) {
    return configuredDir;
  }

  return path.resolve(process.cwd(), configuredDir);
}

const THU_MUC_HOA_DON = giaiThuMucHoaDon();

function dinhDangTien(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function thoatHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function taoHtmlHoaDon({ invoiceCode, booking, room, user, servicesText }) {
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>${thoatHtml(invoiceCode)}</title>
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
        background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
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
        color: #93c5fd;
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
        color: #93c5fd;
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
        color: #1e40af;
        text-align: right;
        padding: 16px;
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
              <div class="logo-sub">HÓA ĐƠN THANH TOÁN</div>
            </td>
            <td>
              <div class="invoice-title">MÃ ĐƠN HÀNG</div>
              <div class="invoice-code">${thoatHtml(booking.booking_code)}</div>
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
                <strong>${thoatHtml(user.full_name)}</strong><br />
                Email: ${thoatHtml(user.email)}<br />
                SĐT: ${thoatHtml(booking.phone || user.phone || 'Chưa cung cấp')}
              </p>
            </td>
            <td>
              <div class="section-title">Thông tin kỳ nghỉ</div>
              <p class="info-text">
                Khách sạn: <strong>DieuBel</strong><br />
                Nhận phòng: <strong>${thoatHtml(booking.check_in_date)}</strong><br />
                Trả phòng: <strong>${thoatHtml(booking.check_out_date)}</strong><br />
                Thời gian: ${thoatHtml(booking.nights)} đêm / ${thoatHtml(booking.rooms_count)} phòng
              </p>
            </td>
          </tr>
        </table>

        <!-- Details Table -->
        <table class="details-table">
          <thead>
            <tr>
              <th>Khoản mục chi tiết</th>
              <th style="text-align: right; width: 150px;">Số tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Phòng: ${thoatHtml(room.room_name)}</strong><br />
                <span style="font-size: 12px; color: #64748b;">Loại phòng: ${thoatHtml(room.room_type)}</span>
              </td>
              <td style="text-align: right; font-weight: 600;">${dinhDangTien(booking.room_price || 0)}</td>
            </tr>
            <tr>
              <td>
                <strong>Dịch vụ kèm theo</strong><br />
                <span style="font-size: 12px; color: #64748b;">${thoatHtml(servicesText || "Không sử dụng dịch vụ")}</span>
              </td>
              <td style="text-align: right; font-weight: 600;">${dinhDangTien(booking.service_price || 0)}</td>
            </tr>
            <!-- Total Row -->
            <tr class="total-row">
              <td class="total-label">Tổng cộng tiền thanh toán</td>
              <td class="total-val">${dinhDangTien(booking.total_price)}</td>
            </tr>
          </tbody>
        </table>
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

async function taoFileHoaDon({ booking, room, user, servicesText }) {
  await fs.mkdir(THU_MUC_HOA_DON, { recursive: true });

  const randomPart = String(booking.booking_code || "").split("-")[1] || String(booking.id || Date.now());
  const invoiceCode = `INV-${randomPart}`;
  const filePath = path.join(THU_MUC_HOA_DON, `${invoiceCode}.html`);
  const html = taoHtmlHoaDon({
    invoiceCode,
    booking,
    room,
    user,
    servicesText,
  });

  await fs.writeFile(filePath, html, "utf8");

  return {
    invoiceCode,
    filePath,
  };
}

async function tonTaiFile(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function capNhatDuongDanHoaDon(invoiceId, filePath) {
  await ketNoiDb.query(
    `UPDATE invoices
     SET file_path = ?
     WHERE id = ?`,
    [filePath, invoiceId],
  );
}

async function damBaoHoaDonTrongThuMucAdmin(invoice) {
  await fs.mkdir(THU_MUC_HOA_DON, { recursive: true });

  const targetPath = path.join(THU_MUC_HOA_DON, `${invoice.invoice_code}.html`);
  const currentPath = invoice.file_path;

  if (currentPath === targetPath && (await tonTaiFile(targetPath))) {
    return targetPath;
  }

  if (currentPath && (await tonTaiFile(currentPath))) {
    await fs.copyFile(currentPath, targetPath);
    await capNhatDuongDanHoaDon(invoice.id, targetPath);
    return targetPath;
  }

  throw new Error(
    "Khong tim thay file hoa don goc de dong bo vao thu muc admin",
  );
}

module.exports = {
  THU_MUC_HOA_DON,
  damBaoHoaDonTrongThuMucAdmin,
  taoFileHoaDon,
  dinhDangTien,
};
