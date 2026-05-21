// Panel chi tiết đơn đặt phòng cho quản lý.
// File này gom toàn bộ phần ra quyết định và hiển thị mốc chính của một đơn.
import { dinhDangNgay, dinhDangTien } from '../../../utils/dinhDang';
import { dinhDangNgayGio } from '../../../pages/admin/QuanLyDatPhong-TienIch.jsx';
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
  daThanhToanDu,
  ghiChuHanhDong,
  laDonNhanPhongHomNay,
  laNgoaiLeThanhToan,
  nhanDatPhong,
  nhanHoanTien,
  nhanThanhToan,
} from './bookingHelpers';
import { BadgeDatPhong, DongThongTinChiTiet } from './BookingShared';

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
      <aside className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
        Chọn một đơn để xem chi tiết.
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

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 xl:sticky xl:top-6 xl:self-start">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">Điều hành đơn</p>
          <h3 className="mt-2 break-all text-xl font-black text-slate-950">{booking.id}</h3>
          <p className="mt-1 text-sm font-bold text-slate-500">{booking.guestName}</p>
          <p className="mt-1 break-words text-xs font-bold text-slate-500">{booking.guestEmail}</p>
        </div>
        <div className="grid gap-2">
          <BadgeDatPhong tone={MAU_TRANG_THAI_DAT_PHONG[booking.bookingStatus]}>{nhanDatPhong(booking.bookingStatus)}</BadgeDatPhong>
          <BadgeDatPhong tone={MAU_TRANG_THAI_THANH_TOAN[booking.paymentStatus]}>{nhanThanhToan(booking.paymentStatus)}</BadgeDatPhong>
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">{ghiChuHanhDong(booking)}</p>

      <section className="mt-5">
        <h4 className="text-sm font-black text-slate-950">Hành động quản lý</h4>
        <div className="mt-3 grid gap-2">
          {canManualDeposit ? (
            <button onClick={() => onPayment(booking.id, PHUONG_THUC_THANH_TOAN.COUNTER_DEPOSIT)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-black text-slate-700">
              Ghi nhận đã thu cọc
            </button>
          ) : null}
          {canManualFullPay ? (
            <button onClick={() => onPayment(booking.id, PHUONG_THUC_THANH_TOAN.ONLINE_FULL)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-black text-slate-700">
              Ghi nhận đã thanh toán đủ
            </button>
          ) : null}
          {canCheckIn ? (
            <button onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_IN, 'Admin check-in tại khách sạn')} className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-black text-sky-700">
              Check-in
            </button>
          ) : null}
          {canCheckOut ? (
            <button onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CHECKED_OUT, 'Admin check-out')} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-black text-emerald-700">
              Check-out
            </button>
          ) : null}
          {canCancelHold ? (
            <button onClick={() => onStatus(booking.id, TRANG_THAI_DAT_PHONG.CANCELLED, 'Admin hủy giữ chỗ chưa thanh toán')} className="rounded-lg border border-rose-200 bg-white px-3 py-2.5 text-sm font-black text-rose-700">
              Hủy giữ chỗ
            </button>
          ) : null}
          {!canManualDeposit && !canManualFullPay && !canCheckIn && !canCheckOut && !canCancelHold ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-500">
              Trạng thái hiện tại không cần thao tác tay.
            </div>
          ) : null}
        </div>
      </section>

      {refundRequest ? (
        <section className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-amber-900">Yêu cầu hủy / hoàn tiền</p>
              <p className="mt-1 text-xs font-bold text-amber-800">{refundRequest.code}</p>
            </div>
            <BadgeDatPhong tone={MAU_TRANG_THAI_HOAN_TIEN[refundRequest.status]}>{nhanHoanTien(refundRequest.status)}</BadgeDatPhong>
          </div>
          <div className="mt-3 grid gap-2 text-sm font-bold text-amber-900">
            <p>Đã thu: {dinhDangTien(refundRequest.paidAmount)}</p>
            <p>Phí hủy: {dinhDangTien(refundRequest.cancelFeeAmount)}</p>
            <p>Dự kiến hoàn: {dinhDangTien(refundRequest.refundAmount)}</p>
            {refundRequest.reason ? <p>Lý do: {refundRequest.reason}</p> : null}
          </div>
          {canApproveRefund ? (
            <>
              <textarea
                value={refundDecisionNote}
                onChange={(event) => setRefundDecisionNote(event.target.value)}
                rows={3}
                placeholder="Ghi chú khi duyệt / từ chối"
                className="mt-3 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-amber-400"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => onRefundDecision(refundRequest.id, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-black text-white">
                  Duyệt hủy / hoàn tiền
                </button>
                <button onClick={() => onRefundDecision(refundRequest.id, 'rejected')} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-black text-rose-700">
                  Từ chối yêu cầu
                </button>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      <section className="mt-5 grid grid-cols-2 gap-2">
        <DongThongTinChiTiet label="Khách sạn" value={booking.hotel_name} />
        <DongThongTinChiTiet label="Phòng" value={booking.room_name} />
        <DongThongTinChiTiet label="Nhận phòng" value={dinhDangNgay(booking.checkIn)} />
        <DongThongTinChiTiet label="Trả phòng" value={dinhDangNgay(booking.checkOut)} />
        <DongThongTinChiTiet label="Số khách" value={booking.guests} />
        <DongThongTinChiTiet label="Số phòng" value={booking.rooms} />
        <DongThongTinChiTiet label="Tổng tiền" value={dinhDangTien(booking.totalPrice)} />
        <DongThongTinChiTiet label="Còn lại" value={dinhDangTien(booking.remainingAmount)} />
      </section>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-black text-slate-950">Mốc chính</p>
        <div className="mt-3 grid gap-2 text-sm">
          {[
            ['Tạo đơn', booking.createdAt],
            ['Xác nhận', booking.confirmedAt],
            ['Thanh toán', booking.paidAt],
            ['Check-in', booking.checkedInAt],
            ['Check-out', booking.checkedOutAt],
            ['Hủy / no-show', booking.cancelledAt || booking.noShowAt],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-bold text-slate-600">{label}</span>
              <span className="text-right font-black text-slate-950">{dinhDangNgayGio(value)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-950">Ghi chú nội bộ</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-500" />
        </label>
        <button onClick={() => onSaveNote(booking.id)} className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700">
          Lưu ghi chú
        </button>
      </section>
    </aside>
  );
}
