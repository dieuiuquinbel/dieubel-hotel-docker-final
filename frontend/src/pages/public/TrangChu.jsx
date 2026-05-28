// Chức năng: Trang chủ giới thiệu điểm đến, phòng nổi bật và voucher.
// Trang chủ dành cho khách hàng.
// File này điều phối trạng thái của hero, voucher, popup và dữ liệu phòng nổi bật; phần section lớn đã được tách ra component riêng.
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import BangMoiThanhVien from '../../components/layout/BangMoiThanhVien';
import { HopThoaiVoucher, PopupMoiDangNhap } from '../../components/public/home/HomeDialogs';
import {
  BoSuuTapSection,
  DanhGiaTinCaySection,
  DiemDenSection,
  FeaturedRoomsSection,
  HeroTrangChu,
  TimKiemGanDaySection,
  VoucherSection,
} from '../../components/public/home/HomeSections';
import {
  CAC_SLOT_DANH_GIA,
  SLIDE_HERO,
  SO_DANH_GIA_MOI_LUOT,
  THOI_GIAN_BAT_DAU_THOAT_DANH_GIA,
  THOI_GIAN_HIEN_TUNG_DANH_GIA,
  THOI_GIAN_THOAT_NHOM_DANH_GIA,
  TONG_NHOM_DANH_GIA,
} from '../../components/public/home/trangChuData';
import { ganThamSoTimKiem } from '../../components/public/home/trangChuHelpers';
import useTimKiemGanDay from '../../hooks/useTimKiemGanDay';
import { layPhongNoiBat } from '../../services/phongApi';
import { layDanhSachVoucherApi, luuVoucherApi } from '../../services/voucherApi';
import useKhoXacThuc from '../../store/khoXacThuc';
import { VOUCHER_KHUYEN_MAI, docQuaDaDoi, luuVoucherKhuyenMai } from '../../utils/diemThuong';

