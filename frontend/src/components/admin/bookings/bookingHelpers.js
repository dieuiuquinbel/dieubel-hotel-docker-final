// Helper nghiệp vụ cho màn quản lý đặt phòng.
// Các hàm ở đây giúp tách điều kiện lọc/nhãn ra khỏi file trang để dễ đọc và dễ test hơn.
import {
  NHAN_TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_THANH_TOAN,
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
} from '../../../utils/lichSuDatPhong';
import { NHAN_HOAN_TIEN, TABS_DAT_PHONG } from './bookingConstants';

export function layNgayHomNayYmd() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function laTabHopLe(raw) {
  return TABS_DAT_PHONG.some((item) => item.key === raw);
}

export function nhanDatPhong(status) {
  return NHAN_TRANG_THAI_DAT_PHONG[status] || status || 'Chưa có';
}

export function nhanThanhToan(status) {
  return NHAN_TRANG_THAI_THANH_TOAN[status] || status || 'Chưa có';
}

export function nhanHoanTien(status) {
  return NHAN_HOAN_TIEN[status] || status || 'Chưa có';
}

export function daThanhToanDu(booking) {
  return booking.paymentStatus === TRANG_THAI_THANH_TOAN.PAID;
}

export function laDonNhanPhongHomNay(booking) {
  return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED
    && daThanhToanDu(booking)
    && booking.checkIn === layNgayHomNayYmd();
}

export function laNgoaiLeThanhToan(booking) {
  return [TRANG_THAI_DAT_PHONG.HOLDING, TRANG_THAI_DAT_PHONG.CONFIRMED].includes(booking.bookingStatus)
    && booking.paymentStatus !== TRANG_THAI_THANH_TOAN.PAID;
}

export function khopTabDatPhong(booking, tab) {
  if (tab === 'review') return booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING;
  if (tab === 'payment') return laNgoaiLeThanhToan(booking);
  if (tab === 'arrival') return laDonNhanPhongHomNay(booking);
  if (tab === 'confirmed') {
    return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED
      && daThanhToanDu(booking)
      && !laDonNhanPhongHomNay(booking);
  }
  if (tab === 'staying') return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
  if (tab === 'cancel') {
    return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED || Boolean(booking.refundRequest);
  }

  return [
    TRANG_THAI_DAT_PHONG.CHECKED_OUT,
    TRANG_THAI_DAT_PHONG.CANCELLED,
    TRANG_THAI_DAT_PHONG.NO_SHOW,
    TRANG_THAI_DAT_PHONG.EXPIRED,
  ].includes(booking.bookingStatus);
}

export function khopTimKiemDatPhong(booking, query) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;

  return [booking.id, booking.guestName]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(keyword));
}

export function khopNgayDatPhong(booking, date) {
  if (!date) return true;
  return booking.checkIn === date || booking.checkOut === date;
}

export function demDonTheoTab(bookings, tab) {
  return bookings.filter((booking) => khopTabDatPhong(booking, tab)).length;
}

export function chonTabMacDinh(bookings) {
  const priority = ['review', 'arrival', 'cancel', 'payment', 'staying', 'confirmed', 'history'];
  return priority.find((key) => demDonTheoTab(bookings, key) > 0) || 'confirmed';
}

export function tomTatHanhDong(booking) {
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING) {
    return { label: 'Duyệt giữ chỗ', tone: 'text-rose-600', hint: 'Đơn mới đang chờ hệ thống xác nhận.' };
  }
  if (laNgoaiLeThanhToan(booking)) {
    return { label: 'Đối soát thanh toán', tone: 'text-amber-700', hint: 'Chỉ xử lý khi đơn treo hoặc thanh toán ngoại lệ.' };
  }
  if (laDonNhanPhongHomNay(booking)) {
    return { label: 'Check-in hôm nay', tone: 'text-sky-700', hint: 'Lễ tân thao tác khi khách đến nơi.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) {
    return { label: 'Theo dõi lưu trú', tone: 'text-sky-700', hint: 'Đơn đang ở, chờ check-out.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED || booking.refundRequest?.status === 'pending') {
    return { label: 'Duyệt hủy / hoàn tiền', tone: 'text-rose-600', hint: 'Quản lý cần quyết định hoàn hay từ chối.' };
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED) {
    return { label: 'Theo dõi trước ngày đến', tone: 'text-emerald-700', hint: 'Đơn đã được hệ thống chấp nhận.' };
  }
  return { label: 'Tra cứu lịch sử', tone: 'text-slate-700', hint: 'Đơn đã hoàn tất hoặc kết thúc.' };
}

export function ghiChuHanhDong(booking) {
  if (!booking) return '';
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING) {
    return 'Đơn mới chưa được hệ thống xác nhận. Chỉ can thiệp khi đơn treo hoặc cần hủy giữ chỗ.';
  }
  if (laNgoaiLeThanhToan(booking)) {
    return 'Thanh toán QR bình thường sẽ tự xác nhận. Khu này chỉ dành cho ngoại lệ hoặc đối soát thủ công.';
  }
  if (laDonNhanPhongHomNay(booking)) {
    return 'Đơn đã thanh toán đủ và đến ngày nhận phòng. Lễ tân thực hiện check-in khi khách tới nơi.';
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED) {
    return 'Đơn đã được hệ thống chấp nhận sau thanh toán. Chỉ cần theo dõi và ghi chú nếu có phát sinh.';
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) {
    return 'Khách đang lưu trú. Hành động chính là check-out khi khách trả phòng.';
  }
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CANCEL_REQUESTED) {
    return 'Khách đã gửi yêu cầu hủy / hoàn tiền. Quản lý cần duyệt hoặc từ chối theo chính sách.';
  }
  return 'Đơn đã kết thúc. Khu vực này chỉ để tra cứu lịch sử.';
}

export function taoThongKeHangDoi(bookings) {
  return [
    {
      label: 'Chờ duyệt',
      value: demDonTheoTab(bookings, 'review'),
      hint: 'Đơn mới cần xác nhận giữ chỗ.',
      tone: 'text-rose-600',
      tabKey: 'review',
    },
    {
      label: 'Nhận phòng hôm nay',
      value: demDonTheoTab(bookings, 'arrival'),
      hint: 'Danh sách lễ tân cần check-in.',
      tone: 'text-sky-700',
      tabKey: 'arrival',
    },
    {
      label: 'Đang lưu trú',
      value: demDonTheoTab(bookings, 'staying'),
      hint: 'Khách đang ở và chờ check-out.',
      tone: 'text-sky-700',
      tabKey: 'staying',
    },
    {
      label: 'Hủy / hoàn tiền',
      value: demDonTheoTab(bookings, 'cancel'),
      hint: 'Yêu cầu quản lý cần quyết định.',
      tone: 'text-rose-600',
      tabKey: 'cancel',
    },
  ];
}
