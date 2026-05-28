// Chức năng: Hiển thị chi tiết đơn đặt phòng và các thao tác admin.
// Panel chi tiết đơn đặt phòng cho quản lý — phiên bản nâng cấp với action buttons đẹp hơn.
import { dinhDangNgay, dinhDangNgayGio, dinhDangTien } from '../../../utils/dinhDang';
import {
  PHUONG_THUC_THANH_TOAN,
  TRANG_THAI_DAT_PHONG,
  TRANG_THAI_THANH_TOAN,
} from '../../../utils/lichSuDatPhong';
import {
  MAU_TRANG_THAI_DAT_PHONG,
  MAU_TRANG_THAI_HOAN_TIEN,
  MAU_TRANG_THAI_THANH_TOAN,
} from './bookingConstants';
import {
  ghiChuHanhDong,
  laDonNhanPhongHomNay,
  laNgoaiLeThanhToan,
  nhanDatPhong,
  nhanHoanTien,
  nhanThanhToan,
} from './bookingHelpers';
import { BadgeDatPhong, DongThongTinChiTiet } from './BookingShared';

// Icon components nhỏ
function IconCash() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 0 1-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 0 1-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-13a1 1 0 1 0-2 0v.092a4.535 4.535 0 0 0-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 1 0-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 1 0 2 0v-.092a4.535 4.535 0 0 0 1.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0 0 11 9.092V7.151c.391.127.68.317.843.504a1 1 0 1 0 1.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
  );
}

function IconCheckin() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path fillRule="evenodd" d="M3 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-.293.707L12 11.414V15a1 1 0 0 1-.293.707l-2 2A1 1 0 0 1 8 17v-5.586L3.293 6.707A1 1 0 0 1 3 6V3z" clipRule="evenodd" />
    </svg>
  );
}

function IconCheckout() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414 0l-6-6a1 1 0 1 1 1.414-1.414L9 14.586V3a1 1 0 0 1 2 0v11.586l4.293-4.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function IconCancel() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
    </svg>
  );
}

// Timeline milestones
const MILESTONES = [
  ['Tạo đơn', 'createdAt'],
  ['Xác nhận', 'confirmedAt'],
  ['Thanh toán', 'paidAt'],
  ['Check-in', 'checkedInAt'],
  ['Check-out', 'checkedOutAt'],
  ['Hủy / no-show', 'cancelledAt'],
];

