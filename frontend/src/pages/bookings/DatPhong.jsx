// Trang tao dat phong: chon ngay, so khach, dich vu them va gui yeu cau giu cho.
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { layPhongTheoId } from '../../services/phongApi';
import useKhoXacThuc from '../../store/khoXacThuc';
import {
  KIEU_DAT_PHONG,
  NHAN_KIEU_DAT_PHONG,
  KHUNG_GIO_THUE_NGAY,
  tinhTienPhong,
} from '../../utils/lichSuDatPhong';
import { chuyenNgayHienThiSangIso, dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';
import { congDiemThuong } from '../../utils/diemThuong';
import { resolveMediaUrl } from '../../utils/media';
import { taoDatPhong } from '../../services/datPhongApi';

const DICH_VU_THEM = [
  {
    id: 'breakfast',
    title: 'Bữa sáng buffet',
    description: 'Thêm bữa sáng cho toàn bộ khách trong phòng.',
    priceValue: 120000,
  },
  {
    id: 'airport-transfer',
    title: 'Đưa đón sân bay',
    description: 'Phù hợp cho khách đến muộn hoặc gia đình có trẻ nhỏ.',
    priceValue: 350000,
  },
  {
    id: 'early-checkin',
    title: 'Check-in sớm',
    description: 'Tối ưu cho chuyến công tác hoặc lịch trình ngắn ngày.',
    priceValue: 180000,
  },
  {
    id: 'late-checkout',
    title: 'Trả phòng muộn',
    description: 'Giữ phòng thêm vài giờ để lịch trình thoải mái hơn.',
    priceValue: 220000,
  },
  {
    id: 'extra-bed',
    title: 'Giường phụ',
    description: 'Thêm một giường phụ cho gia đình hoặc nhóm bạn.',
    priceValue: 280000,
  },
  {
    id: 'room-decoration',
    title: 'Trang trí phòng',
    description: 'Chuẩn bị hoa, bóng và set trang trí cho dịp đặc biệt.',
    priceValue: 450000,
  },
  {
    id: 'laundry',
    title: 'Giặt ủi nhanh',
    description: 'Nhận và trả đồ trong ngày cho khách lưu trú.',
    priceValue: 150000,
  },
  {
    id: 'spa',
    title: 'Gói spa thư giãn',
    description: 'Massage thư giãn 60 phút tại khu spa của khách sạn.',
    priceValue: 520000,
  },
  {
    id: 'dinner',
    title: 'Bữa tối set menu',
    description: 'Set dinner tại nhà hàng khách sạn cho 2 người.',
    priceValue: 680000,
  },
];

function thanhIsoNoiDia(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isoHomNay() {
  return thanhIsoNoiDia(new Date());
}

function congNgayIso(days, fromISO = isoHomNay()) {
  const [year, month, day] = fromISO.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return thanhIsoNoiDia(date);
}

function chuanHoaNgayBanDau(checkInParam, checkOutParam, bookingType) {
  const today = isoHomNay();
  const checkIn = checkInParam && checkInParam >= today ? checkInParam : today;

  if (bookingType === KIEU_DAT_PHONG.DAY_USE) {
    return { checkIn, checkOut: checkIn };
  }

  const minCheckOut = congNgayIso(1, checkIn);
  const checkOut = checkOutParam && checkOutParam >= minCheckOut ? checkOutParam : minCheckOut;
  return { checkIn, checkOut };
}

function TruongSo({ label, value, onChange, min, max }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none"
      />
    </label>
  );
}

function TruongNgay({ label, value, onChange, min, disabled = false }) {
  const [draft, setDraft] = useState(dinhDangNgay(value));

  useEffect(() => {
    setDraft(dinhDangNgay(value));
  }, [value]);

  const commitDraft = (nextValue) => {
    const nextIso = chuyenNgayHienThiSangIso(nextValue);
    if (nextIso && (!min || nextIso >= min)) {
      onChange(nextIso);
      return true;
    }

    return false;
  };

  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/yy"
        value={draft}
        disabled={disabled}
        onChange={(event) => {
          setDraft(event.target.value);
          commitDraft(event.target.value);
        }}
        onBlur={() => {
          if (!commitDraft(draft)) setDraft(dinhDangNgay(value));
        }}
        className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
  );
}

