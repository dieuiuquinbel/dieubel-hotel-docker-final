// Khối form tạo khách hàng trực tiếp trong trang quản trị.
// Component này chỉ nhận props và render form, không tự gọi API.
function CustomerCreateForm({
  open,
  form,
  onToggle,
  onChange,
  onSubmit,
  isSubmitting,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">Khách hàng</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">Quản lý tài khoản khách</h1>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
        >
          {open ? 'Đóng form tạo' : 'Tạo khách hàng'}
        </button>
      </div>

      {open ? (
        <form onSubmit={onSubmit} className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 xl:grid-cols-[1.1fr_1fr_1fr_220px]">
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">Tên hiển thị</span>
              <input
                value={form.full_name}
                onChange={(event) => onChange('full_name', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">Username *</span>
              <input
                value={form.username}
                onChange={(event) => onChange('username', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">Mật khẩu *</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => onChange('password', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">Trạng thái</span>
              <select
                value={form.status}
                onChange={(event) => onChange('status', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã khóa</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1fr_1fr_auto]">
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange('email', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">Số điện thoại</span>
              <input
                value={form.phone}
                onChange={(event) => onChange('phone', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-brand-500"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:bg-slate-300"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo khách'}
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default CustomerCreateForm;
