// Chức năng: Header và điều hướng chính cho trang khách hàng.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';
import { taoDuongDanDangNhapChuyenHuong, taoDuongDanDangKyChuyenHuong } from '../../utils/duongDan';

function DauTrang() {
  const location = useLocation();
  const user = useKhoXacThuc((state) => state.user);
  const previousUserId = useRef(user?.id || null);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const authRedirect = new URLSearchParams(location.search).get('redirect');
  const currentPath = location.pathname === '/auth' ? authRedirect || '/' : `${location.pathname}${location.search}`;
  const firstName = user?.full_name?.split(' ').at(-1) || 'bạn';

  useEffect(() => {
    if (user?.id && previousUserId.current !== user.id) {
      setWelcomeUser(user);
      const timer = window.setTimeout(() => setWelcomeUser(null), 3200);
      previousUserId.current = user.id;
      return () => window.clearTimeout(timer);
    }

    if (!user) {
      previousUserId.current = null;
    }

    return undefined;
  }, [user]);

  const navClass = ({ isActive }) =>
    `border-b-2 px-2 py-5 text-[15px] font-semibold transition ${
      isActive ? 'border-[#222222] text-[#222222]' : 'border-transparent text-[#6a6a6a] hover:text-[#222222]'
    }`;

  return (
    <>
      <header className="premium-header">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="premium-logo">DB</div>
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-normal text-brand-600">DieuBel</p>
              <p className="hidden truncate text-xs font-normal text-[#6a6a6a] sm:block">Căn hộ, khách sạn, resort</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm lg:flex">
            <NavLink to="/" className={navClass}>
              Trang chủ
            </NavLink>
            <NavLink to="/rooms" className={navClass}>
              Tìm chỗ ở
            </NavLink>
            {user ? (
              <>
                <NavLink to="/my-bookings" className={navClass}>
                  Đặt chỗ của tôi
                </NavLink>
                <NavLink to="/history" className={navClass}>
                  Lịch sử
                </NavLink>
                <NavLink to="/me" className={navClass}>
                  Tôi
                </NavLink>
              </>
            ) : null}
          </nav>

          {user ? (
            <Link
              to="/me"
              className="rounded-full border border-[#dddddd] bg-white px-4 py-2 text-right transition hover:border-[#222222]"
            >
              <p className="text-xs font-medium text-[#6a6a6a]">Đã đăng nhập</p>
              <p className="text-sm font-semibold text-[#222222]">Xin chào, {firstName}</p>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={taoDuongDanDangNhapChuyenHuong(currentPath)}
                className="rounded-lg border border-[#222222] bg-white px-5 py-3 text-sm font-medium text-[#222222] transition hover:bg-[#f7f7f7]"
              >
                Đăng nhập
              </Link>
              <Link
                to={taoDuongDanDangKyChuyenHuong(currentPath)}
                className="hidden rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700 sm:inline-flex"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      {welcomeUser ? (
        <div className="fixed right-4 top-24 z-[80] max-w-sm rounded-[14px] border border-[#dddddd] bg-white p-4 shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
          <p className="text-sm font-semibold text-brand-600">Chào mừng</p>
          <p className="mt-1 text-base font-semibold text-[#222222]">
            Chào mừng {welcomeUser.full_name} quay trở lại DieuBel!
          </p>
          <button
            type="button"
            onClick={() => setWelcomeUser(null)}
            className="mt-3 rounded-lg border border-[#dddddd] px-3 py-2 text-xs font-medium text-[#222222] transition hover:border-[#222222]"
          >
            Đóng
          </button>
        </div>
      ) : null}
    </>
  );
}

export default DauTrang;
