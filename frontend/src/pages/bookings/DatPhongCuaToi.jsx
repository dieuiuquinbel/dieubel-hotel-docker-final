// Chức năng: Trang khách hàng theo dõi, thanh toán và quản lý đơn.
// Trang đặt chỗ của tôi.
// File này cho phép khách theo dõi đơn, tạo QR thanh toán, gửi yêu cầu hủy/hoàn tiền và xem hóa đơn.
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MyBookingsQrMock from '../../components/bookings/my-bookings/MyBookingsQrMock';
import MyBookingsVietQr from '../../components/bookings/my-bookings/MyBookingsVietQr';
import MyBookingsProgress from '../../components/bookings/my-bookings/MyBookingsProgress';
import {
  MyBookingsEmpty,
  MyBookingsError,
  MyBookingsHeader,
  MyBookingsLoading,
  MyBookingsTabs,
} from '../../components/bookings/my-bookings/MyBookingsPageParts';
import {
  chuanHoaMaVoucher,
  locDatPhong,
  timVoucherTotNhat,
} from '../../components/bookings/my-bookings/myBookingsHelpers';
import {
  capNhatTrangThaiDatPhongApi,
  xacNhanThanhToanDatPhongApi,
} from '../../services/datPhongApi';
import useKhoXacThuc from '../../store/khoXacThuc';
import useKhoThongBao from '../../store/khoThongBao';
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
import { kiemTraDieuKienVoucher, moTaDieuKienVoucher, danhDauQuaDaDung } from '../../utils/diemThuong';
import { resolveMediaUrl } from '../../utils/media';
import { taoAnhVietQr, taoMaThanhToan } from '../../utils/vietQr';
import { useDatPhongCuaToi } from '../../hooks/useDatPhongCuaToi';
import { useKhoVoucherCuaToi } from '../../hooks/useKhoVoucherCuaToi';
import { moHtmlTrongTabMoi } from '../../utils/moFileHtml';


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

function noiDungHanThanhToan(deadline) {
  const diff = new Date(deadline || 0).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return 'Đã quá hạn';
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `Còn ${minutes}:${String(seconds).padStart(2, '0')} để thanh toán`;
}


