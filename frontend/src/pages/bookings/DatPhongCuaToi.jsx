// Trang dat cho cua toi: theo doi don, tao QR thanh toan, huy/hoan tien va xem hoa don.
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatPhongCuaToiQrMinhHoa from './DatPhongCuaToi-QrMinhHoa';
import DatPhongCuaToiThanhToanVietQr from './DatPhongCuaToi-ThanhToanVietQr';
import DatPhongCuaToiTienTrinh from './DatPhongCuaToi-TienTrinh';
import {
  capNhatTrangThaiDatPhongApi,
  xacNhanThanhToanDatPhongApi,
} from '../../services/datPhongApi';
import useKhoXacThuc from '../../store/khoXacThuc';
import {
  TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_DAT_PHONG,
  KIEU_DAT_PHONG,
  NHAN_KIEU_DAT_PHONG,
  PHUONG_THUC_THANH_TOAN,
  TRANG_THAI_THANH_TOAN,
  NHAN_TRANG_THAI_THANH_TOAN,
  taoHtmlHoaDon,
  tinhGiamGiaVoucher,
} from '../../utils/lichSuDatPhong';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';
import { kiemTraDieuKienVoucher, moTaDieuKienVoucher } from '../../utils/diemThuong';
import { resolveMediaUrl } from '../../utils/media';
import { taoAnhVietQr, taoMaThanhToan } from '../../utils/vietQr';
import { useDatPhongCuaToi } from '../../hooks/useDatPhongCuaToi';
import { useKhoVoucherCuaToi } from '../../hooks/useKhoVoucherCuaToi';
import { moHtmlTrongTabMoi } from '../../utils/moFileHtml';
import { layDanhSachVoucherApi } from '../../services/voucherApi';

const TAB_DAT_PHONG = [
  { key: 'all', label: 'Tất cả' },
  { key: TRANG_THAI_THANH_TOAN.UNPAID, label: 'Chờ thanh toán' },
  { key: TRANG_THAI_THANH_TOAN.DEPOSIT_PAID, label: 'Đã cọc' },
  { key: TRANG_THAI_THANH_TOAN.PAID, label: 'Đã thanh toán' },
  { key: TRANG_THAI_DAT_PHONG.CHECKED_IN, label: 'Đang lưu trú' },
];

