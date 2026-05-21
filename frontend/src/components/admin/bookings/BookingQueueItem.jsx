// Thẻ đại diện cho một đơn trong hàng đợi công việc của quản lý.
import { dinhDangNgay, dinhDangTien } from '../../../utils/dinhDang';
import { MAU_TRANG_THAI_DAT_PHONG, MAU_TRANG_THAI_THANH_TOAN } from './bookingConstants';
import { nhanDatPhong, nhanThanhToan, tomTatHanhDong } from './bookingHelpers';
import { BadgeDatPhong } from './BookingShared';

export default function BookingQueueItem({ booking, selected, onSelect }) {
  const summary = tomTatHanhDong(booking);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border px-4 py-4 text-left transition ${
        selected
          ? 'border-sky-200 bg-sky-50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-black text-slate-950">{booking.id}</p>
          <p className="mt-1 text-sm font-bold text-slate-700">{booking.guestName}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{booking.hotel_name} · {booking.room_name}</p>
        </div>
        <div className="grid gap-2 justify-items-end">
          <BadgeDatPhong tone={MAU_TRANG_THAI_DAT_PHONG[booking.bookingStatus]}>{nhanDatPhong(booking.bookingStatus)}</BadgeDatPhong>
          <BadgeDatPhong tone={MAU_TRANG_THAI_THANH_TOAN[booking.paymentStatus]}>{nhanThanhToan(booking.paymentStatus)}</BadgeDatPhong>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_130px_160px]">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Cần làm</p>
          <p className={`mt-1 text-sm font-black ${summary.tone}`}>{summary.label}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{summary.hint}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Nhận - trả</p>
          <p className="mt-1 text-sm font-black text-slate-950">{dinhDangNgay(booking.checkIn)}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{dinhDangNgay(booking.checkOut)}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Thanh toán</p>
          <p className="mt-1 text-sm font-black text-brand-700">{dinhDangTien(booking.totalPrice)}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">Đã trả {dinhDangTien(booking.paidAmount)}</p>
        </div>
      </div>
    </button>
  );
}