function TrangThaiTrong({ title, actionLabel }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="surface-card p-8 text-center">
        <p className="eyebrow">Đặt phòng</p>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
        <Link to="/rooms" className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700">
          {actionLabel}
        </Link>
      </div>
    </main>
  );
}

function DatPhong() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const user = useKhoXacThuc((state) => state.user);
  const initialBookingType = searchParams.get('bookingType') === KIEU_DAT_PHONG.DAY_USE ? KIEU_DAT_PHONG.DAY_USE : KIEU_DAT_PHONG.OVERNIGHT;
  const initialDates = chuanHoaNgayBanDau(searchParams.get('checkIn'), searchParams.get('checkOut'), initialBookingType);
  const [bookingType, setBookingType] = useState(initialBookingType);
  const [checkIn, setCheckIn] = useState(initialDates.checkIn);
  const [checkOut, setCheckOut] = useState(initialDates.checkOut);
  const [timeSlotId, setTimeSlotId] = useState(KHUNG_GIO_THUE_NGAY[0].id);
  const [guests, setGuests] = useState(searchParams.get('guests') || '2');
  const [rooms, setRooms] = useState(searchParams.get('rooms') || '1');
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roomQuery = useQuery({
    queryKey: ['booking-room', roomId],
    queryFn: () => layPhongTheoId(roomId),
    enabled: Boolean(roomId),
  });

  if (!roomId) {
    return <TrangThaiTrong title="Bạn chưa chọn chỗ ở để đặt." actionLabel="Xem danh sách chỗ ở" />;
  }

  if (roomQuery.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="surface-card h-[520px] animate-pulse bg-slate-100" />
      </main>
    );
  }

  if (roomQuery.isError || !roomQuery.data) {
    return <TrangThaiTrong title="Không tải được thông tin chỗ ở." actionLabel="Quay lại danh sách" />;
  }

  const room = roomQuery.data;
  const inventoryCount = Math.max(Number(room.inventory_count || 0), 0);
  const requestedRooms = Math.max(Number(rooms || 1), 1);
  const hasEnoughRooms = inventoryCount > 0 && requestedRooms <= inventoryCount;
  const minCheckOut = bookingType === KIEU_DAT_PHONG.DAY_USE ? checkIn : congNgayIso(1, checkIn);
  const hasValidDates =
    bookingType === KIEU_DAT_PHONG.DAY_USE
      ? Boolean(checkIn && checkOut === checkIn && checkIn >= isoHomNay())
      : Boolean(checkIn && checkOut && checkIn >= isoHomNay() && checkOut > checkIn);
  const roomCharge = tinhTienPhong({
    bookingType,
    checkIn,
    checkOut,
    rooms,
    pricePerNight: room.price_per_night,
    timeSlotId,
  });
  const serviceTotalPrice = selectedServices.reduce((sum, service) => sum + service.priceValue, 0);
  const totalPrice = roomCharge.roomPrice + serviceTotalPrice;
  const canSubmit = Boolean(user?.email_verified) && hasValidDates && hasEnoughRooms && !isSubmitting;

  const handleBookingTypeChange = (nextType) => {
    setBookingType(nextType);
    if (nextType === KIEU_DAT_PHONG.DAY_USE) {
      setCheckOut(checkIn);
      return;
    }

    setCheckOut(congNgayIso(1, checkIn));
  };

  const handleCheckInChange = (value) => {
    const nextCheckIn = value >= isoHomNay() ? value : isoHomNay();
    setCheckIn(nextCheckIn);
    setCheckOut(bookingType === KIEU_DAT_PHONG.DAY_USE ? nextCheckIn : congNgayIso(1, nextCheckIn));
  };

  const handleRoomsChange = (value) => {
    const numericValue = Math.max(Number(value || 1), 1);
    const nextValue = inventoryCount > 0 ? Math.min(numericValue, inventoryCount) : numericValue;
    setRooms(String(nextValue));
  };

  const toggleService = (service) => {
    setSelectedServices((current) =>
      current.some((item) => item.id === service.id)
        ? current.filter((item) => item.id !== service.id)
        : [...current, service],
    );
  };

  const handleSaveBooking = async () => {
    setBookingError('');
    setIsSubmitting(true);

    try {
      const payload = {
        roomId: room.id,
        checkIn,
        checkOut,
        guests,
        rooms,
        services: selectedServices,
        bookingType,
        timeSlotId,
        paymentMethod: 'online_later',
      };

      await taoDatPhong(payload);
      congDiemThuong(100);
      navigate('/my-bookings');
    } catch (error) {
      setBookingError(error?.response?.data?.message || 'Không thể giữ chỗ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="detail-page-bg flex-1">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="surface-card p-6 sm:p-8">
          <span className="eyebrow">Bước đặt phòng</span>
          <h1 className="mt-4 text-[28px] font-bold tracking-normal text-[#222222]">
            Kiểm tra thông tin trước khi giữ chỗ
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            Chọn qua đêm hoặc trong ngày. Sau khi giữ chỗ, bạn sẽ thanh toán toàn bộ hoặc cọc 10% ở Đặt chỗ của tôi.
          </p>

          {!user?.email_verified ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Tài khoản cần xác minh email trước khi đặt phòng.
            </div>
          ) : null}

          {!hasValidDates ? (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              Ngày nhận phòng không được ở quá khứ. Nếu đặt qua đêm, ngày trả phòng phải sau ngày nhận phòng.
            </div>
          ) : null}

          {!hasEnoughRooms ? (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              MySQL bảng rooms hiện chỉ còn {inventoryCount} phòng. Vui lòng giảm số phòng trước khi giữ chỗ.
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Khách đặt phòng</span>
              <input type="text" value={user?.full_name || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Email liên hệ</span>
              <input type="email" value={user?.email || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none" />
            </label>
          </div>

          <div className="mt-8 rounded-[14px] border border-[#dddddd] bg-white p-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.values(KIEU_DAT_PHONG).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleBookingTypeChange(type)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                    bookingType === type ? 'bg-brand-600 text-white' : 'text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]'
                  }`}
                >
                  {NHAN_KIEU_DAT_PHONG[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <TruongNgay label="Ngày nhận phòng" value={checkIn} onChange={handleCheckInChange} min={isoHomNay()} />
            <TruongNgay
              label="Ngày trả phòng"
              value={checkOut}
              onChange={setCheckOut}
              min={minCheckOut}
              disabled={bookingType === KIEU_DAT_PHONG.DAY_USE}
            />
            <TruongSo label="Số khách" min="1" max="12" value={guests} onChange={setGuests} />
            <TruongSo label="Số phòng" min="1" max={Math.max(inventoryCount, 1)} value={rooms} onChange={handleRoomsChange} />
          </div>

          {bookingType === KIEU_DAT_PHONG.DAY_USE ? (
            <div className="mt-6 rounded-[14px] border border-[#dddddd] bg-white p-5">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">Khung giờ sử dụng</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {KHUNG_GIO_THUE_NGAY.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setTimeSlotId(slot.id)}
                    className={`rounded-lg border px-4 py-3 text-left transition ${
                      timeSlotId === slot.id ? 'border-[#222222] bg-white' : 'border-[#dddddd] bg-white hover:border-[#222222]'
                    }`}
                  >
                    <p className="font-black text-slate-950">{slot.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{slot.time}</p>
                    <p className="mt-2 text-sm font-black text-brand-700">{Math.round(slot.priceRate * 100)}% giá đêm</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 rounded-[14px] border border-[#dddddd] bg-[#f7f7f7] p-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {bookingType === KIEU_DAT_PHONG.DAY_USE ? 'Gói sử dụng' : 'Số đêm'}
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {bookingType === KIEU_DAT_PHONG.DAY_USE ? roomCharge.timeSlot.label : roomCharge.units}
              </p>
              {bookingType === KIEU_DAT_PHONG.DAY_USE ? <p className="mt-1 text-sm font-semibold text-slate-500">{roomCharge.timeSlot.time}</p> : null}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Giá mỗi đêm</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{dinhDangTien(room.price_per_night)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Tạm tính phòng</p>
              <p className="mt-2 text-2xl font-black text-brand-700">{dinhDangTien(roomCharge.roomPrice)}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[14px] border border-[#dddddd] bg-white p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">Dịch vụ gợi ý</p>
                <p className="mt-1 text-sm text-slate-500">Chọn thêm nếu cần, danh sách có thể cuộn.</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600">
                {selectedServices.length}/{DICH_VU_THEM.length} đã chọn
              </span>
            </div>
            <div className="mt-4 grid max-h-[360px] gap-4 overflow-y-auto pr-2">
              {DICH_VU_THEM.map((service) => {
                const checked = selectedServices.some((item) => item.id === service.id);

                return (
                  <article key={service.id} className={`rounded-lg border px-4 py-4 ${checked ? 'border-brand-600 bg-white' : 'border-[#dddddd] bg-white'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <label className="flex min-w-0 flex-1 cursor-pointer gap-3">
                        <input type="checkbox" checked={checked} onChange={() => toggleService(service)} className="mt-1 h-4 w-4 accent-brand-600" />
                        <div>
                          <h2 className="text-base font-black text-slate-950">{service.title}</h2>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{service.description}</p>
                        </div>
                      </label>
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                        {dinhDangTien(service.priceValue)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {bookingError ? (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {bookingError}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSaveBooking}
            disabled={!canSubmit}
            className="mt-8 w-full rounded-lg bg-brand-600 px-5 py-4 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-100"
          >
            {isSubmitting ? 'Đang giữ chỗ...' : 'Giữ chỗ và sang Đặt chỗ của tôi'}
          </button>
        </div>

        <aside className="subtle-card p-5 lg:sticky lg:top-24 lg:self-start">
          <img src={resolveMediaUrl(room.image_url)} alt={`${room.hotel_name} ${room.room_name}`} className="h-56 w-full rounded-md object-cover" />
          <div className="mt-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">Chỗ ở đã chọn</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{room.hotel_name}</h2>
            <p className="mt-2 text-sm font-bold text-slate-600">{room.room_name}</p>
            <p className="mt-3 text-sm leading-7 text-slate-500">{room.address}</p>
          </div>

          <div className="mt-6 rounded-[14px] border border-[#dddddd] bg-white p-5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-bold text-slate-600">Tiền phòng</span>
              <span className="font-black text-slate-950">{dinhDangTien(roomCharge.roomPrice)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-bold text-slate-600">Dịch vụ đã chọn</span>
              <span className="font-black text-slate-950">{dinhDangTien(serviceTotalPrice)}</span>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-black text-slate-950">Tổng thanh toán</span>
                <span className="text-2xl font-black text-brand-700">{dinhDangTien(totalPrice)}</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Thanh toán sẽ thực hiện ở trang Đặt chỗ của tôi sau khi giữ chỗ.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-lg bg-slate-50 px-4 py-4">
              <p className="text-sm font-bold text-slate-500">Sức chứa</p>
              <p className="mt-2 text-lg font-black text-slate-950">{room.max_guests} khách</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-4">
              <p className="text-sm font-bold text-slate-500">Phòng còn lại</p>
              <p className="mt-2 text-lg font-black text-slate-950">{inventoryCount} phòng</p>
            </div>
          </div>

          <Link to={`/rooms/${room.id}`} className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-[#222222] px-5 py-3 text-sm font-medium text-[#222222] transition hover:bg-[#f7f7f7]">
            Quay lại chi tiết
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default DatPhong;
