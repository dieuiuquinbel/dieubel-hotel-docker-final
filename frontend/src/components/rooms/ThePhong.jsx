import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';
import { dinhDangTien } from '../../utils/dinhDang';
import { taoDuongDanDatPhong, taoDuongDanDangNhapChuyenHuong } from '../../utils/duongDan';
import { resolveMediaUrl } from '../../utils/media';
import { layThongTinTinhTrangPhong } from '../../utils/tinhTrangPhong';
import { laPhongYeuThich, daoTrangThaiPhongYeuThich } from '../../utils/lichSuXemPhong';

const NHAN_LOAI_PHONG = {
  standard: 'Tiêu chuẩn',
  superior: 'Superior',
  deluxe: 'Deluxe',
  suite: 'Suite',
  family: 'Gia đình',
};

const NHAN_TIEN_NGHI = {
  wifi: 'Wi-Fi',
  air_conditioner: 'Điều hòa',
  breakfast: 'Bữa sáng',
  pool: 'Hồ bơi',
  parking: 'Bãi đỗ xe',
  balcony: 'Ban công',
};

function dinhDangTienNghi(amenity) {
  return NHAN_TIEN_NGHI[amenity] || amenity.replaceAll('_', ' ');
}

function dinhDangDiem(value) {
  const rating = Number(value || 0);
  return rating ? rating.toFixed(1) : '0.0';
}

