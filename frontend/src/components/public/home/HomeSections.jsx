// Các section lớn của trang chủ, tách khỏi file trang để giảm độ dài và tăng khả năng đọc hiểu.
import ThePhong from '../../rooms/ThePhong';
import KhungThePhong from '../../rooms/KhungThePhong';
import ThanhTimKiem from '../../search/ThanhTimKiem';
import HomeReviewPopupCard from './HomeReviewPopupCard';
import { HinhVoucher, TheVoucher } from './HomeVoucherCard';
import {
  BINH_LUAN_POPUP,
  BO_SUU_TAP,
  CAC_SLOT_DANH_GIA,
  DANH_GIA,
  DIEM_DEN,
  DIEM_TIN_CAY,
  SLIDE_HERO,
  SO_DANH_GIA_MOI_LUOT,
  THONG_KE_TIN_CAY,
} from './trangChuData';

export function HeroTrangChu({
  activeHero,
  isHeroPaused,
  setIsHeroPaused,
  showLoginOffer,
  showHopThoaiVoucher,
  goToHero,
  handleSearch,
}) {
  return (
    <section
      className="relative bg-slate-950 text-white"
      onMouseEnter={() => setIsHeroPaused(true)}
      onMouseLeave={() => setIsHeroPaused(false)}
      onFocusCapture={() => setIsHeroPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsHeroPaused(false);
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ width: `${SLIDE_HERO.length * 100}%`, transform: `translateX(-${activeHero * (100 / SLIDE_HERO.length)}%)` }}
        >
          {SLIDE_HERO.map((slide) => (
            <div
              key={slide.image}
              className="h-full bg-cover bg-center"
              style={{
                width: `${100 / SLIDE_HERO.length}%`,
                backgroundImage: `linear-gradient(180deg, rgba(3,7,18,0.46) 0%, rgba(3,7,18,0.38) 48%, rgba(3,7,18,0.84) 100%), url(${slide.image})`,
              }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Ảnh trước"
        onClick={() => goToHero(activeHero - 1)}
        className="absolute left-3 top-[44%] z-20 flex h-16 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/28 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-md transition hover:-translate-x-0.5 hover:border-white/50 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20 sm:left-5 sm:h-20 sm:w-12 lg:left-6 lg:h-24 lg:w-14"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Ảnh tiếp theo"
        onClick={() => goToHero(activeHero + 1)}
        className="absolute right-3 top-[44%] z-20 flex h-16 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/28 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-md transition hover:translate-x-0.5 hover:border-white/50 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20 sm:right-5 sm:h-20 sm:w-12 lg:right-6 lg:h-24 lg:w-14"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-slate-950/80 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[660px] max-w-7xl flex-col items-center px-4 pb-36 pt-14 text-center sm:px-6 lg:min-h-[700px] lg:pt-16">
        <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
          {SLIDE_HERO[activeHero].label}
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-[64px]">
          {SLIDE_HERO[activeHero].title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-sky-50">{SLIDE_HERO[activeHero].description}</p>

        <div className="relative z-30 mt-10 w-full max-w-5xl">
          <ThanhTimKiem onSubmit={handleSearch} submitLabel="Tìm kiếm" />
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="font-semibold text-white/80">Phổ biến:</span>
            {[
              ['Ha Noi', 'Hà Nội'],
              ['Da Nang', 'Đà Nẵng'],
              ['Phu Quoc', 'Phú Quốc'],
              ['Hoi An', 'Hội An'],
              ['Nha Trang', 'Nha Trang'],
            ].map(([city, label]) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSearch({ city, guests: '2', adults: '2', children: '0', rooms: '1', availableOnly: true })}
                className="font-bold text-white underline-offset-4 hover:underline"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 flex items-center gap-2">
          {SLIDE_HERO.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Chọn ảnh ${index + 1}`}
              onClick={() => goToHero(index)}
              className={`h-2.5 rounded-full transition-all ${activeHero === index ? 'w-9 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-0 bg-gradient-to-r from-slate-950 via-brand-900 to-teal-800 px-4 py-8">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {THONG_KE_TIN_CAY.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/10 p-5 text-center shadow-2xl shadow-slate-950/20 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
            >
              <p className="text-4xl font-black text-white">{item.value}</p>
              <p className="mt-2 text-sm font-extrabold text-sky-50">{item.label}</p>
              <p className="mt-1 text-xs font-semibold text-sky-100/80">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BoSuuTapSection({ handleSearch }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Bộ sưu tập lưu trú</span>
          <h2 className="mt-3 section-title">Chọn nhanh theo kiểu chuyến đi</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {BO_SUU_TAP.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => handleSearch(item.query)}
            className="group relative min-h-[230px] overflow-hidden rounded-2xl bg-slate-950 text-left shadow-sm"
          >
            <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
            <div className="relative flex h-full min-h-[230px] flex-col justify-end p-5 text-white">
              <h3 className="text-2xl font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-sky-50">{item.detail}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function DanhGiaTinCaySection({ reviewGroup, visibleReviewCount, isReviewExiting }) {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_65px_-54px_rgba(15,23,42,0.45)] lg:grid-cols-[minmax(0,1.04fr)_minmax(340px,0.96fr)]">
          <div className="review-stream-panel relative h-full overflow-hidden bg-slate-950 p-5 text-white sm:p-6">
            <div className="relative z-10 max-w-xl">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold text-white/90">
                Đánh giá khách hàng
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Khách nói gì sau khi đặt phòng</h2>
              <p className="mt-2 max-w-lg text-sm leading-7 text-white/72">
                Các phản hồi được đặt cạnh những ưu điểm chính để khách mới hiểu vì sao DieuBel được chọn nhiều hơn.
              </p>
            </div>

            <div className="review-popup-stage relative z-10 mt-5 h-[420px] overflow-hidden sm:h-[448px] lg:h-[432px]">
              {CAC_SLOT_DANH_GIA.map((slot) => {
                const review = BINH_LUAN_POPUP[reviewGroup * SO_DANH_GIA_MOI_LUOT + slot];
                if (!review) return null;

                return (
                  <div key={slot} className="review-popup-slot">
                    {slot < visibleReviewCount ? (
                      <HomeReviewPopupCard
                        key={`${review.name}-${reviewGroup}`}
                        review={review}
                        isExiting={isReviewExiting}
                        exitDirection={slot % 2 === 0 ? 'left' : 'right'}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="bg-gradient-to-br from-white via-slate-50 to-brand-50/60 p-5 sm:p-6">
            <span className="eyebrow">Vì sao chọn DieuBel</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Đặt phòng nhanh, thông tin rõ ràng</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              DieuBel giúp khách so sánh chỗ ở, kiểm tra giá và hoàn tất đặt phòng trong vài bước. Mọi thông tin cần thiết đều được trình bày rõ trước khi thanh toán.
            </p>

            <div className="mt-5 grid gap-3">
              {DIEM_TIN_CAY.map((point, index) => (
                <article key={point.title} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-base font-black text-slate-950">{point.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{point.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function DiemDenSection({ navigate, handleSearch }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Điểm đến nổi bật</span>
          <h2 className="mt-3 section-title">Gợi ý theo điểm đến</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/rooms?sort=popular&limit=12')}
          className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-bold text-brand-700 transition hover:bg-sky-50"
        >
          Xem toàn bộ
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DIEM_DEN.map((item) => (
          <button
            key={item.city}
            type="button"
            onClick={() => handleSearch({ city: item.city, guests: '2', adults: '2', rooms: '1', availableOnly: true })}
            className="group relative min-h-[250px] overflow-hidden rounded-2xl bg-slate-900 text-left shadow-sm"
          >
            <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            <div className="relative flex h-full min-h-[250px] flex-col justify-end p-5 text-white">
              <p className="text-sm font-bold text-sky-100">Việt Nam</p>
              <h3 className="mt-2 text-2xl font-black">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-sky-50">{item.note}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function VoucherSection({ vouchers, savedCodes, openHopThoaiVoucher, handleSaveVoucher, voucherMessage }) {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Ưu đãi</span>
            <h2 className="mt-3 section-title">Khuyến mãi chỗ ở</h2>
          </div>
          <button
            type="button"
            onClick={openHopThoaiVoucher}
            className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-black text-brand-700 transition hover:bg-sky-50"
          >
            Xem tất cả
          </button>
        </div>

        <div className="mt-6 flex gap-5 overflow-x-auto pb-3">
          {vouchers.slice(0, 5).map((voucher) => (
            <button
              key={voucher.id}
              type="button"
              onClick={openHopThoaiVoucher}
              className="group min-w-[290px] text-left sm:min-w-[360px]"
            >
              <HinhVoucher voucher={voucher} className="transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl" />
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {vouchers.slice(0, 3).map((voucher) => (
            <TheVoucher
              key={voucher.id}
              voucher={voucher}
              compact
              isSaved={savedCodes.includes(voucher.code)}
              onSave={handleSaveVoucher}
            />
          ))}
        </div>
        {voucherMessage ? (
          <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{voucherMessage}</p>
        ) : null}
      </div>
    </section>
  );
}

export function TimKiemGanDaySection({ searches, handleSearch, clearAll }) {
  if (!searches.length) return null;

  return (
    <section className="bg-sky-50/70">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="eyebrow">Tìm kiếm gần đây</span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
              Tiếp tục tiêu chí bạn vừa tìm
            </h2>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-brand-500 hover:text-brand-700"
          >
            Xóa lịch sử
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {searches.slice(0, 3).map((search) => (
            <button
              key={search.id}
              type="button"
              onClick={() => handleSearch(search)}
              className="rounded-2xl border border-sky-100 bg-white p-4 text-left transition hover:border-brand-500"
            >
              <p className="text-sm font-bold text-brand-700">{search.city || 'Mọi điểm đến'}</p>
              <p className="mt-2 text-base font-extrabold text-slate-950">
                {search.guests || 2} khách · {search.rooms || 1} phòng
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {search.checkIn && search.checkOut ? `${search.checkIn} - ${search.checkOut}` : 'Lọc theo nhu cầu'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedRoomsSection({ navigate, isLoading, isError, data }) {
  return (
    <section id="featured" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Được yêu thích</span>
          <h2 className="mt-3 section-title">Khách sạn được yêu thích</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/rooms?sort=rating_desc&availableOnly=true&limit=12')}
          className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700"
        >
          Xem toàn bộ khách sạn
        </button>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <KhungThePhong key={`featured-skeleton-${index}`} compact />
          ))}
        </div>
      ) : isError ? (
        <div className="surface-card mt-8 p-6 text-sm leading-7 text-slate-600">
          Không tải được danh sách nổi bật. Kiểm tra backend rồi tải lại trang.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {data?.slice(0, 6).map((room) => <ThePhong key={room.id} room={room} layout="vertical" />)}
        </div>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DANH_GIA.slice(0, 4).map((item) => (
          <article key={`${item.name}-${item.trip}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-black text-slate-950">{item.name}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{item.trip}</p>
              </div>
              <span className="rounded-xl bg-brand-600 px-3 py-1.5 text-sm font-black text-white">{item.score}</span>
            </div>
            <p className="mt-3 text-sm font-black text-brand-700">{item.tag}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
