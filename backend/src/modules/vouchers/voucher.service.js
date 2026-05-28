// Chức năng: Nghiệp vụ danh sách voucher và lưu voucher cho user.
// Module voucher: danh sach ma uu dai, kho voucher cua user va luu voucher.
const ketNoiDb = require('../../config/coSoDuLieu');
const { damBaoCauTrucVanHanh } = require('../system/cauTrucVanHanh.service');

function taoLoi(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function tinhExpiresIn(endAt) {
  if (!endAt) return '';
  const diff = new Date(endAt).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return '0 ngày';
  return `${Math.ceil(diff / (24 * 60 * 60 * 1000))} ngày`;
}

function mapVoucher(row) {
  const isService = row.discount_type === 'service';
  const percentText = `${Math.round(Number(row.discount_value || 0) * 100)}% OFF`;
  const fixedText = `${Math.round(Number(row.discount_value || 0) / 1000)}K OFF`;

  return {
    id: String(row.id),
    voucherId: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    badge: isService ? 'Dịch vụ' : 'Ưu đãi',
    discountType: row.discount_type,
    discountValue: isService ? row.service_benefit : Number(row.discount_value || 0),
    minSpend: Number(row.min_order_amount || 0),
    maxDiscount: row.max_discount_amount == null ? null : Number(row.max_discount_amount),
    serviceBenefit: row.service_benefit,
    expiresIn: tinhExpiresIn(row.end_at),
    imageTone: isService ? 'from-cyan-300 via-blue-500 to-violet-700' : 'from-fuchsia-400 via-pink-500 to-rose-600',
    imageText: isService ? 'FREE' : row.discount_type === 'fixed' ? fixedText : percentText,
    savedAt: row.saved_at || null,
    used: Boolean(row.used_at) || row.user_voucher_status === 'used',
  };
}

async function layDanhSachVoucher(userId = null) {
  await damBaoCauTrucVanHanh();

  const [rows] = await ketNoiDb.query(
    `SELECT v.*, uv.saved_at, uv.used_at, uv.status AS user_voucher_status
     FROM vouchers v
     LEFT JOIN user_vouchers uv ON uv.voucher_id = v.id AND uv.user_id = ?
     WHERE v.is_active = TRUE
       AND (v.end_at IS NULL OR v.end_at > NOW())
     ORDER BY v.created_at DESC`,
    [userId || 0],
  );

  return rows.map(mapVoucher);
}

async function layVoucherCuaNguoiDung(userId) {
  await damBaoCauTrucVanHanh();

  const [rows] = await ketNoiDb.query(
    `SELECT v.*, uv.saved_at, uv.used_at, uv.status AS user_voucher_status
     FROM user_vouchers uv
     JOIN vouchers v ON v.id = uv.voucher_id
     WHERE uv.user_id = ?
     ORDER BY uv.saved_at DESC`,
    [userId],
  );

  return rows.map(mapVoucher);
}

async function luuVoucherChoNguoiDung(userId, code) {
  await damBaoCauTrucVanHanh();

  const [vouchers] = await ketNoiDb.query(
    `SELECT * FROM vouchers
     WHERE code = ? AND is_active = TRUE AND (end_at IS NULL OR end_at > NOW())
     LIMIT 1`,
    [code],
  );

  if (!vouchers.length) throw taoLoi(404, 'Khong tim thay voucher hop le.');

  await ketNoiDb.query(
    `INSERT INTO user_vouchers (user_id, voucher_id, status)
     VALUES (?, ?, 'saved')
     ON DUPLICATE KEY UPDATE status = IF(status = 'expired', 'saved', status)`,
    [userId, vouchers[0].id],
  );

  return layVoucherCuaNguoiDung(userId);
}

module.exports = {
  layDanhSachVoucher,
  layVoucherCuaNguoiDung,
  luuVoucherChoNguoiDung,
};
