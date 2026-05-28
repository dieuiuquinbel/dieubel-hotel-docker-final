// Chức năng: Tiện ích điểm thưởng, đổi quà và kiểm tra voucher.
import { KHOA_LUU_TRU } from './khoaLuuTru';

const KHOA_DIEM_THUONG = KHOA_LUU_TRU.rewardPoints;
const KHOA_QUA_DA_DOI = KHOA_LUU_TRU.redeemedRewards;

export const QUA_THANH_VIEN = [
  {
    id: 'voucher-50k',
    title: 'Voucher giảm 50.000 đ',
    description: 'Áp dụng cho đơn đặt phòng tiếp theo.',
    cost: 100,
    discountType: 'fixed',
    discountValue: 50000,
  },
  {
    id: 'breakfast',
    title: 'Miễn phí bữa sáng',
    description: 'Quy đổi thành gói bữa sáng cho 1 đặt phòng.',
    cost: 180,
    discountType: 'fixed',
    discountValue: 120000,
  },
  {
    id: 'voucher-10',
    title: 'Voucher giảm 10%',
    description: 'Dùng cho đơn thanh toán online toàn bộ.',
    cost: 250,
    discountType: 'percent',
    discountValue: 0.1,
  },
  {
    id: 'airport',
    title: 'Ưu đãi đưa đón sân bay',
    description: 'Giảm chi phí dịch vụ đưa đón sân bay.',
    cost: 320,
    discountType: 'fixed',
    discountValue: 150000,
  },
];

export const VOUCHER_KHUYEN_MAI = [
  {
    id: 'first-booking-10',
    code: 'FIRST10',
    title: 'Giảm 10% booking đầu tiên',
    description: 'Áp dụng cho khách sạn đầu tiên sau khi đăng nhập hoặc đăng ký tài khoản DieuBel.',
    badge: 'Khách mới',
    discountType: 'percent',
    discountValue: 0.1,
    minSpend: 0,
    expiresIn: '7 ngày',
    imageTone: 'from-sky-300 via-blue-500 to-indigo-700',
    imageText: '10% OFF',
  },
  {
    id: 'hotel-8',
    code: 'HOTEL8',
    title: 'Giảm 8% cho phòng từ 2 đêm',
    description: 'Dành cho đơn đặt phòng khách sạn từ 2 đêm, tối đa 350.000 đ.',
    badge: 'Ở dài hơn',
    discountType: 'percent',
    discountValue: 0.08,
    minSpend: 1200000,
    expiresIn: '5 ngày',
    imageTone: 'from-emerald-300 via-teal-500 to-cyan-700',
    imageText: '8% OFF',
  },
  {
    id: 'weekend-7',
    code: 'WEEKEND7',
    title: 'Giảm 7% cuối tuần',
    description: 'Áp dụng cho khách sạn, resort biển còn phòng trong thứ Sáu đến Chủ nhật.',
    badge: 'Cuối tuần',
    discountType: 'percent',
    discountValue: 0.07,
    minSpend: 900000,
    expiresIn: '3 ngày',
    imageTone: 'from-fuchsia-400 via-pink-500 to-rose-600',
    imageText: 'DEAL',
  },
  {
    id: 'family-5',
    code: 'FAMILY5',
    title: 'Giảm 5% phòng gia đình',
    description: 'Dành cho phòng family hoặc căn hộ từ 4 khách trở lên.',
    badge: 'Gia đình',
    discountType: 'percent',
    discountValue: 0.05,
    minSpend: 1500000,
    expiresIn: '10 ngày',
    imageTone: 'from-amber-200 via-orange-400 to-red-500',
    imageText: '5% OFF',
  },
  {
    id: 'breakfast-free',
    code: 'EATFREE',
    title: 'Miễn phí bữa sáng',
    description: 'Tặng gói bữa sáng cho 2 khách khi đặt phòng suite hoặc deluxe.',
    badge: 'Dịch vụ',
    discountType: 'service',
    discountValue: 'breakfast',
    minSpend: 1000000,
    expiresIn: '6 ngày',
    imageTone: 'from-yellow-200 via-lime-300 to-emerald-500',
    imageText: 'FREE',
  },
  {
    id: 'airport-free',
    code: 'AIRPORT',
    title: 'Free đưa đón sân bay',
    description: 'Miễn phí một chiều đưa đón sân bay cho đơn resort từ 3.000.000 đ.',
    badge: 'Tiện ích',
    discountType: 'service',
    discountValue: 'airport',
    minSpend: 3000000,
    expiresIn: '4 ngày',
    imageTone: 'from-cyan-300 via-blue-500 to-violet-700',
    imageText: 'RIDE',
  },
  {
    id: 'local-6',
    code: 'LOCAL6',
    title: 'Giảm 6% khách sạn nội địa',
    description: 'Áp dụng cho các điểm đến phổ biến tại Hà Nội, Đà Nẵng, Hội An và TP.HCM.',
    badge: 'Nội địa',
    discountType: 'percent',
    discountValue: 0.06,
    minSpend: 800000,
    expiresIn: '8 ngày',
    imageTone: 'from-green-300 via-emerald-500 to-slate-800',
    imageText: 'LOCAL',
  },
  {
    id: 'late-checkout',
    code: 'LATEOUT',
    title: 'Free late checkout',
    description: 'Tặng quyền trả phòng muộn đến 14:00 cho khách sạn đủ điều kiện.',
    badge: 'Linh hoạt',
    discountType: 'service',
    discountValue: 'late-checkout',
    minSpend: 1200000,
    expiresIn: '5 ngày',
    imageTone: 'from-violet-300 via-purple-500 to-slate-900',
    imageText: 'VIP',
  },
];

