// Chức năng: Form tạo tài khoản khách hàng mới từ trang quản trị (admin).
// Khối form tạo khách hàng trực tiếp tích hợp trong trang quản trị.
// Bản nâng cấp hỗ trợ các icon nhập liệu tinh tế, nút nhấn sinh động, hiệu ứng focus và spinner khi gửi dữ liệu.
function CustomerCreateForm({
  open,
  form,
  onToggle,
  onChange,
  onSubmit,
  isSubmitting,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">Dịch vụ quản trị</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">Quản lý tài khoản khách</h2>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white transition-all duration-150 shadow-sm ${
            open
              ? 'bg-slate-650 hover:bg-slate-750'
              : 'bg-sky-600 hover:bg-sky-700 shadow-sky-100'
          }`}
        >
          {open ? (
            <>
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Đóng Form
            </>
          ) : (
            <>
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Tạo khách hàng
            </>
          )}
        </button>
      </div>

      {open ? (
        <form
          onSubmit={onSubmit}
          className="mt-6 grid gap-5 rounded-2xl border border-slate-150 bg-slate-50/50 p-5 shadow-inner transition-all duration-300"
        >
          <div className="grid gap-4.5 xl:grid-cols-4">
            {/* Tên hiển thị */}
            <div className="space-y-1.5">
              <label htmlFor="create-full-name" className="text-xs font-extrabold text-slate-600">Tên hiển thị</label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  id="create-full-name"
                  value={form.full_name}
                  onChange={(event) => onChange('full_name', event.target.value)}
                  placeholder="Họ và tên khách"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="create-username" className="text-xs font-extrabold text-slate-600">Username *</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">@</span>
                <input
                  id="create-username"
                  value={form.username}
                  onChange={(event) => onChange('username', event.target.value)}
                  placeholder="tên_đăng_nhập"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="create-password" className="text-xs font-extrabold text-slate-600">Mật khẩu *</label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="create-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => onChange('password', event.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9.5 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label htmlFor="create-status" className="text-xs font-extrabold text-slate-600">Trạng thái</label>
              <div className="relative">
                <select
                  id="create-status"
                  value={form.status}
                  onChange={(event) => onChange('status', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 appearance-none"
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

          <div className="grid gap-4.5 xl:grid-cols-3 items-end">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="create-email" className="text-xs font-extrabold text-slate-600">Email</label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="create-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* SĐT */}
            <div className="space-y-1.5">
              <label htmlFor="create-phone" className="text-xs font-extrabold text-slate-600">Số điện thoại</label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input
                  id="create-phone"
                  value={form.phone}
                  onChange={(event) => onChange('phone', event.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full xl:w-auto min-w-[150px] rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-sky-700 shadow-sm shadow-sky-100 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Tạo tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default CustomerCreateForm;
