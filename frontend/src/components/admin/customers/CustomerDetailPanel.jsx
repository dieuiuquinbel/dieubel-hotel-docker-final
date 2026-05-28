// Chức năng: Panel xem chi tiết và chỉnh sửa thông tin khách hàng.
// Panel chi tiết khách hàng ở cột phải của màn hình admin.
// Bản nâng cấp với giao diện nhập liệu trực quan, avatar màu sắc và lịch sử đặt phòng dạng thẻ timeline chuyên nghiệp.
import { dinhDangTien, dinhDangNgay } from '../../../utils/dinhDang';
import {
  NHAN_TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_THANH_TOAN,
} from '../../../utils/lichSuDatPhong';
import {
  MAU_TRANG_THAI_DAT_PHONG,
  MAU_TRANG_THAI_THANH_TOAN,
} from '../bookings/bookingConstants';

function BookingHistorySkeleton() {
  return (
    <div className="grid gap-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-3.5 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-40 bg-slate-150 rounded" />
              <div className="h-3.5 w-28 bg-slate-100 rounded" />
            </div>
            <div className="space-y-1.5 flex flex-col items-end">
              <div className="h-5 w-16 bg-slate-200 rounded-full" />
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between">
            <div className="h-3.5 w-24 bg-slate-100 rounded" />
            <div className="h-4 w-16 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomerDetailPanel({
  customer,
  detail,
  form,
  onChange,
  onSubmit,
  onToggleStatus,
  onDelete,
  isSaving,
  isTogglingStatus,
  isDeleting,
  isLoadingDetail,
}) {
  if (!customer) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24 xl:self-start">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-extrabold text-slate-500">Chọn một khách hàng để xem chi tiết</p>
          <p className="mt-1 text-xs text-slate-400">Xem thông tin đặt phòng, quản lý trạng thái tài khoản hoặc thay đổi thông tin liên lạc.</p>
        </div>
      </aside>
    );
  }

  // Lấy chữ cái cuối cùng trong tên làm avatar
  const layTenVietTat = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const lastWord = parts[parts.length - 1];
    return lastWord ? lastWord.charAt(0).toUpperCase() : 'U';
  };

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24 xl:self-start">
      <form onSubmit={onSubmit} className="grid gap-5">
        {/* Profile Card Summary */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="relative">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-600 font-black text-white text-xl shadow-md shadow-sky-100">
              {layTenVietTat(customer.full_name)}
            </div>
            <span className={`absolute -bottom-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 border-white text-white text-[10px] shadow-sm ${
              customer.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}>
              {customer.status === 'active' ? (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-sky-600">Thông tin tài khoản</p>
            <h3 className="mt-0.5 truncate text-lg font-black text-slate-900 leading-snug">{customer.full_name}</h3>
            <p className="text-xs font-semibold text-slate-500">ID tài khoản: #{customer.id}</p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid gap-4.5">
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-slate-600">Tên hiển thị</span>
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                value={form.full_name}
                onChange={(event) => onChange('full_name', event.target.value)}
                placeholder="Họ và tên khách hàng"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-slate-600">Username</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">@</span>
              <input
                value={form.username}
                onChange={(event) => onChange('username', event.target.value)}
                placeholder="ten_dang_nhap"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-slate-600">Email</span>
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange('email', event.target.value)}
                placeholder="mail@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-slate-600">Số điện thoại</span>
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <input
                value={form.phone}
                onChange={(event) => onChange('phone', event.target.value)}
                placeholder="Chưa cập nhật số điện thoại"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-slate-600">Trạng thái tài khoản</span>
            <div className="relative">
              <select
                value={form.status}
                onChange={(event) => onChange('status', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 appearance-none"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã khóa</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3.5">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white transition duration-150 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 shadow-sm flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang lưu...
              </>
            ) : 'Lưu thay đổi'}
          </button>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={isTogglingStatus}
              onClick={onToggleStatus}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-250 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 hover:border-slate-350 disabled:opacity-50"
            >
              {customer.status === 'active' ? (
                <>
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Khóa TK
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Mở khóa
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onDelete}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2.5 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100/70 disabled:opacity-50"
            >
              <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa / Khóa
            </button>
          </div>
        </div>

        {/* History Area */}
        <section className="mt-2 border-t border-slate-100 pt-5">
          <h4 className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Lịch sử đặt gần đây</h4>
          <div className="mt-3">
            {isLoadingDetail ? (
              <BookingHistorySkeleton />
            ) : detail?.bookings?.length ? (
              <div className="grid gap-3.5">
                {detail.bookings.slice(0, 5).map((booking) => (
                  <div key={booking.booking_code} className="group relative rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-bold text-slate-800 tracking-tight bg-slate-50 px-1.5 py-0.5 rounded">
                          {booking.booking_code}
                        </span>
                        <h5 className="mt-2 text-sm font-extrabold text-slate-900 leading-tight truncate">
                          {booking.hotel_name}
                        </h5>
                        <p className="mt-0.5 text-xs text-slate-500 font-semibold truncate">
                          {booking.room_name}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${MAU_TRANG_THAI_DAT_PHONG[booking.booking_status] || 'bg-slate-150 text-slate-700'}`}>
                          {NHAN_TRANG_THAI_DAT_PHONG[booking.booking_status] || booking.booking_status}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${MAU_TRANG_THAI_THANH_TOAN[booking.payment_status] || 'bg-slate-150 text-slate-700'}`}>
                          {NHAN_TRANG_THAI_THANH_TOAN[booking.payment_status] || booking.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-50 pt-3 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {dinhDangNgay(booking.check_in_date)} - {dinhDangNgay(booking.check_out_date)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 block leading-none">Tổng tiền</span>
                        <span className="font-extrabold text-slate-900">{dinhDangTien(booking.total_price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center bg-slate-50/50">
                <svg className="h-8 w-8 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2 text-xs font-extrabold text-slate-500">Chưa có lịch sử đặt phòng</p>
              </div>
            )}
          </div>
        </section>
      </form>
    </aside>
  );
}

export default CustomerDetailPanel;