function docSo(key) {
  const value = Number(window.localStorage.getItem(key) || 0);
  return Number.isFinite(value) ? value : 0;
}

function docMang(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function docDiemThuong() {
  return docSo(KHOA_DIEM_THUONG);
}

export function congDiemThuong(points) {
  const next = Math.max(0, docDiemThuong() + Number(points || 0));
  window.localStorage.setItem(KHOA_DIEM_THUONG, String(next));
  return next;
}

export function docQuaDaDoi() {
  return docMang(KHOA_QUA_DA_DOI);
}

export function danhDauQuaDaDung(code) {
  const next = docQuaDaDoi().map((reward) =>
    reward.code === code ? { ...reward, used: true, usedAt: new Date().toISOString() } : reward,
  );
  window.localStorage.setItem(KHOA_QUA_DA_DOI, JSON.stringify(next));
  return next;
}

function docSoNgayHetHan(voucher) {
  const match = String(voucher?.expiresIn || '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function kiemTraDieuKienVoucher(voucher, totalPrice) {
  if (!voucher) {
    return { hopLe: true, lyDo: '' };
  }

  if (voucher.used) {
    return { hopLe: false, lyDo: 'Voucher này đã được sử dụng.' };
  }

  const minSpend = Number(voucher.minSpend || 0);
  if (minSpend > 0 && Number(totalPrice || 0) < minSpend) {
    return {
      hopLe: false,
      lyDo: `Đơn cần tối thiểu ${minSpend.toLocaleString('vi-VN')} đ để dùng voucher này.`,
    };
  }

  const soNgayHetHan = docSoNgayHetHan(voucher);
  const mocLuu = voucher.savedAt || voucher.redeemedAt;
  if (soNgayHetHan && mocLuu) {
    const hetHanLuc = new Date(mocLuu).getTime() + soNgayHetHan * 24 * 60 * 60 * 1000;
    if (Number.isFinite(hetHanLuc) && Date.now() > hetHanLuc) {
      return { hopLe: false, lyDo: 'Voucher này đã hết hạn.' };
    }
  }

  return { hopLe: true, lyDo: '' };
}

export function moTaDieuKienVoucher(voucher) {
  if (!voucher) return '';

  const dieuKien = [];
  if (Number(voucher.minSpend || 0) > 0) {
    dieuKien.push(`tối thiểu ${Number(voucher.minSpend).toLocaleString('vi-VN')} đ`);
  }
  if (voucher.expiresIn) {
    dieuKien.push(`hết hạn sau ${voucher.expiresIn}`);
  }

  return dieuKien.join(', ');
}

export function docNhiemVuNhanThuong({ user, bookings = [], favoriteRooms = [], reviews = [] }) {
  return [
    { id: 'verify_email', title: 'Xác minh email', points: 50, completed: Boolean(user?.email_verified) },
    { id: 'first_booking', title: 'Đặt phòng đầu tiên', points: 100, completed: bookings.length > 0 },
    {
      id: 'online_payment',
      title: 'Thanh toán online',
      points: 50,
      completed: bookings.some((booking) => booking.paymentStatus === 'paid' || booking.paymentStatus === 'deposit_paid'),
    },
    { id: 'write_review', title: 'Viết đánh giá sau checkout', points: 30, completed: reviews.length > 0 },
    { id: 'save_3_rooms', title: 'Lưu 3 phòng yêu thích', points: 20, completed: favoriteRooms.length >= 3 },
  ];
}

export function doiQuaThuong(reward) {
  const currentPoints = docDiemThuong();

  if (!reward || currentPoints < reward.cost) {
    return {
      ok: false,
      points: currentPoints,
      redeemed: docQuaDaDoi(),
    };
  }

  const nextPoints = currentPoints - reward.cost;
  const redeemedReward = {
    ...reward,
    code: `DB-${reward.id.toUpperCase()}-${String(Date.now()).slice(-5)}`,
    redeemedAt: new Date().toISOString(),
    used: false,
  };
  const nextRedeemed = [redeemedReward, ...docQuaDaDoi()].slice(0, 20);

  window.localStorage.setItem(KHOA_DIEM_THUONG, String(nextPoints));
  window.localStorage.setItem(KHOA_QUA_DA_DOI, JSON.stringify(nextRedeemed));

  return {
    ok: true,
    points: nextPoints,
    redeemed: nextRedeemed,
  };
}

export function luuVoucherKhuyenMai(voucher) {
  if (!voucher) return docQuaDaDoi();

  const current = docQuaDaDoi();
  const existing = current.find((reward) => reward.code === voucher.code);
  if (existing) return current;

  const savedVoucher = {
    ...voucher,
    title: voucher.title,
    description: voucher.description,
    savedAt: new Date().toISOString(),
    redeemedAt: new Date().toISOString(),
    used: false,
    source: 'home-promotion',
  };
  const nextRedeemed = [savedVoucher, ...current].slice(0, 30);
  window.localStorage.setItem(KHOA_QUA_DA_DOI, JSON.stringify(nextRedeemed));
  return nextRedeemed;
}
