import {
  KIEU_DAT_PHONG,
  NHAN_KIEU_DAT_PHONG,
  NHAN_TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_THANH_TOAN,
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
} from '../../utils/lichSuDatPhong';
import { dinhDangNgay, dinhDangNgayGio } from '../../utils/dinhDang';

export const MAU_TRANG_THAI = {
  [TRANG_THAI_DAT_PHONG.HOLDING]: 'bg-amber-50 text-amber-700',
  [TRANG_THAI_DAT_PHONG.CONFIRMED]: 'bg-emerald-50 text-emerald-700',
  [TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED]: 'bg-rose-50 text-rose-700',
  [TRANG_THAI_DAT_PHONG.CHECKED_IN]: 'bg-sky-50 text-sky-700',
  [TRANG_THAI_DAT_PHONG.CHECKED_OUT]: 'bg-slate-100 text-slate-700',
  [TRANG_THAI_DAT_PHONG.CANCELLED]: 'bg-rose-50 text-rose-700',
  [TRANG_THAI_DAT_PHONG.EXPIRED]: 'bg-slate-100 text-slate-700',
  [TRANG_THAI_DAT_PHONG.NO_SHOW]: 'bg-rose-50 text-rose-700',
};

export const MAU_THANH_TOAN = {
  [TRANG_THAI_THANH_TOAN.UNPAID]: 'bg-rose-50 text-rose-700',
  [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID]: 'bg-amber-50 text-amber-700',
  [TRANG_THAI_THANH_TOAN.PAID]: 'bg-emerald-50 text-emerald-700',
  [TRANG_THAI_THANH_TOAN.PAY_AT_COUNTER]: 'bg-sky-50 text-sky-700',
  [TRANG_THAI_THANH_TOAN.REFUNDED]: 'bg-slate-100 text-slate-700',
};

export { dinhDangNgayGio };

export function lopHuyHieu(map, value) {
  return map[value] || 'bg-slate-100 text-slate-700';
}

export function thoiGianDatPhong(booking) {
  if (booking.bookingType === KIEU_DAT_PHONG.DAY_USE) {
    return `${dinhDangNgay(booking.checkIn) || 'Chưa chọn'} · ${booking.timeSlot?.label || 'Trong ngày'} · ${booking.timeSlot?.time || ''}`;
  }

  return `${dinhDangNgay(booking.checkIn) || 'Chưa chọn'} - ${dinhDangNgay(booking.checkOut) || 'Chưa chọn'}`;
}

export function nhanKieuDat(booking) {
  return NHAN_KIEU_DAT_PHONG[booking.bookingType] || 'Qua đêm';
}

export function nhanTrangThaiDatPhong(booking) {
  return NHAN_TRANG_THAI_DAT_PHONG[booking.bookingStatus] || booking.bookingStatus;
}

export function nhanTrangThaiThanhToan(booking) {
  return NHAN_TRANG_THAI_THANH_TOAN[booking.paymentStatus] || booking.paymentStatus;
}

export function HuyHieu({ children, tone }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>{children}</span>;
}
