// Chức năng: Tiện ích và hằng số xử lý lịch sử đặt phòng local.
import { KHOA_LUU_TRU } from './khoaLuuTru';

import { dinhDangNgay } from './dinhDang';

const KHOA_DAT_PHONG = KHOA_LUU_TRU.bookings;
const KHOA_DANH_GIA = KHOA_LUU_TRU.reviews;

export const TRANG_THAI_DAT_PHONG = {
  HOLDING: 'holding',
  CONFIRMED: 'confirmed',
  CANCEL_REQUESTED: 'cancel_requested',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  NO_SHOW: 'no_show',
};

export const TRANG_THAI_THANH_TOAN = {
  UNPAID: 'unpaid',
  DEPOSIT_PAID: 'deposit_paid',
  PAID: 'paid',
  PAY_AT_COUNTER: 'pay_at_counter',
  REFUNDED: 'refunded',
};

export const PHUONG_THUC_THANH_TOAN = {
  ONLINE_FULL: 'online_full',
  COUNTER_DEPOSIT: 'counter_deposit',
};

export const TY_LE_PHI_HUY_HOAN_TIEN = 0.2;

export function tinhChinhSachHoanTien(paidAmount) {
  const safePaidAmount = Math.max(0, Number(paidAmount || 0));
  const cancelFeeAmount = Math.round(safePaidAmount * TY_LE_PHI_HUY_HOAN_TIEN);

  return {
    paidAmount: safePaidAmount,
    cancelFeeAmount,
    refundAmount: Math.max(0, safePaidAmount - cancelFeeAmount),
  };
}

export const KIEU_DAT_PHONG = {
  OVERNIGHT: 'overnight',
  DAY_USE: 'day_use',
};

export const NHAN_KIEU_DAT_PHONG = {
  [KIEU_DAT_PHONG.OVERNIGHT]: 'Qua đêm',
  [KIEU_DAT_PHONG.DAY_USE]: 'Trong ngày',
};

export const KHUNG_GIO_THUE_NGAY = [
  { id: 'morning', label: 'Sáng', time: '08:00 - 12:00', priceRate: 0.45 },
  { id: 'noon', label: 'Trưa', time: '11:00 - 14:00', priceRate: 0.35 },
  { id: 'afternoon', label: 'Chiều', time: '13:00 - 18:00', priceRate: 0.5 },
  { id: 'evening', label: 'Tối', time: '18:00 - 22:00', priceRate: 0.6 },
  { id: 'full-day', label: 'Cả ngày', time: '08:00 - 18:00', priceRate: 0.8 },
];

export const NHAN_TRANG_THAI_DAT_PHONG = {
  [TRANG_THAI_DAT_PHONG.HOLDING]: 'Đang giữ chỗ',
  [TRANG_THAI_DAT_PHONG.CONFIRMED]: 'Đã xác nhận',
  [TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED]: 'Chờ duyệt hủy/hoàn tiền',
  [TRANG_THAI_DAT_PHONG.CHECKED_IN]: 'Đã nhận phòng',
  [TRANG_THAI_DAT_PHONG.CHECKED_OUT]: 'Đã trả phòng',
  [TRANG_THAI_DAT_PHONG.CANCELLED]: 'Đã hủy',
  [TRANG_THAI_DAT_PHONG.EXPIRED]: 'Quá hạn thanh toán',
  [TRANG_THAI_DAT_PHONG.NO_SHOW]: 'Không đến nhận phòng',
};

export const NHAN_TRANG_THAI_THANH_TOAN = {
  [TRANG_THAI_THANH_TOAN.UNPAID]: 'Chờ thanh toán',
  [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID]: 'Đã cọc 10%',
  [TRANG_THAI_THANH_TOAN.PAID]: 'Đã thanh toán',
  [TRANG_THAI_THANH_TOAN.PAY_AT_COUNTER]: 'Thanh toán tại quầy',
  [TRANG_THAI_THANH_TOAN.REFUNDED]: 'Đã hoàn tiền',
};

