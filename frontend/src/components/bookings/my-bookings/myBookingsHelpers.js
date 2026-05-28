// Chức năng: Hàm lọc đơn và xử lý voucher cho trang đặt chỗ của tôi.
import {
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
  tinhGiamGiaVoucher,
} from '../../../utils/lichSuDatPhong';
import { kiemTraDieuKienVoucher } from '../../../utils/diemThuong';

export const TAB_DAT_PHONG = [
  { key: 'all', label: 'Tất cả' },
  { key: TRANG_THAI_THANH_TOAN.UNPAID, label: 'Chờ thanh toán' },
  { key: TRANG_THAI_THANH_TOAN.DEPOSIT_PAID, label: 'Đã cọc' },
  { key: TRANG_THAI_THANH_TOAN.PAID, label: 'Đã thanh toán' },
  { key: TRANG_THAI_DAT_PHONG.CHECKED_IN, label: 'Đang lưu trú' },
];

export function chuanHoaMaVoucher(value = '') {
  return String(value).trim().toUpperCase();
}

export function gopVoucherKhongTrung(...groups) {
  const merged = new Map();

  groups.flat().forEach((voucher) => {
    const code = chuanHoaMaVoucher(voucher?.code);
    if (!code || merged.has(code)) return;
    merged.set(code, {
      ...voucher,
      code,
    });
  });

  return Array.from(merged.values());
}

export function locDatPhong(booking, activeTab) {
  if ([TRANG_THAI_DAT_PHONG.CANCELLED, TRANG_THAI_DAT_PHONG.CHECKED_OUT, TRANG_THAI_DAT_PHONG.NO_SHOW].includes(booking.bookingStatus)) {
    return false;
  }

  if (activeTab === 'all') return true;
  if (activeTab === TRANG_THAI_DAT_PHONG.CHECKED_IN) return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
  return booking.paymentStatus === activeTab;
}

function tinhGiaTriToiUuVoucher(totalPrice, voucher) {
  if (!voucher) return 0;
  if (!kiemTraDieuKienVoucher(voucher, totalPrice).hopLe) return 0;
  if (voucher.discountType === 'service') return 0;
  return tinhGiamGiaVoucher(totalPrice, voucher);
}

export function timVoucherTotNhat(totalPrice, vouchers) {
  return vouchers.reduce((best, voucher) => {
    const discount = tinhGiaTriToiUuVoucher(totalPrice, voucher);
    const bestDiscount = tinhGiaTriToiUuVoucher(totalPrice, best);

    if (discount > bestDiscount) return voucher;
    return best;
  }, null);
}

