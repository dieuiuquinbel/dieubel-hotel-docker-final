import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';
import { taoDuongDanDangNhapChuyenHuong } from '../../utils/duongDan';
import { laQuanTriVien } from '../../utils/phanQuyen';

function TuyenDuongBaoVe({ yeuCauAdmin = false, chanAdmin = false }) {
  const location = useLocation();
  const token = useKhoXacThuc((state) => state.token);
  const user = useKhoXacThuc((state) => state.user);
  const isAuthReady = useKhoXacThuc((state) => state.isAuthReady);

  if (!isAuthReady) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="surface-card flex min-h-[280px] items-center justify-center p-10">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
        </div>
      </main>
    );
  }

  if (!token) {
    const redirectPath = `${location.pathname}${location.search}`;
    return <Navigate to={taoDuongDanDangNhapChuyenHuong(redirectPath)} replace />;
  }

  if (chanAdmin && laQuanTriVien(user)) {
    return <Navigate to="/admin/overview" replace />;
  }

  if (yeuCauAdmin && !laQuanTriVien(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default TuyenDuongBaoVe;
