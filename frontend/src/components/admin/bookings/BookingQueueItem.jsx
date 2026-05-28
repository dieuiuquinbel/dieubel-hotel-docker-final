// Chức năng: Hiển thị một dòng đơn trong hàng đợi quản lý đặt phòng.
// Thẻ đại diện cho một đơn trong hàng đợi công việc của quản lý — phiên bản nâng cấp.
import { dinhDangNgay, dinhDangTien } from '../../../utils/dinhDang';
import { MAU_TRANG_THAI_DAT_PHONG, MAU_TRANG_THAI_THANH_TOAN } from './bookingConstants';
import { nhanDatPhong, nhanThanhToan, tomTatHanhDong, laDonNhanPhongHomNay } from './bookingHelpers';
import { BadgeDatPhong } from './BookingShared';

export default function BookingQueueItem({ booking, selected, onSelect }) {
  const summary = tomTatHanhDong(booking);
  const isUrgent = laDonNhanPhongHomNay(booking)
    || booking.bookingStatus === 'pending'
    || booking.bookingStatus === 'holding'
    || booking.bookingStatus === 'cancel_requested';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border px-4 py-4 text-left transition-all duration-150 ${
        selected
          ? 'border-sky-300 bg-sky-50 shadow-sm'
          : isUrgent
            ? 'border-rose-200 bg-white hover:border-rose-300 hover:bg-rose-50'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {/* Top row: booking code + badges */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isUrgent && !selected ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
            ) : null}
            <p className="break-all font-mono text-xs font-black tracking-wide text-slate-950">
              {booking.bookingCode || booking.id}
            </p>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-700">{booking.guestName}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">{booking.hotel_name} · {booking.room_name}</p>
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

      {/* Bottom row: action needed + dates + money */}
      <div className="mt-3 grid gap-2 rounded-lg bg-slate-50 p-3 lg:grid-cols-[minmax(0,1fr)_120px_150px]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Cần làm</p>
          <p className={`mt-0.5 text-sm font-black ${summary.tone}`}>{summary.label}</p>
          {summary.hint ? (
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{summary.hint}</p>
          ) : null}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Nhận - trả</p>
          <p className="mt-0.5 text-sm font-bold text-slate-950">{dinhDangNgay(booking.checkIn)}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">{dinhDangNgay(booking.checkOut)}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Thanh toán</p>
          <p className="mt-0.5 text-sm font-black text-emerald-700">{dinhDangTien(booking.totalPrice)}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">Đã trả {dinhDangTien(booking.paidAmount)}</p>
        </div>
      </div>
    </button>
  );
}