export default function BookingDetail({
  booking,
  note,
  refundDecisionNote,
  setNote,
  setRefundDecisionNote,
  onStatus,
  onPayment,
  onSaveNote,
  onRefundDecision,
}) {
  if (!booking) {
    return (
      <aside className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-8 text-center">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-slate-300">
          <path fillRule="evenodd" d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zm0 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zm8 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2zm0 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2z" clipRule="evenodd" />
        </svg>
        <p className="text-sm font-bold text-slate-400">Chọn một đơn để xem chi tiết</p>
      </aside>
    );
  }

  const canManualDeposit = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED
    && booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID;
  const canManualFullPay = laNgoaiLeThanhToan(booking);
  const canCheckIn = laDonNhanPhongHomNay(booking);
  const canCheckOut = booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN;
  const canCancelHold = booking.bookingStatus === TRANG_THAI_DAT_PHONG.HOLDING
    && booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID;
  const refundRequest = booking.refundRequest || null;
  const canApproveRefund = refundRequest?.status === 'pending';

  const noAction = !canManualDeposit && !canManualFullPay && !canCheckIn && !canCheckOut && !canCancelHold;

  // Milestones with value
  const milestones = MILESTONES.map(([label, key]) => ({
    label,
    value: booking[key] || (key === 'cancelledAt' ? booking.noShowAt : null),
  }));
  const activeMilestones = milestones.filter((m) => m.value);
  const pendingMilestones = milestones.filter((m) => !m.value);

  return (
    <aside className="rounded-xl border border-slate-200 bg-white xl:sticky xl:top-6 xl:self-start">
      {/* Header */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Điều hành đơn</p>
            <h3 className="mt-1.5 font-mono text-base font-black tracking-wide text-slate-950 break-all">
              {booking.bookingCode || booking.id}
            </h3>
            <p className="mt-1 text-sm font-bold text-slate-700">{booking.guestName}</p>
            <p className="mt-0.5 break-words text-xs font-semibold text-slate-400">{booking.guestEmail}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <BadgeDatPhong tone={MAU_TRANG_THAI_DAT_PHONG[booking.bookingStatus]}>
              {nhanDatPhong(booking.bookingStatus)}
            </BadgeDatPhong>
            <BadgeDatPhong tone={MAU_TRANG_THAI_THANH_TOAN[booking.paymentStatus]}>
              {nhanThanhToan(booking.paymentStatus)}
            </BadgeDatPhong>
          </div>
        </div>

        {/* Hint action */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-slate-400">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 2 0V9H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-bold text-slate-600">{ghiChuHanhDong(booking)}</p>
        </div>
      </div>

      <div className="p-5 grid gap-5">
        {/* Hành động quản lý */}
        <section>
          <h4 className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Hành động quản lý</h4>
          <div className="mt-2.5 grid gap-2">
            {canManualDeposit ? (
              <button
                onClick={() => onPayment(booking.id, PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT)}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[.98]"
              >
                <IconCash /> Ghi nhận đã thu cọc
              </button>
            ) : null}
            {canManualFullPay ? (
              <button
                onClick={() => onPayment(booking.id, PHUONG_THUC_THANH_TOAN.ONLINE_FULL)}
                className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100 active:scale-[.98]"
              >
                <IconCash /> Ghi nhận đã thanh toán đủ
              </button>
            ) : null}
            {canCheckIn ? (
              <button
                onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_IN, 'Admin check-in tại khách sạn')}
                className="flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-black text-sky-700 transition hover:border-sky-400 hover:bg-sky-100 active:scale-[.98]"
              >
                <IconCheckin /> Check-in
              </button>
            ) : null}
            {canCheckOut ? (
              <button
                onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_OUT, 'Admin check-out')}
                className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100 active:scale-[.98]"
              >
                <IconCheckout /> Check-out
              </button>
            ) : null}
            {canCancelHold ? (
              <button
                onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CANCELLED, 'Admin hủy giữ chỗ chưa thanh toán')}
                className="flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-black text-rose-700 transition hover:bg-rose-50 active:scale-[.98]"
              >
                <IconCancel /> Hủy giữ chỗ
              </button>
            ) : null}
            {noAction ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                Trạng thái hiện tại không cần thao tác tay.
              </div>
            ) : null}
          </div>
        </section>

        {/* Refund request */}
        {refundRequest ? (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-amber-900">Yêu cầu hủy / hoàn tiền</p>
                <p className="mt-0.5 font-mono text-xs font-bold text-amber-700">{refundRequest.code}</p>
              </div>
              <BadgeDatPhong tone={MAU_TRANG_THAI_HOAN_TIEN[refundRequest.status]}>
                {nhanHoanTien(refundRequest.status)}
              </BadgeDatPhong>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/60 p-2 text-center">
                <p className="text-[10px] font-bold text-amber-600">Đã thu</p>
                <p className="mt-0.5 text-xs font-black text-amber-900">{dinhDangTien(refundRequest.paidAmount)}</p>
              </div>
              <div className="rounded-lg bg-white/60 p-2 text-center">
                <p className="text-[10px] font-bold text-amber-600">Phí hủy</p>
                <p className="mt-0.5 text-xs font-black text-amber-900">{dinhDangTien(refundRequest.cancelFeeAmount)}</p>
              </div>
              <div className="rounded-lg bg-white/60 p-2 text-center">
                <p className="text-[10px] font-bold text-amber-600">Hoàn lại</p>
                <p className="mt-0.5 text-xs font-black text-amber-900">{dinhDangTien(refundRequest.refundAmount)}</p>
              </div>
            </div>
            {refundRequest.reason ? (
              <p className="mt-2.5 text-xs font-semibold text-amber-800">Lý do: {refundRequest.reason}</p>
            ) : null}
            {canApproveRefund ? (
              <>
                <textarea
                  value={refundDecisionNote}
                  onChange={(event) => setRefundDecisionNote(event.target.value)}
                  rows={2}
                  placeholder="Ghi chú khi duyệt / từ chối"
                  className="mt-3 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-amber-400"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => onRefundDecision(refundRequest.id, 'approved')}
                    className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700 active:scale-[.98]"
                  >
                    Duyệt hủy / hoàn tiền
                  </button>
                  <button
                    onClick={() => onRefundDecision(refundRequest.id, 'rejected')}
                    className="flex-1 rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-50 active:scale-[.98]"
                  >
                    Từ chối
                  </button>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {/* Thông tin booking */}
        <section>
          <h4 className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Chi tiết đặt phòng</h4>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <DongThongTinChiTiet label="Khách sạn" value={booking.hotel_name} />
            <DongThongTinChiTiet label="Phòng" value={booking.room_name} />
            <DongThongTinChiTiet label="Nhận phòng" value={dinhDangNgay(booking.checkIn)} />
            <DongThongTinChiTiet label="Trả phòng" value={dinhDangNgay(booking.checkOut)} />
            <DongThongTinChiTiet label="Số khách" value={booking.guests} />
            <DongThongTinChiTiet label="Số phòng" value={booking.rooms} />
            <DongThongTinChiTiet label="Tổng tiền" value={dinhDangTien(booking.totalPrice)} />
            <DongThongTinChiTiet label="Còn lại" value={dinhDangTien(booking.remainingAmount)} />
          </div>
        </section>

        {/* Dòng thời gian mốc chính */}
        <section>
          <h4 className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Dòng thời gian</h4>
          <div className="mt-2.5 relative pl-5">
            {/* Vertical line */}
            {activeMilestones.length > 1 && (
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-200" />
            )}
            <div className="grid gap-2.5">
              {activeMilestones.map((m) => (
                <div key={m.label} className="flex items-start gap-3">
                  <span className="absolute -left-0 mt-1 h-[9px] w-[9px] rounded-full border-2 border-white bg-emerald-500 shadow-sm" style={{ left: 0 }} />
                  <span className="relative z-10 h-[9px] w-[9px] shrink-0 -ml-5 mt-1 rounded-full border-2 border-white bg-emerald-500 ring-1 ring-emerald-200" />
                  <div>
                    <p className="text-xs font-black text-slate-700">{m.label}</p>
                    <p className="text-[11px] font-semibold text-slate-400">{dinhDangNgayGio(m.value)}</p>
                  </div>
                </div>
              ))}
              {pendingMilestones.map((m) => (
                <div key={m.label} className="flex items-start gap-3 opacity-40">
                  <span className="relative z-10 h-[9px] w-[9px] shrink-0 -ml-5 mt-1 rounded-full border-2 border-slate-300 bg-white" />
                  <div>
                    <p className="text-xs font-semibold text-slate-400">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ghi chú nội bộ */}
        <section>
          <h4 className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Ghi chú nội bộ</h4>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Thêm ghi chú nội bộ..."
            className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <button
            onClick={() => onSaveNote(booking.id)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 active:scale-[.98]"
          >
            Lưu ghi chú
          </button>
        </section>
      </div>
    </aside>
  );
}