function NutYeuThich({ room }) {
  const [favorite, setFavorite] = useState(() => laPhongYeuThich(room.id));

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = daoTrangThaiPhongYeuThich(room);
        setFavorite(next.some((item) => String(item.id) === String(room.id)));
      }}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        favorite
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-[#dddddd] bg-white text-[#222222] hover:border-brand-600 hover:text-brand-600'
      }`}
      aria-label={favorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
    >
      {favorite ? 'Yêu thích' : 'Lưu'}
    </button>
  );
}

function TheTienNghi({ room, amenities }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <span className="rounded-full border border-[#dddddd] bg-white px-3 py-1 text-xs font-medium text-[#222222]">
        {NHAN_LOAI_PHONG[room.room_type] || room.room_type}
      </span>
      {amenities.map((amenity) => (
        <span key={`${room.id}-${amenity}`} className="rounded-full bg-[#f7f7f7] px-3 py-1 text-xs font-medium text-[#6a6a6a]">
          {dinhDangTienNghi(amenity)}
        </span>
      ))}
    </div>
  );
}

function ThePhong({ room, layout = 'horizontal' }) {
  const navigate = useNavigate();
  const token = useKhoXacThuc((state) => state.token);
  const availability = layThongTinTinhTrangPhong(room.inventory_count);
  const amenities = room.amenities?.slice(0, layout === 'horizontal' ? 5 : 4) || [];
  const bookingPath = token ? taoDuongDanDatPhong(room.id) : taoDuongDanDangNhapChuyenHuong(taoDuongDanDatPhong(room.id));
  const canBook = Number(room.inventory_count) > 0;
  const detailPath = `/rooms/${room.id}`;

  const openDetail = () => {
    navigate(detailPath);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetail();
    }
  };

  if (layout === 'vertical') {
    return (
      <article
        role="link"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={handleCardKeyDown}
        className="subtle-card flex h-full cursor-pointer flex-col overflow-hidden focus:outline-none focus:ring-4 focus:ring-sky-100"
      >
        <div className="relative h-56 overflow-hidden bg-[#f7f7f7]">
          <img
            src={resolveMediaUrl(room.image_url)}
            alt={`${room.hotel_name} ${room.room_name}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${availability.lopHuyHieu}`}>
            {availability.label}
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#222222] shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
            {dinhDangDiem(room.rating_avg)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-normal text-[#6a6a6a]">{room.city}</p>
              <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 tracking-normal text-[#222222]">{room.hotel_name}</h3>
              <p className="mt-1 text-sm font-normal text-[#6a6a6a]">{room.room_name}</p>
            </div>
            <NutYeuThich room={room} />
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#3f3f3f]">{room.description}</p>
          <TheTienNghi room={room} amenities={amenities} />

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <p className="text-xs font-normal text-[#6a6a6a]">Giá mỗi đêm</p>
              <p className="mt-1 text-lg font-semibold text-[#222222]">{dinhDangTien(room.price_per_night)}</p>
              <p className="text-xs text-[#6a6a6a]">Tối đa {room.max_guests || 2} khách</p>
            </div>
            <Link
              to={detailPath}
              onClick={(event) => event.stopPropagation()}
              className="rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={handleCardKeyDown}
      className="subtle-card grid cursor-pointer overflow-hidden bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 lg:grid-cols-[300px_minmax(0,1fr)_210px]"
    >
      <div className="relative min-h-[250px] overflow-hidden bg-[#f7f7f7]">
        <img
          src={resolveMediaUrl(room.image_url)}
          alt={`${room.hotel_name} ${room.room_name}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${availability.lopHuyHieu}`}>
          {availability.label}
        </span>
      </div>

      <div className="min-w-0 p-5 lg:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#dddddd] bg-white px-3 py-1 text-xs font-medium text-[#222222]">
            {NHAN_LOAI_PHONG[room.room_type] || room.room_type}
          </span>
          {room.free_cancellation ? (
            <span className="rounded-full bg-[#f7f7f7] px-3 py-1 text-xs font-medium text-[#222222]">Hủy miễn phí</span>
          ) : null}
          {room.breakfast_included ? (
            <span className="rounded-full bg-[#f7f7f7] px-3 py-1 text-xs font-medium text-[#222222]">Bữa sáng</span>
          ) : null}
          <NutYeuThich room={room} />
        </div>

        <h3 className="mt-4 text-[22px] font-semibold tracking-normal text-[#222222]">{room.hotel_name}</h3>
        <p className="mt-1 text-sm font-medium text-[#3f3f3f]">{room.room_name}</p>
        <p className="mt-2 line-clamp-1 text-sm font-normal text-[#6a6a6a]">{room.address}</p>
        <p className="mt-4 line-clamp-2 text-sm leading-7 text-[#3f3f3f]">{room.description}</p>
        <TheTienNghi room={room} amenities={amenities} />
      </div>

      <div className="flex flex-col justify-between border-t border-[#dddddd] bg-white p-5 lg:border-l lg:border-t-0">
        <div className="flex items-start justify-between gap-4 lg:block">
          <div className="rounded-[14px] border border-[#dddddd] bg-white px-4 py-3 text-[#222222]">
            <p className="text-xs font-medium text-[#6a6a6a]">Đánh giá</p>
            <p className="mt-1 text-3xl font-bold">{dinhDangDiem(room.rating_avg)}</p>
            <p className="mt-1 text-xs text-[#6a6a6a]">{room.total_reviews} lượt đánh giá</p>
          </div>
          <div className="text-right lg:mt-5 lg:text-left">
            <p className="text-xs font-normal text-[#6a6a6a]">Giá mỗi đêm</p>
            <p className="mt-1 text-xl font-semibold tracking-normal text-[#222222]">{dinhDangTien(room.price_per_night)}</p>
            <p className="mt-1 text-sm text-[#6a6a6a]">Tối đa {room.max_guests || 2} khách</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <p className={`text-sm font-semibold leading-6 ${availability.textClass}`}>{availability.description(room.inventory_count)}</p>
          <Link
            to={detailPath}
            onClick={(event) => event.stopPropagation()}
            className="rounded-lg border border-[#222222] bg-white px-4 py-3 text-center text-sm font-medium text-[#222222] transition hover:bg-[#f7f7f7]"
          >
            Xem chi tiết
          </Link>
          <Link
            to={canBook ? bookingPath : `/rooms/${room.id}`}
            onClick={(event) => event.stopPropagation()}
            className={`rounded-lg px-4 py-3 text-center text-sm font-medium text-white transition ${
              canBook ? 'bg-brand-600 hover:bg-brand-700' : 'cursor-not-allowed bg-[#ffd1da]'
            }`}
          >
            {canBook ? (token ? 'Đặt ngay' : 'Đăng nhập đặt') : 'Hết phòng'}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ThePhong;
