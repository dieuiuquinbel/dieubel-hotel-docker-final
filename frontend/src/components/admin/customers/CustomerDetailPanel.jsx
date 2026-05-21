// Panel chi tiết khách hàng ở cột phải của màn hình admin.
// Component này chỉ hiển thị form chỉnh sửa và lịch sử đặt gần đây của khách đang chọn.
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
}) {
  if (!customer) {
    return (
      <aside className="rounded-xl border border-slate-200 bg-white p-5 xl:sticky xl:top-24 xl:self-start">
        <p className="text-sm font-bold text-slate-500">Chọn một khách hàng để xem và chỉnh sửa.</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 xl:sticky xl:top-24 xl:self-start">
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-700">Chi tiết khách hàng</p>
          <h3 className="mt-2 text-xl font-black text-slate-950">{customer.full_name}</h3>
          <p className="mt-1 text-sm font-bold text-slate-500">ID #{customer.id}</p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">Tên hiển thị</span>
          <input
            value={form.full_name}
            onChange={(event) => onChange('full_name', event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">Username</span>
          <input
            value={form.username}
            onChange={(event) => onChange('username', event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">Số điện thoại</span>
          <input
            value={form.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">Trạng thái</span>
          <select
            value={form.status}
            onChange={(event) => onChange('status', event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:bg-slate-300"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-4">
          <button
            type="button"
            disabled={isTogglingStatus}
            onClick={onToggleStatus}
            className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            {customer.status === 'active' ? 'Khóa' : 'Mở khóa'}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onDelete}
            className="rounded-xl border border-rose-200 bg-white px-3 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50"
          >
            Xóa / khóa
          </button>
        </div>

        <section className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-950">Lịch sử đặt gần đây</p>
          <div className="mt-3 grid gap-2">
            {detail?.bookings?.length ? (
              detail.bookings.slice(0, 5).map((booking) => (
                <div key={booking.booking_code} className="rounded-lg bg-white p-3">
                  <p className="text-xs font-black text-slate-950">{booking.booking_code}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {booking.hotel_name} - {booking.booking_status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm font-bold text-slate-500">Chưa có booking.</p>
            )}
          </div>
        </section>
      </form>
    </aside>
  );
}

export default CustomerDetailPanel;