const BAN_DO_TRANG_THAI_CU = {
  'Đang giữ chỗ': TRANG_THAI_DAT_PHONG.HOLDING,
  'Đã hoàn tất': TRANG_THAI_DAT_PHONG.CHECKED_OUT,
  'Đã hủy': TRANG_THAI_DAT_PHONG.CANCELLED,
};

function docMang() {
  try {
    const value = window.localStorage.getItem(KHOA_DAT_PHONG);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ghiMang(bookings) {
  window.localStorage.setItem(KHOA_DAT_PHONG, JSON.stringify(bookings));
}

function chuanHoaDatPhong(booking) {
  const bookingStatus = booking.bookingStatus || BAN_DO_TRANG_THAI_CU[booking.status] || booking.status || TRANG_THAI_DAT_PHONG.HOLDING;
  const paymentStatus = booking.paymentStatus || (bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT ? TRANG_THAI_THANH_TOAN.PAID : TRANG_THAI_THANH_TOAN.UNPAID);
  const bookingType = booking.bookingType || KIEU_DAT_PHONG.OVERNIGHT;
  const totalPrice = Number(booking.totalPrice || booking.price_per_night || 0);
  const paidAmount = Number(booking.paidAmount || 0);

  return {
    ...booking,
    bookingStatus,
    paymentStatus,
    bookingType,
    timeSlot: booking.timeSlot || null,
    paymentMethod: booking.paymentMethod || null,
    depositAmount: Number(booking.depositAmount || Math.ceil(totalPrice * 0.1)),
    paidAmount,
    remainingAmount: Number.isFinite(Number(booking.remainingAmount)) ? Number(booking.remainingAmount) : Math.max(0, totalPrice - paidAmount),
    qrToken: booking.qrToken || null,
    paymentDeadline: booking.paymentDeadline || null,
  };
}

function docMangDaChuanHoa() {
  return docMang().map(chuanHoaDatPhong);
}

function taoMaDatPhong(date) {
  return `DB-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(
    date.getTime(),
  ).slice(-5)}`;
}

function taoMaQr(bookingId) {
  return `CHECKIN-${bookingId}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function tinhSoDem(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function tinhTienPhong({ bookingType, checkIn, checkOut, rooms = 1, pricePerNight = 0, timeSlotId }) {
  const roomCount = Math.max(Number(rooms || 1), 1);
  const nightlyPrice = Number(pricePerNight || 0);

  if (bookingType === KIEU_DAT_PHONG.DAY_USE) {
    const slot = KHUNG_GIO_THUE_NGAY.find((item) => item.id === timeSlotId) || KHUNG_GIO_THUE_NGAY[0];
    return {
      units: 1,
      unitLabel: slot.label,
      roomPrice: Math.ceil(nightlyPrice * slot.priceRate * roomCount),
      timeSlot: slot,
    };
  }

  const nights = tinhSoDem(checkIn, checkOut);
  return {
    units: nights,
    unitLabel: `${nights} đêm`,
    roomPrice: nightlyPrice * nights * roomCount,
    timeSlot: null,
  };
}

export function docDatPhongCuaToi(userId) {
  const bookings = docMangDaChuanHoa();
  if (!userId) return bookings;
  return bookings.filter((booking) => String(booking.userId) === String(userId));
}

export function docTatCaDatPhong() {
  return docMangDaChuanHoa();
}

export function hetHanDatPhongQuaHan(userId) {
  const now = Date.now();
  let changed = false;
  const next = docMangDaChuanHoa().map((booking) => {
    const belongsToUser = !userId || String(booking.userId) === String(userId);
    const deadline = booking.paymentDeadline ? new Date(booking.paymentDeadline).getTime() : Number.NaN;

    if (
      belongsToUser &&
      booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING &&
      booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID &&
      Number.isFinite(deadline) &&
      deadline <= now
    ) {
      changed = true;
      return {
        ...booking,
        bookingStatus: TRANG_THAI_DAT_PHONG.CANCELLED,
        cancelledAt: new Date().toISOString(),
        cancelReason: 'Quá hạn thanh toán',
      };
    }

    return booking;
  });

  if (changed) ghiMang(next);
  return next;
}

export function capNhatTrangThaiDatPhong(bookingId, bookingStatus) {
  const next = docMangDaChuanHoa().map((booking) => {
    if (booking.id !== bookingId) return booking;

    const isCheckedOut = bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT;
    const isCheckedIn = bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
    const isCancelled = bookingStatus === TRANG_THAI_DAT_PHONG.CANCELLED;
    const isNoShow = bookingStatus === TRANG_THAI_DAT_PHONG.NO_SHOW;

    return {
      ...booking,
      bookingStatus,
      checkedInAt: isCheckedIn ? new Date().toISOString() : booking.checkedInAt,
      completedAt: isCheckedOut ? new Date().toISOString() : booking.completedAt,
      cancelledAt: isCancelled || isNoShow ? new Date().toISOString() : booking.cancelledAt,
      cancelReason: isNoShow ? 'Khách không đến nhận phòng' : isCancelled ? booking.cancelReason || 'Admin hủy đơn' : booking.cancelReason,
      paymentStatus: isCheckedOut ? TRANG_THAI_THANH_TOAN.PAID : booking.paymentStatus,
      paidAmount: isCheckedOut ? Number(booking.totalPrice || 0) : booking.paidAmount,
      remainingAmount: isCheckedOut ? 0 : booking.remainingAmount,
    };
  });

  ghiMang(next);
  return next;
}

export function xacNhanThanhToanAdmin(bookingId, loaiThanhToan) {
  const next = docMangDaChuanHoa().map((booking) => {
    if (booking.id !== bookingId) return booking;

    const totalPrice = Number(booking.totalPrice || 0);
    const depositAmount = Number(booking.depositAmount || Math.ceil(totalPrice * 0.1));
    const isDeposit = loaiThanhToan === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT;
    const paidAmount = isDeposit ? depositAmount : totalPrice;
    const paymentCode = booking.paymentCode || `ADMIN-${String(Date.now()).slice(-6)}`;

    return {
      ...booking,
      bookingStatus: TRANG_THAI_DAT_PHONG.CONFIRMED,
      paymentStatus: isDeposit ? TRANG_THAI_THANH_TOAN.DEPOSIT_PAID : TRANG_THAI_THANH_TOAN.PAID,
      paymentMethod: loaiThanhToan,
      paymentCode,
      transferContent: booking.transferContent || paymentCode,
      paidAmount,
      remainingAmount: Math.max(0, totalPrice - paidAmount),
      qrToken: booking.qrToken || taoMaQr(booking.id),
      paidAt: new Date().toISOString(),
      adminConfirmedAt: new Date().toISOString(),
    };
  });

  ghiMang(next);
  return next;
}

export function luuGhiChuAdmin(bookingId, note) {
  const next = docMangDaChuanHoa().map((booking) =>
    booking.id === bookingId
      ? {
          ...booking,
          adminNote: String(note || '').trim(),
          adminNoteUpdatedAt: new Date().toISOString(),
        }
      : booking,
  );

  ghiMang(next);
  return next;
}

export function luuPhanHoiKhachHang(bookingId, feedback) {
  const cleanContent = String(feedback?.content || '').trim();
  if (!cleanContent) return docMangDaChuanHoa();

  const createdAt = new Date().toISOString();
  const next = docMangDaChuanHoa().map((booking) => {
    if (booking.id !== bookingId) return booking;

    const nextFeedback = {
      id: `FB-${createdAt.replace(/\D/g, '').slice(0, 14)}`,
      type: feedback?.type || 'feedback',
      content: cleanContent,
      createdAt,
      status: 'new',
    };

    return {
      ...booking,
      customerFeedbacks: [nextFeedback, ...(booking.customerFeedbacks || [])].slice(0, 10),
      latestCustomerFeedback: nextFeedback,
    };
  });

  ghiMang(next);
  return next;
}

export function tinhGiamGiaVoucher(totalPrice, voucher) {
  if (!voucher) return 0;

  const safeTotal = Math.max(0, Number(totalPrice || 0));
  let discountAmount = 0;

  if (voucher.discountType === 'percent') {
    discountAmount = Math.round(safeTotal * Number(voucher.discountValue || 0));
  } else if (voucher.discountType === 'fixed') {
    discountAmount = Number(voucher.discountValue || 0);
  }

  if (!Number.isFinite(discountAmount)) return 0;
  return Math.min(safeTotal, Math.max(0, discountAmount));
}

export function apDungVoucherVaoDatPhong(bookingId, voucher) {
  if (!voucher) return docMangDaChuanHoa();

  const next = docMangDaChuanHoa().map((booking) => {
    if (booking.id !== bookingId || booking.voucherCode) return booking;

    const totalPrice = Number(booking.totalPrice || 0);
    const discountAmount = tinhGiamGiaVoucher(totalPrice, voucher);
    const nextTotal = Math.max(0, totalPrice - discountAmount);
    const nextPaid = Math.min(Number(booking.paidAmount || 0), nextTotal);

    return {
      ...booking,
      originalTotalPrice: totalPrice,
      totalPrice: nextTotal,
      discountAmount,
      voucherCode: voucher.code,
      voucherTitle: voucher.title,
      voucherDiscountType: voucher.discountType,
      depositAmount: Math.ceil(nextTotal * 0.1),
      paidAmount: nextPaid,
      remainingAmount: Math.max(0, nextTotal - nextPaid),
    };
  });

  ghiMang(next);
  return next;
}

export function taoHtmlHoaDon(booking) {
  const originalTotalPrice = Number(booking.originalTotalPrice || Number(booking.totalPrice || 0) + Number(booking.discountAmount || 0));
  const discountAmount = Number(booking.discountAmount || 0);
  const rows = [
    ['Mã đơn', booking.id],
    ['Khách hàng', booking.guestName],
    ['Email', booking.guestEmail],
    ['Khách sạn', booking.hotel_name],
    ['Phòng', booking.room_name],
    ['Ngày nhận', dinhDangNgay(booking.checkIn)],
    ['Ngày trả', dinhDangNgay(booking.checkOut)],
    ['Tổng tiền', Number(booking.totalPrice || 0).toLocaleString('vi-VN') + ' đ'],
    ['Đã thanh toán', Number(booking.paidAmount || 0).toLocaleString('vi-VN') + ' đ'],
    ['Còn lại', Number(booking.remainingAmount || 0).toLocaleString('vi-VN') + ' đ'],
  ];

  rows.splice(
    7,
    1,
    ['Giá gốc', originalTotalPrice.toLocaleString('vi-VN') + ' đ'],
    ['Voucher', booking.voucherTitle ? `${booking.voucherTitle} (${booking.voucherCode})` : 'Không áp dụng'],
    ['Giảm bởi voucher', discountAmount.toLocaleString('vi-VN') + ' đ'],
    ['Tổng cuối cùng', Number(booking.totalPrice || 0).toLocaleString('vi-VN') + ' đ'],
  );

  return `<!doctype html><html><head><meta charset="utf-8"><title>${booking.id}</title></head><body style="font-family:Arial;line-height:1.7;padding:28px"><h1>Hóa đơn DieuBel</h1>${rows
    .map(([label, value]) => `<p><strong>${label}:</strong> ${value || ''}</p>`)
    .join('')}<p><strong>Dịch vụ:</strong> ${(booking.services || []).map((item) => item.title).join(', ') || 'Không có'}</p></body></html>`;
}

function docDanhGia() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KHOA_DANH_GIA) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function docDanhGiaPhong(roomId) {
  return docDanhGia().filter((review) => String(review.roomId) === String(roomId));
}

export function luuDanhGiaDatPhong({ booking, rating, content }) {
  const review = {
    id: `RV-${Date.now()}`,
    bookingId: booking.id,
    roomId: booking.roomId,
    hotelName: booking.hotel_name,
    guestName: booking.guestName,
    rating: Number(rating || 5),
    content: String(content || '').trim(),
    createdAt: new Date().toISOString(),
  };
  const reviews = [review, ...docDanhGia().filter((item) => item.bookingId !== booking.id)].slice(0, 100);
  window.localStorage.setItem(KHOA_DANH_GIA, JSON.stringify(reviews));

  const next = docMangDaChuanHoa().map((item) => (item.id === booking.id ? { ...item, reviewId: review.id } : item));
  ghiMang(next);
  return review;
}

export function luuDatPhongCuaToi({
  room,
  user,
  checkIn,
  checkOut,
  guests = '2',
  rooms = '1',
  services = [],
  totalPriceOverride,
  bookingType = KIEU_DAT_PHONG.OVERNIGHT,
  timeSlotId = null,
}) {
  const current = docMangDaChuanHoa();
  const pricePerNight = Number(room.price_per_night || 0);
  const roomCharge = tinhTienPhong({ bookingType, checkIn, checkOut, rooms, pricePerNight, timeSlotId });
  const totalPrice = Number(totalPriceOverride || 0) || roomCharge.roomPrice;
  const createdAt = new Date();
  const paymentDeadline = new Date(createdAt.getTime() + 15 * 60 * 1000);

  const booking = {
    id: taoMaDatPhong(createdAt),
    userId: user?.id || user?.email || 'guest',
    guestName: user?.full_name || '',
    guestEmail: user?.email || '',
    roomId: room.id,
    hotel_name: room.hotel_name,
    room_name: room.room_name,
    city: room.city,
    address: room.address,
    image_url: room.image_url,
    price_per_night: pricePerNight,
    totalPrice,
    nights: bookingType === KIEU_DAT_PHONG.OVERNIGHT ? roomCharge.units : 0,
    bookingType,
    timeSlot: roomCharge.timeSlot,
    guests,
    rooms,
    services,
    checkIn: checkIn || '',
    checkOut: checkOut || '',
    bookingStatus: TRANG_THAI_DAT_PHONG.HOLDING,
    paymentStatus: TRANG_THAI_THANH_TOAN.UNPAID,
    paymentMethod: null,
    depositAmount: Math.ceil(totalPrice * 0.1),
    paidAmount: 0,
    remainingAmount: totalPrice,
    qrToken: null,
    paymentDeadline: paymentDeadline.toISOString(),
    createdAt: createdAt.toISOString(),
  };

  const next = [booking, ...current].slice(0, 30);
  ghiMang(next);
  return booking;
}

export function huyDatPhongCuaToi(bookingId) {
  const next = docMangDaChuanHoa().map((booking) =>
    booking.id === bookingId
      ? {
          ...booking,
          bookingStatus: TRANG_THAI_DAT_PHONG.CANCELLED,
          cancelledAt: new Date().toISOString(),
        }
      : booking,
  );
  ghiMang(next);
  return next;
}

export function hoanTatDatPhongCuaToi(bookingId) {
  const next = docMangDaChuanHoa().map((booking) =>
    booking.id === bookingId
      ? {
          ...booking,
          bookingStatus: TRANG_THAI_DAT_PHONG.CHECKED_OUT,
          paymentStatus: TRANG_THAI_THANH_TOAN.PAID,
          paidAmount: Number(booking.totalPrice || 0),
          remainingAmount: 0,
          completedAt: new Date().toISOString(),
        }
      : booking,
  );
  ghiMang(next);
  return next;
}
