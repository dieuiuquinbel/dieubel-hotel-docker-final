// Chức năng: Khung layout chung cho toàn bộ trang quản trị.
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';

const NAV_GROUPS = [
  {
    title: 'Vận hành',
    items: [
      {
        to: '/admin/overview',
        label: 'Tổng quan',
        hint: 'Việc cần xử lý',
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zm0 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zm8 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2zm0 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2z" />
          </svg>
        ),
      },
      {
        to: '/admin/bookings',
        label: 'Đơn đặt phòng',
        hint: 'Duyệt và check-in',
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H7V3a1 1 0 0 0-1-1zM4 8h12v8H4V8zm2 3a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1zm0 3a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        to: '/admin/rooms',
        label: 'Quản lý phòng',
        hint: 'Kho phòng',
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M2 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7H2a1 1 0 0 1-1-1V4zm3 3v8h10V7H5zm1 2a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1zm0 3a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1z" />
          </svg>
        ),
      },
      {
        to: '/admin/operations',
        label: 'Khiếu nại',
        hint: 'Hoàn tiền, hỗ trợ',
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 2 0V9H9z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Dữ liệu',
    items: [
      {
        to: '/admin/customers',
        label: 'Khách hàng',
        hint: 'Hồ sơ và lịch sử',
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM17 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 0 0-1.5-4.33A5 5 0 0 1 19 16v1h-6.07zM6 11a5 5 0 0 1 5 5v1H1v-1a5 5 0 0 1 5-5z" />
          </svg>
        ),
      },
      {
        to: '/admin/revenue',
        label: 'Doanh thu',
        hint: 'Báo cáo tiền',
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5zm6-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7zm6-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4z" />
          </svg>
        ),
      },
      {
        to: '/admin/invoices',
        label: 'Hóa đơn',
        hint: 'Tra cứu file',
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 6a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Marketing',
    items: [
      {
        to: '/admin/marketing',
        label: 'Ưu đãi',
        hint: 'Voucher, thông báo',
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M5 5a3 3 0 0 1 5.998 0H14a1 1 0 0 1 .894 1.447l-6 12A1 1 0 0 1 8 19H4a1 1 0 0 1-.894-1.447l3.06-6.12A3.001 3.001 0 0 1 5 5zm3 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
];

function AdminLayout() {
  const navigate = useNavigate();
  const user = useKhoXacThuc((state) => state.user);
  const clearSession = useKhoXacThuc((state) => state.clearSession);

  const logout = () => {
    clearSession();
    navigate('/auth?mode=login', { replace: true });
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <main className="min-h-screen bg-[#f0f2f5] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">

        {/* SIDEBAR */}
        <aside className="border-r border-slate-200/80 bg-white shadow-sm">
          <div className="sticky top-0 flex min-h-screen flex-col">

            {/* Brand block */}
            <div className="border-b border-slate-100 px-4 py-4">
              <Link to="/admin/overview" className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}
                >
                  DB
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-slate-950">DieuBel Admin</span>
                  <span className="block truncate text-[11px] font-semibold text-slate-400">Control center</span>
                </span>
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="grid gap-5">
                {NAV_GROUPS.map((group) => (
                  <section key={group.title}>
                    <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      {group.title}
                    </p>
                    <div className="grid gap-0.5">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${
                              isActive
                                ? 'bg-slate-950 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <span className={`shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                                {item.icon}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold">{item.label}</span>
                                <span className="block truncate text-[11px] font-medium opacity-60">{item.hint}</span>
                              </span>
                              {isActive && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white opacity-70" />
                              )}
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </nav>

            {/* User block */}
            <div className="border-t border-slate-100 p-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{greeting}</p>
                <p className="mt-1.5 truncate text-sm font-black text-slate-950">
                  {user?.full_name || user?.username || 'Admin'}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                  {user?.email || 'admin@dieubel.local'}
                </p>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 active:scale-95"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h7a1 1 0 1 0 0-2H4V5h6a1 1 0 1 0 0-2H3zm11.707 4.293a1 1 0 0 1 0 1.414L13.414 10l1.293 1.293a1 1 0 0 1-1.414 1.414l-2-2a1 1 0 0 1 0-1.414l2-2a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M13 10a1 1 0 0 1 1-1h3a1 1 0 1 0 0-2h-3a3 3 0 0 0-3 3v1a1 1 0 1 0 2 0v-1z" clipRule="evenodd" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="min-w-0">
          <div className="p-4 sm:p-5 lg:p-6">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminLayout;