export default function TrangChu() {
  const navigate = useNavigate();
  const token = useKhoXacThuc((state) => state.token);
  const voucherMessageTimerRef = useRef(null);
  const { searches, addSearch, clearAll } = useTimKiemGanDay();

  const [activeHero, setActiveHero] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [showLoginOffer, setShowLoginOffer] = useState(false);
  const [showHopThoaiVoucher, setShowHopThoaiVoucher] = useState(false);
  const [savedCodes, setSavedCodes] = useState(() => docQuaDaDoi().map((reward) => reward.code));
  const [vouchers, setVouchers] = useState(VOUCHER_KHUYEN_MAI);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [reviewGroup, setReviewGroup] = useState(0);
  const [isReviewExiting, setIsReviewExiting] = useState(false);
  const [visibleReviewCount, setVisibleReviewCount] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-rooms'],
    queryFn: () => layPhongNoiBat(6),
  });

  const goToHero = (index) => {
    setActiveHero((index + SLIDE_HERO.length) % SLIDE_HERO.length);
  };

  useEffect(() => {
    if (isHeroPaused || showLoginOffer || showHopThoaiVoucher) return undefined;

    const timer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % SLIDE_HERO.length);
    }, 7500);

    return () => window.clearInterval(timer);
  }, [isHeroPaused, showLoginOffer, showHopThoaiVoucher]);

  useEffect(() => {
    setVisibleReviewCount(1);
    setIsReviewExiting(false);

    const revealTimers = CAC_SLOT_DANH_GIA.slice(1).map((slot) =>
      window.setTimeout(() => setVisibleReviewCount(slot + 1), slot * THOI_GIAN_HIEN_TUNG_DANH_GIA),
    );
    const exitTimer = window.setTimeout(() => setIsReviewExiting(true), THOI_GIAN_BAT_DAU_THOAT_DANH_GIA);
    const nextGroupTimer = window.setTimeout(() => {
      setVisibleReviewCount(1);
      setIsReviewExiting(false);
      setReviewGroup((current) => (current + 1) % TONG_NHOM_DANH_GIA);
    }, THOI_GIAN_BAT_DAU_THOAT_DANH_GIA + THOI_GIAN_THOAT_NHOM_DANH_GIA);

    return () => {
      revealTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(exitTimer);
      window.clearTimeout(nextGroupTimer);
    };
  }, [reviewGroup]);

  useEffect(() => {
    if (token || window.sessionStorage.getItem('dieubel_login_offer_closed') === 'true') {
      return;
    }

    const popupTimer = window.setTimeout(() => setShowLoginOffer(true), 450);
    return () => window.clearTimeout(popupTimer);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    layDanhSachVoucherApi()
      .then((nextVouchers) => {
        if (!cancelled && Array.isArray(nextVouchers) && nextVouchers.length) {
          setVouchers(nextVouchers);
        }
      })
      .catch(() => {
        if (!cancelled) setVouchers(VOUCHER_KHUYEN_MAI);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const refreshSavedCodes = () => {
      setSavedCodes(docQuaDaDoi().map((reward) => reward.code));
    };

    refreshSavedCodes();
    window.addEventListener('storage', refreshSavedCodes);
    window.addEventListener('focus', refreshSavedCodes);
    document.addEventListener('visibilitychange', refreshSavedCodes);
    return () => {
      window.removeEventListener('storage', refreshSavedCodes);
      window.removeEventListener('focus', refreshSavedCodes);
      document.removeEventListener('visibilitychange', refreshSavedCodes);
    };
  }, []);

  useEffect(() => {
    const overlayOpen = showHopThoaiVoucher || (showLoginOffer && !token);
    if (!overlayOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (showHopThoaiVoucher) {
        setShowHopThoaiVoucher(false);
        return;
      }
      window.sessionStorage.setItem('dieubel_login_offer_closed', 'true');
      setShowLoginOffer(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLoginOffer, showHopThoaiVoucher, token]);

  useEffect(() => {
    return () => {
      if (voucherMessageTimerRef.current) {
        window.clearTimeout(voucherMessageTimerRef.current);
      }
    };
  }, []);

  const handleSearch = (form = {}) => {
    addSearch(form);

    const params = new URLSearchParams();
    ganThamSoTimKiem(params, form);
    params.set('sort', 'popular');
    params.set('limit', '12');

    navigate(`/rooms?${params.toString()}`);
  };

  const closeLoginOffer = () => {
    window.sessionStorage.setItem('dieubel_login_offer_closed', 'true');
    setShowLoginOffer(false);
  };

  const goToAuthOffer = () => {
    window.sessionStorage.setItem('dieubel_login_offer_closed', 'true');
    navigate('/auth?mode=login&redirect=/');
  };

  const openHopThoaiVoucher = () => {
    setSavedCodes(docQuaDaDoi().map((reward) => reward.code));
    setShowHopThoaiVoucher(true);
  };

  const handleSaveVoucher = async (voucher) => {
    try {
      const saved = await luuVoucherApi(voucher.code);
      setSavedCodes(saved.map((reward) => reward.code));
    } catch {
      const next = luuVoucherKhuyenMai(voucher);
      setSavedCodes(next.map((reward) => reward.code));
    }

    setVoucherMessage('Đã lưu mã thành công, vui lòng kiểm tra trong kho voucher của bạn ở Page Tôi.');
    if (voucherMessageTimerRef.current) {
      window.clearTimeout(voucherMessageTimerRef.current);
    }
    voucherMessageTimerRef.current = window.setTimeout(() => setVoucherMessage(''), 3600);
  };

  return (
    <main>
      <PopupMoiDangNhap open={showLoginOffer && !token} onClose={closeLoginOffer} onAuth={goToAuthOffer} />
      <HopThoaiVoucher
        open={showHopThoaiVoucher}
        vouchers={vouchers}
        savedCodes={savedCodes}
        onClose={() => setShowHopThoaiVoucher(false)}
        onSave={handleSaveVoucher}
      />

      <HeroTrangChu
        activeHero={activeHero}
        isHeroPaused={isHeroPaused}
        setIsHeroPaused={setIsHeroPaused}
        showLoginOffer={showLoginOffer}
        showHopThoaiVoucher={showHopThoaiVoucher}
        goToHero={goToHero}
        handleSearch={handleSearch}
      />
      <BoSuuTapSection handleSearch={handleSearch} />
      <DanhGiaTinCaySection
        reviewGroup={reviewGroup}
        visibleReviewCount={visibleReviewCount}
        isReviewExiting={isReviewExiting}
      />
      <DiemDenSection navigate={navigate} handleSearch={handleSearch} />
      <VoucherSection
        vouchers={vouchers}
        savedCodes={savedCodes}
        openHopThoaiVoucher={openHopThoaiVoucher}
        handleSaveVoucher={handleSaveVoucher}
        voucherMessage={voucherMessage}
      />
      <TimKiemGanDaySection searches={searches} handleSearch={handleSearch} clearAll={clearAll} />
      <FeaturedRoomsSection navigate={navigate} isLoading={isLoading} isError={isError} data={data} />
      <BangMoiThanhVien className="mx-4 mb-12 sm:mx-6 xl:mx-auto xl:max-w-7xl" />
    </main>
  );
}