function lopTrangThaiThanhToan(paymentStatus) {
  if (paymentStatus === TRANG_THAI_THANH_TOAN.PAID) return 'bg-emerald-50 text-emerald-700';
  if (paymentStatus === TRANG_THAI_THANH_TOAN.DEPOSIT_PAID) return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

function lopTrangThaiDatPhong(bookingStatus) {
  if (bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) return 'bg-sky-50 text-sky-700';
  if (bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED) return 'bg-brand-50 text-brand-700';
  return 'bg-slate-100 text-slate-700';
}

function locDatPhong(booking, activeTab) {
  if ([TRANG_THAI_DAT_PHONG.CANCELLED, TRANG_THAI_DAT_PHONG.CHECKED_OUT, TRANG_THAI_DAT_PHONG.NO_SHOW].includes(booking.bookingStatus)) {
    return false;
  }

  if (activeTab === 'all') return true;
  if (activeTab === TRANG_THAI_DAT_PHONG.CHECKED_IN) return booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
  return booking.paymentStatus === activeTab;
}

function noiDungHanThanhToan(deadline) {
  const diff = new Date(deadline || 0).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return 'Đã quá hạn';
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `Còn ${minutes}:${String(seconds).padStart(2, '0')} để thanh toán`;
}

function chuanHoaMaVoucher(value = '') {
  return String(value).trim().toUpperCase();
}

function gopVoucherKhongTrung(...groups) {
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

function tinhGiaTriToiUuVoucher(totalPrice, voucher) {
  if (!voucher) return 0;
  if (!kiemTraDieuKienVoucher(voucher, totalPrice).hopLe) return 0;
  if (voucher.discountType === 'service') return 0;
  return tinhGiamGiaVoucher(totalPrice, voucher);
}

function timVoucherTotNhat(totalPrice, vouchers) {
  return vouchers.reduce((best, voucher) => {
    const discount = tinhGiaTriToiUuVoucher(totalPrice, voucher);
    const bestDiscount = tinhGiaTriToiUuVoucher(totalPrice, best);

    if (discount > bestDiscount) return voucher;
    return best;
  }, null);
}

function DatPhongCuaToi() {
  const user = useKhoXacThuc((state) => state.user);
  const [activeTab, setActiveTab] = useState('all');
  const [paymentDraft, setPaymentDraft] = useState(null);
  const [paymentThongBao, setPaymentThongBao] = useState('');
  const [detailBookingId, setDetailBookingId] = useState(null);
  const [voucherByBooking, setVoucherByBooking] = useState({});
  const [voucherInputByBooking, setVoucherInputByBooking] = useState({});
  const [voucherAutoOffByBooking, setVoucherAutoOffByBooking] = useState({});
  const [publicVouchers, setPublicVouchers] = useState([]);
  const { bookings, error: bookingsError, isLoading: bookingsLoading, refresh, setRemoteBookings } = useDatPhongCuaToi(user);
  const [redeemedRewards] = useKhoVoucherCuaToi(user);
  const availableRewards = redeemedRewards.filter((reward) => !reward.used);
  const voucherOptions = gopVoucherKhongTrung(availableRewards, publicVouchers);
  const filteredBookings = bookings.filter((booking) => locDatPhong(booking, activeTab));

  useEffect(() => {
    let isMounted = true;

    layDanhSachVoucherApi()
      .then((data) => {
        if (isMounted && Array.isArray(data)) setPublicVouchers(data);
      })
      .catch(() => {
        if (isMounted) setPublicVouchers([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const options = gopVoucherKhongTrung(redeemedRewards.filter((reward) => !reward.used), publicVouchers);
    if (!options.length || !bookings.length) return;

    const nextVoucherByBooking = {};
    const nextVoucherInputByBooking = {};

    bookings.forEach((booking) => {
      const canPay = booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID && booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING;
      if (!canPay || booking.voucherCode || voucherByBooking[booking.id] || voucherAutoOffByBooking[booking.id]) return;

      const bestVoucher = timVoucherTotNhat(booking.totalPrice, options);
      if (!bestVoucher) return;

      nextVoucherByBooking[booking.id] = bestVoucher.code;
      nextVoucherInputByBooking[booking.id] = bestVoucher.code;
    });

    if (Object.keys(nextVoucherByBooking).length) {
      setVoucherByBooking((current) => ({ ...nextVoucherByBooking, ...current }));
      setVoucherInputByBooking((current) => ({ ...nextVoucherInputByBooking, ...current }));
    }
  }, [bookings, publicVouchers, redeemedRewards, voucherAutoOffByBooking, voucherByBooking]);

  const findVoucherByCode = (code) => {
    const normalizedCode = chuanHoaMaVoucher(code);
    return voucherOptions.find((reward) => chuanHoaMaVoucher(reward.code) === normalizedCode) || null;
  };

  const applyVoucher = (booking) => {
    const code = chuanHoaMaVoucher(voucherInputByBooking[booking.id]);

    if (!code) {
      setVoucherByBooking((current) => ({ ...current, [booking.id]: '' }));
      setVoucherAutoOffByBooking((current) => ({ ...current, [booking.id]: true }));
      setPaymentDraft(null);
      setPaymentThongBao('Đã bỏ mã giảm giá khỏi đơn này.');
      return;
    }

    const voucher = findVoucherByCode(code);
    if (!voucher) {
      setPaymentThongBao('Không tìm thấy mã giảm giá này hoặc mã đã hết hạn.');
      return;
    }

    const voucherCheck = kiemTraDieuKienVoucher(voucher, booking.totalPrice);
    if (!voucherCheck.hopLe) {
      setPaymentThongBao(voucherCheck.lyDo);
      return;
    }

    setVoucherByBooking((current) => ({ ...current, [booking.id]: voucher.code }));
    setVoucherInputByBooking((current) => ({ ...current, [booking.id]: voucher.code }));
    setVoucherAutoOffByBooking((current) => ({ ...current, [booking.id]: false }));
    setPaymentDraft(null);
    const bestVoucher = timVoucherTotNhat(booking.totalPrice, voucherOptions);
    setPaymentThongBao(
      bestVoucher?.code === voucher.code
        ? `Đã áp ưu đãi tốt nhất ${voucher.code}. Bấm thanh toán để tạo QR theo số tiền sau giảm.`
        : `Đã áp mã ${voucher.code}. Bấm thanh toán để tạo QR theo số tiền sau giảm.`,
    );
  };

  const openPayment = (booking, method) => {
    const selectedVoucher = findVoucherByCode(voucherByBooking[booking.id]);

    if (selectedVoucher && !booking.voucherCode) {
      const voucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
      if (!voucherCheck.hopLe) {
        setPaymentThongBao(voucherCheck.lyDo);
        return;
      }
    }

    const discountAmount = booking.voucherCode ? 0 : tinhGiamGiaVoucher(booking.totalPrice, selectedVoucher);
    const previewTotalPrice = Math.max(0, Number(booking.totalPrice || 0) - discountAmount);
    const previewDepositAmount = Math.ceil(previewTotalPrice * 0.1);
    const amount = method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? previewDepositAmount : previewTotalPrice;
    const paymentCode = taoMaThanhToan(booking.id);
    const paymentQrUrl = taoAnhVietQr({ amount, bookingId: booking.id, paymentMethod: method, paymentCode });

    setPaymentDraft({
      bookingId: booking.id,
      method,
      amount,
      paymentCode,
      paymentQrUrl,
      voucherCode: selectedVoucher?.code || null,
    });
    setPaymentThongBao('');
  };

  const confirmPayment = async (bookingId, method) => {
    const draft = paymentDraft?.bookingId === bookingId ? paymentDraft : null;
    const booking = bookings.find((item) => item.id === bookingId);
    const selectedVoucher = findVoucherByCode(draft?.voucherCode);

    if (!booking) return;

    if (selectedVoucher && !booking.voucherCode) {
      const voucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
      if (!voucherCheck.hopLe) {
        setPaymentThongBao(voucherCheck.lyDo);
        return;
      }

    }

    const paymentCode = draft?.paymentCode || taoMaThanhToan(booking.id);
    let confirmedBooking = booking;

    try {
      const nextBookings = await xacNhanThanhToanDatPhongApi(booking.id, method, paymentCode, selectedVoucher?.code || null);
      setRemoteBookings(nextBookings);
      confirmedBooking = nextBookings.find((item) => item.id === booking.id) || booking;
    } catch (error) {
      setPaymentThongBao(error?.response?.data?.message || 'Không xác nhận được thanh toán từ MySQL. Vui lòng kiểm tra backend/database.');
      return;
    }

    setPaymentDraft(null);
    await refresh();
    setPaymentThongBao(`Đã xác nhận thanh toán cho ${confirmedBooking.id || paymentCode}.`);
  };

  const openInvoice = (booking) => {
    moHtmlTrongTabMoi(taoHtmlHoaDon(booking));
  };

  return (
    <main className="history-page-bg flex-1">
      <section className="mx-auto max-w-[1380px] px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Đặt chỗ của tôi</span>
            <h1 className="mt-3 text-[28px] font-bold tracking-normal text-[#222222]">Quản lý đặt chỗ và thanh toán</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Các phòng vừa giữ chỗ sẽ nằm tại đây để bạn thanh toán online, cọc 10% hoặc hủy giữ chỗ khi không còn nhu cầu.
            </p>
          </div>
          <Link
            to="/rooms"
            className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Tìm thêm khách sạn
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 rounded-[14px] border border-[#dddddd] bg-white p-2">
          {TAB_DAT_PHONG.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.key ? 'bg-[#222222] text-white' : 'text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {paymentThongBao ? (
          <div className="mt-5 rounded-lg border border-[#dddddd] bg-[#f7f7f7] px-4 py-3 text-sm font-medium text-[#222222]">
            {paymentThongBao}
          </div>
        ) : null}

        {bookingsError ? (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {bookingsError}
          </div>
        ) : null}

        {bookingsLoading ? (
          <div className="surface-card mt-8 p-8 text-center text-sm font-bold text-slate-500">
            Đang tải dữ liệu đặt phòng từ MySQL...
          </div>
        ) : filteredBookings.length ? (
          <div className="mt-6 grid gap-5">
            {filteredBookings.map((booking) => {
              const isPaying = paymentDraft?.bookingId === booking.id;
              const payNowAmount =
                paymentDraft?.amount || (paymentDraft?.method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? booking.depositAmount : booking.totalPrice);
              const paidByCurrentDraft =
                isPaying && [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID, TRANG_THAI_THANH_TOAN.PAID].includes(booking.paymentStatus);
              const canPay = booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID && booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING;
              const hasCheckInQr = Boolean(booking.qrToken);
              const canCustomerConfirmCheckout = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN && booking.paymentStatus !== TRANG_THAI_THANH_TOAN.UNPAID;
              const appliedVoucherCode = voucherByBooking[booking.id] || '';
              const voucherInputCode = voucherInputByBooking[booking.id] ?? appliedVoucherCode;
              const selectedVoucher = findVoucherByCode(appliedVoucherCode);
              const bestVoucher = timVoucherTotNhat(booking.totalPrice, voucherOptions);
              const isBestVoucherSelected = Boolean(selectedVoucher && bestVoucher && selectedVoucher.code === bestVoucher.code);
              const selectedVoucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
              const selectedVoucherHopLe = !selectedVoucher || selectedVoucherCheck.hopLe;
              const activeVoucher = booking.voucherCode ? booking : selectedVoucher;
              const baseTotalPrice = Number(booking.originalTotalPrice || Number(booking.totalPrice || 0) + Number(booking.discountAmount || 0));
              const previewDiscount = booking.voucherCode
                ? Number(booking.discountAmount || 0)
                : selectedVoucherHopLe
                  ? tinhGiamGiaVoucher(booking.totalPrice, selectedVoucher)
                  : 0;
              const previewTotalPrice = booking.voucherCode
                ? Number(booking.totalPrice || 0)
                : Math.max(0, Number(booking.totalPrice || 0) - previewDiscount);
              const previewDepositAmount = Math.ceil(previewTotalPrice * 0.1);
              const hasVoucherPreview = Boolean(activeVoucher);
              const hasMoneyDiscount = previewDiscount > 0;

              return (
                <article
                  key={booking.id}
                  className="subtle-card grid overflow-hidden 2xl:grid-cols-[minmax(0,1fr)_300px]"
                >
                  <div className="grid min-w-0 lg:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)]">
                    <img src={resolveMediaUrl(booking.image_url)} alt={booking.hotel_name} className="h-56 w-full object-cover lg:h-full" />

                    <div className="min-w-0 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${lopTrangThaiDatPhong(booking.bookingStatus)}`}>
                          {NHAN_TRANG_THAI_DAT_PHONG[booking.bookingStatus] || booking.bookingStatus}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${lopTrangThaiThanhToan(booking.paymentStatus)}`}>
                          {NHAN_TRANG_THAI_THANH_TOAN[booking.paymentStatus] || booking.paymentStatus}
                        </span>
                        <span className="rounded-full bg-[#f7f7f7] px-3 py-1 text-xs font-medium text-[#222222]">{booking.id}</span>
                        {booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING && booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            {noiDungHanThanhToan(booking.paymentDeadline)}
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-3 text-[22px] font-semibold tracking-normal text-[#222222]">{booking.hotel_name}</h2>
                      <p className="mt-1 text-sm font-bold text-slate-600">{booking.room_name}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-500">{booking.address}</p>

                      <DatPhongCuaToiTienTrinh booking={booking} />

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold text-slate-500">Hình thức</p>
                          <p className="mt-1 text-sm font-black text-slate-950">{NHAN_KIEU_DAT_PHONG[booking.bookingType] || 'Qua đêm'}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold text-slate-500">Thời gian</p>
                          <p className="mt-1 text-sm font-black text-slate-950">{dinhDangNgay(booking.checkIn) || 'Chưa chọn'}</p>
                          {booking.bookingType === KIEU_DAT_PHONG.DAY_USE ? (
                            <p className="mt-1 text-xs font-bold text-slate-500">{booking.timeSlot?.label} · {booking.timeSlot?.time}</p>
                          ) : null}
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold text-slate-500">Trả phòng</p>
                          <p className="mt-1 text-sm font-black text-slate-950">{dinhDangNgay(booking.checkOut) || 'Chưa chọn'}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold text-slate-500">Đã thanh toán</p>
                          <p className="mt-1 text-sm font-black text-slate-950">{dinhDangTien(booking.paidAmount)}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold text-slate-500">Còn lại</p>
                          <p className="mt-1 text-sm font-black text-brand-700">{dinhDangTien(booking.remainingAmount)}</p>
                        </div>
                      </div>

                      {hasCheckInQr ? (
                        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[14px] border border-[#dddddd] bg-[#f7f7f7] p-4">
                          <DatPhongCuaToiQrMinhHoa token={booking.qrToken} />
                          <div>
                            <p className="text-sm font-black text-emerald-800">QR nhận phòng đã sẵn sàng</p>
                            <p className="mt-1 text-sm leading-6 text-emerald-700">
                              Khi đến khách sạn, xuất trình mã này để nhân viên quét check-in.
                            </p>
                            <p className="mt-2 break-all text-xs font-bold text-emerald-900">{booking.qrToken}</p>
                          </div>
                        </div>
                      ) : null}

                      {canPay ? (
                        <div className="mt-5 rounded-[14px] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-950">Mã giảm giá</p>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                Áp mã trước khi tạo QR để số tiền thanh toán được tính lại.
                              </p>
                            </div>
                            {selectedVoucher && selectedVoucherHopLe ? (
                              <span className={`rounded-full px-3 py-1 text-xs font-black ${isBestVoucherSelected ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {isBestVoucherSelected ? 'Ưu đãi tốt nhất' : selectedVoucher.code}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.7fr)]">
                            <input
                              value={voucherInputCode}
                              onChange={(event) => {
                                const nextCode = chuanHoaMaVoucher(event.target.value);
                                setVoucherInputByBooking((current) => ({ ...current, [booking.id]: nextCode }));
                              }}
                              placeholder="Nhập mã, ví dụ DIEUBEL10"
                              className="field-shell min-h-11 w-full px-3 py-2 text-sm font-bold uppercase outline-none"
                            />
                            {voucherOptions.length ? (
                              <select
                                value={appliedVoucherCode}
                                onChange={(event) => {
                                  const nextCode = event.target.value;
                                  setVoucherByBooking((current) => ({ ...current, [booking.id]: nextCode }));
                                  setVoucherInputByBooking((current) => ({ ...current, [booking.id]: nextCode }));
                                  setVoucherAutoOffByBooking((current) => ({ ...current, [booking.id]: !nextCode }));
                                  setPaymentDraft(null);
                                }}
                                className="field-shell min-h-11 w-full px-3 py-2 text-sm font-bold outline-none"
                              >
                                <option value="">Không áp dụng</option>
                                {voucherOptions.map((reward) => (
                                  <option
                                    key={reward.code}
                                    value={reward.code}
                                    disabled={!kiemTraDieuKienVoucher(reward, booking.totalPrice).hopLe}
                                  >
                                  {reward.code} - {reward.title}{bestVoucher?.code === reward.code ? ' - Ưu đãi tốt nhất' : ''}{moTaDieuKienVoucher(reward) ? ` - ${moTaDieuKienVoucher(reward)}` : ''}
                                </option>
                              ))}
                            </select>
                          ) : null}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => applyVoucher(booking)}
                              className="min-h-10 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800"
                            >
                              Áp mã
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVoucherByBooking((current) => ({ ...current, [booking.id]: '' }));
                                setVoucherInputByBooking((current) => ({ ...current, [booking.id]: '' }));
                                setVoucherAutoOffByBooking((current) => ({ ...current, [booking.id]: true }));
                                setPaymentDraft(null);
                                setPaymentThongBao('Đã bỏ mã giảm giá khỏi đơn này.');
                              }}
                              className="min-h-10 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-slate-900"
                            >
                              Bỏ mã
                            </button>
                            {selectedVoucher && !selectedVoucherHopLe ? (
                              <span className="flex items-center text-xs font-bold text-rose-600">{selectedVoucherCheck.lyDo}</span>
                            ) : null}
                            {selectedVoucher && selectedVoucherHopLe && selectedVoucher.discountType !== 'service' ? (
                              <span className="flex items-center text-xs font-bold text-emerald-700">
                                Dự kiến giảm {dinhDangTien(previewDiscount)}, tổng còn {dinhDangTien(previewTotalPrice)}.
                              </span>
                            ) : null}
                            {selectedVoucher && selectedVoucherHopLe && selectedVoucher.discountType === 'service' ? (
                              <span className="flex items-center text-xs font-bold text-emerald-700">Voucher này tặng dịch vụ, không trừ trực tiếp vào tiền phòng.</span>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                    {isPaying ? (
                      <div className="mt-5 rounded-[14px] border border-[#dddddd] bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              {paymentDraft.method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? 'VietQR cọc giữ phòng 10%' : 'VietQR thanh toán toàn bộ'}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Quét mã rồi xác nhận để hệ thống dùng voucher và cập nhật đơn.
                            </p>
                          </div>
                          <p className="text-xl font-black text-brand-700">{dinhDangTien(payNowAmount)}</p>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                          <div className="md:max-w-[220px]">
                            <DatPhongCuaToiThanhToanVietQr
                              amount={payNowAmount}
                              bookingId={booking.id}
                              paymentMethod={paymentDraft.method}
                              paymentCode={paymentDraft.paymentCode}
                            />
                          </div>
                          <div className="grid content-start gap-3">
                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                              <p className="font-black text-slate-950">Nội dung CK</p>
                              <p className="mt-1 break-all font-black text-brand-700">{paymentDraft.paymentCode}</p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                            {paidByCurrentDraft ? (
                              <div className="flex min-h-12 items-center justify-center rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                                Đã xác nhận
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => confirmPayment(booking.id, paymentDraft.method)}
                                className="min-h-12 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
                              >
                                Tôi đã thanh toán
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setPaymentDraft(null)}
                              className="min-h-12 rounded-lg border border-[#222222] bg-white px-4 py-3 text-sm font-medium text-[#222222] transition hover:bg-[#f7f7f7]"
                            >
                              Để sau
                            </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {detailBookingId === booking.id ? (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-black text-slate-950">Chi tiết đơn và hóa đơn</p>
                          <button type="button" onClick={() => setDetailBookingId(null)} className="text-sm font-bold text-slate-500 hover:text-brand-700">
                            Đóng
                          </button>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                          <p><strong>Mã đơn:</strong> {booking.id}</p>
                          <p><strong>Mã HD:</strong> {booking.paymentCode || 'Chưa thanh toán'}</p>
                          <p><strong>Khách:</strong> {booking.guestName}</p>
                          <p><strong>Email:</strong> {booking.guestEmail}</p>
                          <p><strong>Dịch vụ:</strong> {(booking.services || []).map((item) => item.title).join(', ') || 'Không có'}</p>
                          <p><strong>Voucher:</strong> {activeVoucher ? `${activeVoucher.voucherTitle || activeVoucher.title} (${activeVoucher.voucherCode || activeVoucher.code})` : 'Chưa áp dụng'}</p>
                          <p><strong>Giá gốc:</strong> {dinhDangTien(baseTotalPrice)}</p>
                          <p><strong>Giảm voucher:</strong> {dinhDangTien(previewDiscount)}</p>
                          <p><strong>Tổng cuối cùng:</strong> {dinhDangTien(previewTotalPrice)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openInvoice(booking)}
                          className="mt-4 rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700"
                        >
                          Xem hóa đơn
                        </button>
                      </div>
                    ) : null}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col justify-between gap-4 overflow-hidden border-t border-[#dddddd] bg-white p-5 2xl:border-l 2xl:border-t-0">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Tổng cuối cùng</p>
                      <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                          <span>Giá gốc</span>
                          <span className="font-bold text-slate-900">{dinhDangTien(baseTotalPrice)}</span>
                        </div>
                        {hasVoucherPreview ? (
                          <div className="flex items-start justify-between gap-3 text-slate-600">
                            <span>Voucher</span>
                            <span className="grid justify-items-end gap-1 text-right">
                              {isBestVoucherSelected ? (
                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase text-rose-700">Ưu đãi tốt nhất</span>
                              ) : null}
                              <span className="max-w-[150px] font-bold text-slate-900">
                                {activeVoucher.voucherTitle || activeVoucher.title || activeVoucher.voucherCode || activeVoucher.code}
                              </span>
                            </span>
                          </div>
                        ) : null}
                        {hasVoucherPreview ? (
                          <div className="flex items-center justify-between gap-3 text-emerald-700">
                            <span>{hasMoneyDiscount ? 'Đã giảm' : 'Ưu đãi dịch vụ'}</span>
                            <span className="font-black">
                              {hasMoneyDiscount ? `-${dinhDangTien(previewDiscount)}` : 'Đã áp dụng'}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-3 text-2xl font-black text-slate-950">{dinhDangTien(previewTotalPrice)}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Cọc tối thiểu: <span className="font-black text-slate-700">{dinhDangTien(previewDepositAmount)}</span>
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <Link
                        to={`/rooms/${booking.roomId}`}
                        className="flex min-h-12 w-full min-w-0 items-center justify-center overflow-hidden rounded-lg border border-[#222222] bg-white px-4 py-3 text-center text-sm font-medium leading-5 text-[#222222] transition hover:bg-[#f7f7f7]"
                      >
                        Xem khách sạn
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDetailBookingId(booking.id)}
                        className="min-h-12 w-full min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold leading-5 text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                      >
                        Chi tiết / hóa đơn
                      </button>
                      <button
                        type="button"
                        disabled={!canPay}
                        onClick={() => openPayment(booking, PHUONG_THUC_THANH_TOAN.ONLINE_FULL)}
                        className="min-h-12 w-full min-w-0 overflow-hidden rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-medium leading-5 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-100"
                      >
                        Thanh toán toàn bộ
                      </button>
                      <button
                        type="button"
                        disabled={!canPay}
                        onClick={() => openPayment(booking, PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT)}
                        className="min-h-12 w-full min-w-0 overflow-hidden rounded-lg border border-[#222222] bg-white px-4 py-3 text-center text-sm font-medium leading-5 text-[#222222] transition hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:border-[#dddddd] disabled:text-[#929292]"
                      >
                        Cọc 10%
                      </button>
                      <button
                        type="button"
                        disabled={booking.bookingStatus !== TRANG_THAI_DAT_PHONG.HOLDING}
                        onClick={async () => {
                          try {
                            const nextBookings = await capNhatTrangThaiDatPhongApi(booking.id, TRANG_THAI_DAT_PHONG.CANCELLED, 'Khách hủy giữ chỗ');
                            setRemoteBookings(nextBookings);
                          } catch (error) {
                            setPaymentThongBao(error?.response?.data?.message || 'Không hủy được đơn trên MySQL. Vui lòng kiểm tra backend/database.');
                            return;
                          }
                          await refresh();
                        }}
                        className="min-h-12 w-full min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold leading-5 text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        Hủy giữ chỗ
                      </button>
                      <button
                        type="button"
                        disabled={!canCustomerConfirmCheckout}
                        onClick={async () => {
                          try {
                            const nextBookings = await capNhatTrangThaiDatPhongApi(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_OUT);
                            setRemoteBookings(nextBookings);
                          } catch (error) {
                            setPaymentThongBao(error?.response?.data?.message || 'Không cập nhật trả phòng trên MySQL. Vui lòng kiểm tra backend/database.');
                            return;
                          }
                          await refresh();
                        }}
                        className="min-h-12 w-full min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold leading-5 text-slate-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        Đánh dấu trả phòng
                      </button>
                      <Link
                        to={`/me?supportBooking=${booking.id}`}
                        className="flex min-h-12 w-full min-w-0 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold leading-5 text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                      >
                        Hỗ trợ / khiếu nại
                      </Link>
                    </div>

                    {booking.latestCustomerFeedback ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
                        <p className="font-black text-slate-950">Phản hồi gần nhất</p>
                        <p className="mt-1 line-clamp-3 leading-6 text-slate-600">{booking.latestCustomerFeedback.content}</p>
                      </div>
                    ) : null}

                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="surface-card mt-8 p-8 text-center">
            <p className="text-sm font-bold text-brand-700">Không có đơn phù hợp</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Các đơn đang xử lý sẽ hiển thị tại đây.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Đơn đã hủy hoặc đã trả phòng sẽ được chuyển sang tab Lịch sử để bạn xem lại.
            </p>
            <Link to="/rooms" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white">
              Tìm chỗ ở
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default DatPhongCuaToi;