function DatPhongCuaToi() {
  const user = useKhoXacThuc((state) => state.user);
  const hienThongBao = useKhoThongBao((state) => state.hienThongBao);
  const [activeTab, setActiveTab] = useState('all');
  const [paymentDraft, setPaymentDraft] = useState(null);
  const [detailBookingId, setDetailBookingId] = useState(null);
  const [activeQrCodeToken, setActiveQrCodeToken] = useState(null);
  const [voucherByBooking, setVoucherByBooking] = useState({});
  const [voucherInputByBooking, setVoucherInputByBooking] = useState({});
  const [voucherAutoOffByBooking, setVoucherAutoOffByBooking] = useState({});
  const { bookings, error: bookingsError, isLoading: bookingsLoading, refresh, setRemoteBookings } = useDatPhongCuaToi(user);
  const [redeemedRewards] = useKhoVoucherCuaToi(user);
  const availableRewards = redeemedRewards.filter((reward) => !reward.used);
  const voucherOptions = availableRewards;
  const filteredBookings = bookings.filter((booking) => locDatPhong(booking, activeTab));
  
  const badges = {
    unpaid: bookings.filter(b => locDatPhong(b, 'unpaid')).length,
    deposit: bookings.filter(b => locDatPhong(b, 'deposit')).length,
    paid: bookings.filter(b => locDatPhong(b, 'paid')).length,
    active: bookings.filter(b => locDatPhong(b, 'active')).length,
  };

  useEffect(() => {
    const options = availableRewards;
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
  }, [bookings, availableRewards, voucherAutoOffByBooking, voucherByBooking]);

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
      hienThongBao('Đã bỏ mã giảm giá khỏi đơn này.', 'info');
      return;
    }

    const voucher = findVoucherByCode(code);
    if (!voucher) {
      hienThongBao('Không tìm thấy mã giảm giá này hoặc mã đã hết hạn.', 'error');
      return;
    }

    const voucherCheck = kiemTraDieuKienVoucher(voucher, booking.totalPrice);
    if (!voucherCheck.hopLe) {
      hienThongBao(voucherCheck.lyDo, 'error');
      return;
    }

    setVoucherByBooking((current) => ({ ...current, [booking.id]: voucher.code }));
    setVoucherInputByBooking((current) => ({ ...current, [booking.id]: voucher.code }));
    setVoucherAutoOffByBooking((current) => ({ ...current, [booking.id]: false }));
    setPaymentDraft(null);
    const bestVoucher = timVoucherTotNhat(booking.totalPrice, voucherOptions);
    hienThongBao(
      bestVoucher?.code === voucher.code
        ? `Đã áp ưu đãi tốt nhất ${voucher.code}.`
        : `Đã áp mã giảm giá ${voucher.code}.`,
      'success'
    );
  };

  const openPayment = (booking, method) => {
    const selectedVoucher = findVoucherByCode(voucherByBooking[booking.id]);

    if (selectedVoucher && !booking.voucherCode) {
      const voucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
      if (!voucherCheck.hopLe) {
        hienThongBao(voucherCheck.lyDo, 'error');
        return;
      }
    }

    const discountAmount = booking.voucherCode ? 0 : tinhGiamGiaVoucher(booking.totalPrice, selectedVoucher);
    const previewTotalPrice = Math.max(0, Number(booking.totalPrice || 0) - discountAmount);
    const previewDepositAmount = Math.ceil(previewTotalPrice * 0.1);
    const amount = method === PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT ? previewDepositAmount : previewTotalPrice;
    const paymentCode = booking.booking_code || taoMaThanhToan(booking.id);
    const paymentQrUrl = taoAnhVietQr({ amount, bookingId: booking.id, paymentMethod: method, paymentCode });

    setPaymentDraft({
      bookingId: booking.id,
      method,
      amount,
      paymentCode,
      paymentQrUrl,
      voucherCode: selectedVoucher?.code || null,
    });
  };

  const confirmPayment = async (bookingId, method) => {
    const draft = paymentDraft?.bookingId === bookingId ? paymentDraft : null;
    const booking = bookings.find((item) => item.id === bookingId);
    const selectedVoucher = findVoucherByCode(draft?.voucherCode);

    if (!booking) return;

    if (selectedVoucher && !booking.voucherCode) {
      const voucherCheck = kiemTraDieuKienVoucher(selectedVoucher, booking.totalPrice);
      if (!voucherCheck.hopLe) {
        hienThongBao(voucherCheck.lyDo, 'error');
        return;
      }
    }

    const paymentCode = draft?.paymentCode || booking.booking_code || taoMaThanhToan(booking.id);
    let confirmedBooking = booking;

    try {
      const nextBookings = await xacNhanThanhToanDatPhongApi(booking.id, method, paymentCode, selectedVoucher?.code || null);
      setRemoteBookings(nextBookings);
      confirmedBooking = nextBookings.find((item) => item.id === booking.id) || booking;
      if (selectedVoucher?.code) {
        danhDauQuaDaDung(selectedVoucher.code);
      }
    } catch (error) {
      hienThongBao(error?.response?.data?.message || 'Không xác nhận được thanh toán từ MySQL. Vui lòng kiểm tra backend/database.', 'error');
      return;
    }

    setPaymentDraft(null);
    await refresh();
    hienThongBao(`Đã xác nhận thanh toán thành công cho đơn ${confirmedBooking.booking_code || paymentCode}!`, 'success');
  };

  const openInvoice = (booking) => {
    moHtmlTrongTabMoi(taoHtmlHoaDon(booking));
  };

  return (
    <main className="history-page-bg flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <MyBookingsHeader />
        <MyBookingsTabs activeTab={activeTab} setActiveTab={setActiveTab} badges={badges} />
        <MyBookingsError message={bookingsError} />

        {bookingsLoading ? (
          <MyBookingsLoading />
        ) : filteredBookings.length ? (
          <div className="mt-6 grid gap-8">
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
                  className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md lg:grid-cols-[280px_minmax(0,1fr)]"
                >
                  <div className="relative h-48 w-full lg:h-full lg:min-h-[280px]">
                    <img src={resolveMediaUrl(booking.image_url)} alt={booking.hotel_name} className="h-full w-full object-cover" />
                  </div>

                  <div className="flex flex-col p-6">
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

                      <MyBookingsProgress booking={booking} />

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
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                          <div>
                            <p className="text-sm font-black text-emerald-800">Mã QR nhận phòng đã sẵn sàng</p>
                            <p className="mt-0.5 text-xs font-semibold text-emerald-700">Đưa mã cho lễ tân để nhận phòng.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveQrCodeToken(booking.qrToken)}
                            className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            Hiển thị mã QR
                          </button>
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
                                hienThongBao('Đã bỏ mã giảm giá khỏi đơn này.', 'info');
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
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 backdrop-blur-md p-4.5 shadow-sm">
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
                            <MyBookingsVietQr
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

                    {/* Footer của Thẻ (Gộp TỔNG CUỐI CÙNG và NÚT BẤM) */}
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                      <div className="min-w-[200px]">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Tổng cuối cùng</p>
                        <div className="mt-3 grid gap-2 text-sm">
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
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Cọc tối thiểu: <span className="font-bold text-slate-700">{dinhDangTien(previewDepositAmount)}</span>
                        </p>
                      </div>

                      <div className="flex flex-1 flex-col justify-end gap-2 lg:max-w-[400px]">
                        {/* Nhóm 1: Thanh toán (Nếu có thể thanh toán) */}
                        {canPay ? (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <button
                              type="button"
                              onClick={() => openPayment(booking, PHUONG_THUC_THANH_TOAN.ONLINE_FULL)}
                              className="flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-3 py-3.5 text-center text-xs font-black text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
                            >
                              Thanh toán toàn bộ
                            </button>
                            <button
                              type="button"
                              onClick={() => openPayment(booking, PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT)}
                              className="flex min-h-12 items-center justify-center rounded-xl bg-brand-50 px-3 py-3.5 text-center text-xs font-black text-brand-700 transition hover:bg-brand-100 active:scale-[0.98]"
                            >
                              Cọc 10%
                            </button>
                          </div>
                        ) : null}

                        {/* Nhóm 2: Thao tác chung (Action hierarchy) */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to={`/rooms/${booking.roomId}`}
                            className="flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                          >
                            Xem phòng
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDetailBookingId(booking.id)}
                            className="flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                          >
                            Chi tiết / HĐ
                          </button>
                          <Link
                            to={`/me?supportBooking=${booking.id}`}
                            className="flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                          >
                            Hỗ trợ
                          </Link>
                          {canCustomerConfirmCheckout ? (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const nextBookings = await capNhatTrangThaiDatPhongApi(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_OUT);
                                  setRemoteBookings(nextBookings);
                                  hienThongBao('Đã đánh dấu trả phòng thành công!', 'success');
                                } catch (error) {
                                  hienThongBao(error?.response?.data?.message || 'Không cập nhật được trả phòng.', 'error');
                                }
                                await refresh();
                              }}
                              className="flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-center text-xs font-black text-white shadow-sm transition hover:bg-slate-800"
                            >
                              Trả phòng
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-white/50 text-slate-400 px-3 py-2 text-center text-xs font-bold cursor-not-allowed"
                            >
                              Chờ nhận phòng
                            </button>
                          )}
                        </div>

                        {/* Hành động hủy */}
                        {booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING ? (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const nextBookings = await capNhatTrangThaiDatPhongApi(booking.id, TRANG_THAI_DAT_PHONG.CANCELLED, 'Khách hủy giữ chỗ');
                                setRemoteBookings(nextBookings);
                                hienThongBao('Đã hủy giữ chỗ thành công.', 'success');
                              } catch (error) {
                                hienThongBao(error?.response?.data?.message || 'Không hủy được đơn hàng.', 'error');
                              }
                              await refresh();
                            }}
                            className="flex min-h-11 w-full mt-2 items-center justify-center rounded-xl bg-transparent border border-rose-200 px-4 py-2 text-center text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                          >
                            Hủy giữ chỗ
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {booking.latestCustomerFeedback ? (
                      <div className="mt-4 rounded-xl bg-sky-50/50 p-4 text-sm">
                        <p className="font-black text-slate-950">Phản hồi gần nhất</p>
                        <p className="mt-1 line-clamp-2 leading-6 text-slate-600">{booking.latestCustomerFeedback.content}</p>
                      </div>
                    ) : null}

                    </div>
                </article>
              );
            })}
          </div>
        ) : (
          <MyBookingsEmpty />
        )}
      </div>

      {/* Modal QR Code Nhận phòng */}
      {activeQrCodeToken ? (
        <div 
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/80 px-4 backdrop-blur-sm transition-opacity"
          onPointerDown={(e) => { if (e.target === e.currentTarget) setActiveQrCodeToken(null); }}
        >
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-brand-600 p-6 text-center text-white">
              <p className="text-xs font-black uppercase tracking-widest text-white/80">Thẻ lên phòng</p>
              <h3 className="mt-2 text-xl font-black tracking-tight">Boarding Pass</h3>
            </div>
            <div className="p-8 text-center bg-white">
              <div className="mx-auto grid h-48 w-48 place-items-center rounded-2xl bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.05)]">
                <MyBookingsQrMock token={activeQrCodeToken} />
              </div>
              <p className="mt-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Mã QR của bạn</p>
              <p className="mt-1 break-all text-sm font-black text-slate-900">{activeQrCodeToken}</p>
            </div>
            <div className="bg-slate-50 p-4">
              <button 
                onClick={() => setActiveQrCodeToken(null)}
                className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default DatPhongCuaToi;
