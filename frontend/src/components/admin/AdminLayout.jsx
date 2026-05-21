import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';

const NAV_GROUPS = [
  {
    title: 'Vận hành',
    items: [
      { to: '/admin/overview', label: 'Tổng quan', short: 'TQ', hint: 'Việc cần xử lý' },
      { to: '/admin/bookings', label: 'Đơn đặt phòng', short: 'ĐP', hint: 'Duyệt và check-in' },
      { to: '/admin/rooms', label: 'Quản lý phòng', short: 'PH', hint: 'Kho phòng' },
      { to: '/admin/operations', label: 'Khiếu nại', short: 'KN', hint: 'Hoàn tiền, hỗ trợ' },
    ],
  },
  {
    title: 'Dữ liệu',
    items: [
      { to: '/admin/customers', label: 'Khách hàng', short: 'KH', hint: 'Hồ sơ và lịch sử' },
      { to: '/admin/revenue', label: 'Doanh thu', short: 'DT', hint: 'Báo cáo tiền' },
      { to: '/admin/invoices', label: 'Hóa đơn', short: 'HĐ', hint: 'Tra cứu file' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { to: '/admin/marketing', label: 'Ưu đãi', short: 'ƯĐ', hint: 'Voucher, thông báo' },
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

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="sticky top-0 flex min-h-screen flex-col p-4">
            <Link to="/admin/overview" className="flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-50">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">DB</span>
              <span className="min-w-0">
                <span className="block truncate text-base font-black text-slate-950">DieuBel Admin</span>
                <span className="block truncate text-xs font-bold text-slate-500">Control center</span>
              </span>
            </Link>

            <nav className="mt-6 grid gap-6">
              {NAV_GROUPS.map((group) => (
                <section key={group.title}>
                  <p className="px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{group.title}</p>
                  <div className="mt-2 grid gap-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                            isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                          }`
                        }
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-current/10 text-[11px] font-black">{item.short}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black">{item.label}</span>
                          <span className="block truncate text-[11px] font-semibold opacity-70">{item.hint}</span>
                        </span>
                      </NavLink>
                    ))}
                  </div>
                </section>
              ))}
            </nav>

            <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Tài khoản</p>
              <p className="mt-2 truncate text-sm font-black text-slate-950">{user?.full_name || user?.username || 'Admin'}</p>
              <p className="mt-1 truncate text-xs font-bold text-slate-500">{user?.email || 'admin@dieubel.local'}</p>
              <button
                type="button"
                onClick={logout}
                className="mt-4 w-full rounded-lg border border-rose-200 bg-white px-3 py-2.5 text-xs font-black text-rose-700 transition hover:bg-rose-50"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

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
