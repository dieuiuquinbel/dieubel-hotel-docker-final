// Chức năng: Khai báo route, layout chính và đồng bộ phiên đăng nhập.
// Bộ điều phối chính của frontend.
// File này khai báo route, gắn layout khách hàng/admin và đồng bộ phiên đăng nhập.
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import TuyenDuongBaoVe from '../components/auth/TuyenDuongBaoVe';
import AdminLayout from '../components/admin/AdminLayout';
import ChatbotNoi from '../components/chatbot/ChatbotNoi';
import ChanTrang from '../components/layout/ChanTrang';
import DauTrang from '../components/layout/DauTrang';
import BoThongBaoToanCuc from '../components/layout/BoThongBaoToanCuc';
import { layNguoiDungHienTai } from '../services/xacThucApi';
import useKhoXacThuc from '../store/khoXacThuc';
import { laQuanTriVien } from '../utils/phanQuyen';
const TrangChu = lazy(() => import('../pages/public/TrangChu'));
const DanhSachPhong = lazy(() => import('../pages/rooms/DanhSachPhong'));
const ChiTietPhong = lazy(() => import('../pages/rooms/ChiTietPhong'));
const LichSu = lazy(() => import('../pages/account/LichSu'));
const DangNhapDangKy = lazy(() => import('../pages/auth/DangNhapDangKy'));
const DatPhong = lazy(() => import('../pages/bookings/DatPhong'));
const DatPhongCuaToi = lazy(() => import('../pages/bookings/DatPhongCuaToi'));
const TaiKhoan = lazy(() => import('../pages/account/TaiKhoan'));
const QuanLyDatPhong = lazy(() => import('../pages/admin/QuanLyDatPhong'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers'));
const AdminInvoices = lazy(() => import('../pages/admin/AdminInvoices'));
const AdminOperations = lazy(() => import('../pages/admin/AdminOperations'));
const AdminRooms = lazy(() => import('../pages/admin/AdminRooms'));
const AdminRevenue = lazy(() => import('../pages/admin/AdminRevenue'));
const AdminMarketing = lazy(() => import('../pages/admin/AdminMarketing'));
const QuetCheckIn = lazy(() => import('../pages/bookings/QuetCheckIn'));

function CuonLenDauTrang() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    const timer = window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}

function DangTaiTrang() {
  return (
    <main className="flex min-h-[55vh] flex-1 items-center justify-center bg-slate-50 px-4">
      <div className="rounded-xl border border-sky-100 bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-sm">
        Đang tải...
      </div>
    </main>
  );
}

function NutCuonTrangNoi() {
  const holdTimerRef = useRef(null);
  const holdDelayRef = useRef(null);
  const didHoldRef = useRef(false);
  const [isNearBottom, setIsNearBottom] = useState(false);

  const stopHoldScroll = () => {
    if (holdDelayRef.current) {
      window.clearTimeout(holdDelayRef.current);
      holdDelayRef.current = null;
    }

    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const startHoldScroll = (direction) => {
    stopHoldScroll();
    didHoldRef.current = false;
    holdDelayRef.current = window.setTimeout(() => {
      didHoldRef.current = true;
      holdTimerRef.current = window.setInterval(() => {
        window.scrollBy({ top: direction * 5, left: 0, behavior: 'auto' });
      }, 32);
    }, 180);
  };

  const handlePointerUp = () => {
    stopHoldScroll();
  };

  useEffect(() => {
    const updateScrollState = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      setIsNearBottom(scrollBottom >= document.documentElement.scrollHeight - 260);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      stopHoldScroll();
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const direction = isNearBottom ? -1 : 1;
  const label = isNearBottom ? 'Lên đầu trang' : 'Xuống cuối trang';
  const handleClick = () => {
    if (didHoldRef.current) {
      didHoldRef.current = false;
      return;
    }

    window.scrollTo({
      top: isNearBottom ? 0 : document.documentElement.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  };

  const icon = isNearBottom ? (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M5 5l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleClick}
      onPointerDown={() => startHoldScroll(direction)}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="fixed bottom-[116px] right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-sky-100 bg-white/95 text-[#0f5d82] shadow-md shadow-slate-900/10 backdrop-blur transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100"
    >
      {icon}
    </button>
  );
}

function UngDung() {
  const location = useLocation();
  const token = useKhoXacThuc((state) => state.token);
  const user = useKhoXacThuc((state) => state.user);
  const setUser = useKhoXacThuc((state) => state.setUser);
  const clearSession = useKhoXacThuc((state) => state.clearSession);
  const markReady = useKhoXacThuc((state) => state.markReady);
  const markPending = useKhoXacThuc((state) => state.markPending);

  const authQuery = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: layNguoiDungHienTai,
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (token) {
      markPending();
      return;
    }

    markReady();
  }, [token, markPending, markReady]);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (authQuery.isSuccess) {
      if (!user || user.id !== authQuery.data.id) {
        setUser(authQuery.data);
      }
      markReady();
      return;
    }

    if (authQuery.isError) {
      clearSession();
    }
  }, [authQuery.data, authQuery.isError, authQuery.isSuccess, clearSession, markReady, setUser, token, user]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminUser = laQuanTriVien(user);
  const isAdminExperience = isAdminRoute || isAdminUser;
  const customerPage = (element) => (isAdminUser ? <Navigate to="/admin/overview" replace /> : element);

  return (
    <div className="flex min-h-screen flex-col text-slate-900">
      <CuonLenDauTrang />
      <BoThongBaoToanCuc />
      {!isAdminExperience ? <DauTrang /> : null}
      <Suspense fallback={<DangTaiTrang />}>
        <Routes>
          <Route path="/" element={customerPage(<TrangChu />)} />
          <Route path="/rooms" element={customerPage(<DanhSachPhong />)} />
          <Route path="/rooms/:roomId" element={customerPage(<ChiTietPhong />)} />
          <Route path="/history" element={customerPage(<LichSu />)} />
          <Route path="/auth" element={<DangNhapDangKy />} />
          <Route path="/checkin" element={<QuetCheckIn />} />
          <Route element={<TuyenDuongBaoVe chanAdmin />}>
            <Route path="/booking" element={<DatPhong />} />
            <Route path="/my-bookings" element={<DatPhongCuaToi />} />
            <Route path="/me" element={<TaiKhoan />} />
          </Route>
          <Route element={<TuyenDuongBaoVe yeuCauAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<AdminDashboard />} />
              <Route path="bookings" element={<QuanLyDatPhong />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="operations" element={<AdminOperations />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="marketing" element={<AdminMarketing />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {!isAdminExperience ? <NutCuonTrangNoi /> : null}
      {!isAdminExperience ? <ChatbotNoi /> : null}
      {!isAdminExperience ? <ChanTrang /> : null}
    </div>
  );
}

export default UngDung;
