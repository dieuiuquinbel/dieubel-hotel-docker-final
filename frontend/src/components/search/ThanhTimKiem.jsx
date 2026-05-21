import { useEffect, useMemo, useRef, useState } from 'react';

const DIEM_DEN = [
  { value: 'Ha Noi', label: 'Hà Nội', subtitle: 'Khách sạn trung tâm, căn hộ dịch vụ' },
  { value: 'Da Nang', label: 'Đà Nẵng', subtitle: 'Resort biển, suite gia đình' },
  { value: 'Ho Chi Minh', label: 'TP. Hồ Chí Minh', subtitle: 'Khách sạn công tác, căn hộ trung tâm' },
  { value: 'Hoi An', label: 'Hội An', subtitle: 'Không gian nghỉ dưỡng gần phố cổ' },
  { value: 'Phu Quoc', label: 'Phú Quốc', subtitle: 'Resort đảo, villa gia đình và hồ bơi' },
  { value: 'Nha Trang', label: 'Nha Trang', subtitle: 'Khách sạn biển, phòng view đại dương' },
  { value: 'Da Lat', label: 'Đà Lạt', subtitle: 'Villa nghỉ dưỡng, homestay và phòng áp mái' },
  { value: 'Sa Pa', label: 'Sa Pa', subtitle: 'Lodge núi, phòng săn mây và kỳ nghỉ yên tĩnh' },
];

const LOAI_PHONG = [
  { value: 'standard', label: 'Tiêu chuẩn' },
  { value: 'superior', label: 'Superior' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'suite', label: 'Suite' },
  { value: 'family', label: 'Gia đình' },
];

const TIEN_NGHI = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'air_conditioner', label: 'Điều hòa' },
  { value: 'breakfast', label: 'Bữa sáng' },
  { value: 'pool', label: 'Hồ bơi' },
  { value: 'parking', label: 'Bãi đỗ xe' },
  { value: 'balcony', label: 'Ban công' },
];

const KHOANG_GIA = [
  { value: '', label: 'Mọi mức giá', min: '', max: '' },
  { value: 'under-800', label: 'Dưới 800k', min: '', max: '800000' },
  { value: '800-1500', label: '800k - 1.5tr', min: '800000', max: '1500000' },
  { value: '1500-2500', label: '1.5tr - 2.5tr', min: '1500000', max: '2500000' },
  { value: '2500-plus', label: 'Từ 2.5tr', min: '2500000', max: '' },
];

const LUA_CHON_DANH_GIA = [
  { value: '', label: 'Tất cả mức điểm' },
  { value: '9', label: '9.0+ xuất sắc' },
  { value: '8', label: '8.0+ rất tốt' },
  { value: '7', label: '7.0+ tốt' },
];

const LUA_CHON_CHINH_SACH = [
  { field: 'availableOnly', label: 'Còn phòng' },
  { field: 'freeCancellation', label: 'Hủy miễn phí' },
  { field: 'breakfastIncluded', label: 'Có bữa sáng' },
];

const THU_TRONG_TUAN = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const TEN_THANG = [
  'tháng 1',
  'tháng 2',
  'tháng 3',
  'tháng 4',
  'tháng 5',
  'tháng 6',
  'tháng 7',
  'tháng 8',
  'tháng 9',
  'tháng 10',
  'tháng 11',
  'tháng 12',
];

const FORM_MAC_DINH = {
  city: '',
  checkIn: '',
  checkOut: '',
  adults: '2',
  children: '0',
  rooms: '1',
  guests: '2',
  roomType: '',
  minPrice: '',
  maxPrice: '',
  minRating: '',
  amenities: [],
  breakfastIncluded: false,
  freeCancellation: false,
  availableOnly: true,
};

function thanhBoolean(value) {
  return value === true || value === 'true' || value === '1';
}

function thanhMang(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function chuanHoaBieuMau(values = {}) {
  const adults = values.adults || values.guests || FORM_MAC_DINH.adults;
  const children = values.children || FORM_MAC_DINH.children;
  const rooms = values.rooms || FORM_MAC_DINH.rooms;

  return {
    ...FORM_MAC_DINH,
    ...values,
    adults,
    children,
    rooms,
    guests: String(Number(adults || 0) + Number(children || 0) || Number(values.guests || 2)),
    amenities: thanhMang(values.amenities),
    breakfastIncluded: thanhBoolean(values.breakfastIncluded),
    freeCancellation: thanhBoolean(values.freeCancellation),
    availableOnly: values.availableOnly === undefined ? FORM_MAC_DINH.availableOnly : thanhBoolean(values.availableOnly),
  };
}

function dauNgay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function congNgay(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function congThang(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function thanhGiaTriNgay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function docGiaTriNgay(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function dinhDangNhanNgay(value) {
  const date = docGiaTriNgay(value);
  if (!date) return '';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function laCungNgay(first, second) {
  return first && second && thanhGiaTriNgay(first) === thanhGiaTriNgay(second);
}

function layOThang(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const leadingBlankCount = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: leadingBlankCount }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  return cells;
}

function Truong({ label, children, className = '' }) {
  return (
    <label className={`booking-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function BoDemKhach({ label, value, min = 0, onChange }) {
  const numberValue = Number(value || 0);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="grid grid-cols-[36px_42px_36px] overflow-hidden rounded-lg border border-slate-200 bg-white text-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, numberValue - 1))}
          className="min-h-9 text-lg font-bold text-brand-700 transition hover:bg-sky-50"
        >
          -
        </button>
        <span className="flex items-center justify-center text-sm font-bold text-slate-950">{numberValue}</span>
        <button
          type="button"
          onClick={() => onChange(numberValue + 1)}
          className="min-h-9 text-lg font-bold text-brand-700 transition hover:bg-sky-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

function NhomLoc({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function LuaChonLoc({ active, children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-black transition ${
        active
          ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-500/20'
          : 'border-sky-100 bg-sky-50/70 text-slate-700 hover:border-brand-500 hover:bg-white hover:text-brand-700'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function ThanhTimKiem({
  defaultValues,
  onSubmit,
  onReset,
  submitLabel = 'Tìm',
  compact = false,
  showAdvanced = false,
  advancedMode = 'inline',
}) {
  const searchRef = useRef(null);
  const [form, setForm] = useState(() => chuanHoaBieuMau(defaultValues));
  const [advancedOpen, setAdvancedOpen] = useState(showAdvanced && advancedMode === 'inline');
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState(() => chuanHoaBieuMau(defaultValues).city || '');
  const [destinationTouched, setDestinationTouched] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [dateView, setDateView] = useState(() => dauNgay(new Date()));
  const [destinationError, setDestinationError] = useState('');

  const today = useMemo(() => dauNgay(new Date()), []);
  const selectedDestination = DIEM_DEN.find((destination) => destination.value === form.city);
  const selectedPriceBand =
    KHOANG_GIA.find((band) => band.min === form.minPrice && band.max === form.maxPrice)?.value || '';
  const filteredDestinations = DIEM_DEN.filter((destination) => {
    const keyword = destinationTouched ? destinationQuery.trim().toLowerCase() : '';
    if (!keyword) return true;
    return `${destination.label} ${destination.value} ${destination.subtitle}`.toLowerCase().includes(keyword);
  });

  const checkInDate = docGiaTriNgay(form.checkIn);
  const checkOutDate = docGiaTriNgay(form.checkOut);

  useEffect(() => {
    if (advancedMode !== 'collapsible') return undefined;

    const handleOutsideClose = (event) => {
      if (!searchRef.current || searchRef.current.contains(event.target)) return;
      setAdvancedOpen(false);
      setDestinationOpen(false);
      setDateOpen(false);
      setGuestOpen(false);
    };

    document.addEventListener('pointerdown', handleOutsideClose);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClose);
    };
  }, [advancedMode]);

  useEffect(() => {
    const closePanels = () => {
      setDestinationOpen(false);
      setDateOpen(false);
      setGuestOpen(false);
      if (advancedMode === 'collapsible') {
        setAdvancedOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (!searchRef.current || searchRef.current.contains(event.target)) return;
      closePanels();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closePanels();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [advancedMode]);

  const setFormValue = (name, value) => {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'adults' || name === 'children') {
        next.guests = String(Number(next.adults || 0) + Number(next.children || 0));
      }
      return next;
    });
  };

  const handleDestinationSelect = (destination) => {
    setDestinationQuery(destination.label);
    setDestinationTouched(false);
    setFormValue('city', destination.value);
    setDestinationError('');
    setDestinationOpen(false);
  };

  const handleDateSelect = (date) => {
    if (date < today) return;

    const value = thanhGiaTriNgay(date);
    if (!form.checkIn || form.checkOut || (checkInDate && date <= checkInDate)) {
      setForm((current) => ({ ...current, checkIn: value, checkOut: '' }));
      return;
    }

    setForm((current) => ({ ...current, checkOut: value }));
    setDateOpen(false);
  };

  const handleQuickNights = (nights) => {
    const start = checkInDate && checkInDate >= today ? checkInDate : today;
    setForm((current) => ({
      ...current,
      checkIn: thanhGiaTriNgay(start),
      checkOut: thanhGiaTriNgay(congNgay(start, nights)),
    }));
    setDateOpen(false);
  };

  const handleToggle = (name) => {
    setForm((current) => ({ ...current, [name]: !current[name] }));
  };

  const handleAmenityToggle = (value) => {
    setForm((current) => {
      const exists = current.amenities.includes(value);
      return {
        ...current,
        amenities: exists ? current.amenities.filter((item) => item !== value) : [...current.amenities, value],
      };
    });
  };

  const handlePriceBandChange = (value) => {
    const band = KHOANG_GIA.find((item) => item.value === value) || KHOANG_GIA[0];
    setForm((current) => ({
      ...current,
      minPrice: band.min,
      maxPrice: band.max,
    }));
  };

  const handleResetFilters = () => {
    const next = chuanHoaBieuMau();
    setForm(next);
    setDestinationQuery('');
    setDestinationTouched(false);
    setDestinationError('');
    setDestinationOpen(false);
    setDateOpen(false);
    setGuestOpen(false);
    if (advancedMode === 'collapsible') {
      setAdvancedOpen(false);
    }
    onReset?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (destinationQuery.trim() && !selectedDestination) {
      setDestinationError('Vui lòng chọn một điểm đến trong danh sách.');
      setDestinationOpen(true);
      return;
    }

    onSubmit?.({
      ...form,
      guests: String(Number(form.adults || 0) + Number(form.children || 0)),
    });
    if (advancedMode === 'collapsible') {
      setAdvancedOpen(false);
    }
  };

  const dateSummary =
    form.checkIn && form.checkOut
      ? `${dinhDangNhanNgay(form.checkIn)} - ${dinhDangNhanNgay(form.checkOut)}`
      : form.checkIn
        ? `${dinhDangNhanNgay(form.checkIn)} - Chọn ngày trả`
        : 'Nhận phòng - Trả phòng';
  const guestSummary = `${form.adults} người lớn · ${form.children} trẻ em · ${form.rooms} phòng`;

  return (
    <form
      ref={searchRef}
      onSubmit={handleSubmit}
      className={`booking-search ${compact ? 'booking-search-compact' : ''} ${showAdvanced ? 'booking-search-expanded' : ''} ${
        advancedMode === 'collapsible' ? 'relative' : ''
      }`}
    >
      <div className="grid items-start gap-0 md:grid-cols-[1.25fr_1.6fr_1.2fr_auto]">
        <div className="relative">
          <Truong label="Bạn muốn đến đâu?">
            <input
              type="text"
              value={destinationQuery}
              onFocus={() => {
                setDestinationOpen(true);
                setDestinationTouched(false);
                setDateOpen(false);
                setGuestOpen(false);
              }}
              onChange={(event) => {
                setDestinationQuery(event.target.value);
                setDestinationTouched(true);
                setFormValue('city', '');
                setDestinationError('');
                setDestinationOpen(true);
              }}
              placeholder="Chọn điểm đến"
              className="booking-input"
              autoComplete="off"
            />
          </Truong>

          {destinationOpen ? (
            <div
              className={
                advancedMode === 'collapsible'
                  ? 'mt-3 w-full min-w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10'
                  : 'absolute left-0 top-[calc(100%+10px)] z-40 w-full min-w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15'
              }
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-black text-slate-950">Các điểm đến đang có phòng</p>
                <p className="mt-1 text-xs text-slate-500">Chỉ chọn trong danh sách để tránh không có kết quả.</p>
              </div>

              <div className={advancedMode === 'collapsible' ? 'max-h-56 overflow-y-auto' : 'max-h-72 overflow-y-auto'}>
                {filteredDestinations.length ? (
                  filteredDestinations.map((destination) => (
                    <button
                      key={destination.value}
                      type="button"
                      onClick={() => handleDestinationSelect(destination)}
                      className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-sky-50"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-100 text-brand-700">
                        ⌖
                      </span>
                      <span>
                        <span className="block text-sm font-black text-slate-950">{destination.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{destination.subtitle}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-5 text-sm text-slate-500">Chưa có khách sạn tại điểm đến này.</div>
                )}
              </div>
            </div>
          ) : null}

          {destinationError ? <p className="mt-2 text-xs font-bold text-rose-600">{destinationError}</p> : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setDateOpen((current) => !current);
              setDestinationOpen(false);
              setGuestOpen(false);
            }}
            className="booking-field w-full text-left"
          >
            <span>Nhận phòng - Trả phòng</span>
            <strong className="block truncate text-sm text-slate-950">{dateSummary}</strong>
          </button>

          {dateOpen ? (
            <div
              className={
                advancedMode === 'collapsible'
                  ? 'mt-3 w-[min(700px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10'
                  : 'absolute left-1/2 top-[calc(100%+10px)] z-40 w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/15'
              }
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setDateView((current) => congThang(current, -1))}
                  disabled={dateView <= new Date(today.getFullYear(), today.getMonth(), 1)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ←
                </button>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-950">Chọn ngày lưu trú</p>
                  <p className="mt-1 text-xs text-slate-500">Ngày trả phòng phải sau ngày nhận phòng.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDateView((current) => congThang(current, 1))}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-sky-50"
                >
                  →
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {[dateView, congThang(dateView, 1)].map((monthDate) => (
                  <div key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}>
                    <h3 className="mb-3 text-center text-sm font-black text-slate-950">
                      {TEN_THANG[monthDate.getMonth()]} {monthDate.getFullYear()}
                    </h3>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {THU_TRONG_TUAN.map((weekday) => (
                        <div key={weekday} className="py-1 text-xs font-bold text-slate-400">
                          {weekday}
                        </div>
                      ))}
                      {layOThang(monthDate).map((date, index) => {
                        if (!date) return <div key={`blank-${index}`} />;

                        const disabled = date < today;
                        const selectedStart = laCungNgay(date, checkInDate);
                        const selectedEnd = laCungNgay(date, checkOutDate);
                        const inRange = checkInDate && checkOutDate && date > checkInDate && date < checkOutDate;

                        return (
                          <button
                            key={thanhGiaTriNgay(date)}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleDateSelect(date)}
                            className={`min-h-9 rounded-lg text-sm font-bold transition ${
                              selectedStart || selectedEnd
                                ? 'bg-brand-600 text-white'
                                : inRange
                                  ? 'bg-sky-50 text-brand-700'
                                  : disabled
                                    ? 'cursor-not-allowed text-slate-300'
                                    : 'text-slate-700 hover:bg-sky-50 hover:text-brand-700'
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="text-xs font-bold text-slate-500">
                  {form.checkIn && form.checkOut
                    ? `${dinhDangNhanNgay(form.checkIn)} đến ${dinhDangNhanNgay(form.checkOut)}`
                    : 'Chọn ngày nhận phòng, sau đó chọn ngày trả phòng'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 7].map((nights) => (
                    <button
                      key={nights}
                      type="button"
                      onClick={() => handleQuickNights(nights)}
                      className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                    >
                      + {nights} đêm
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setGuestOpen((current) => !current);
              setDestinationOpen(false);
              setDateOpen(false);
            }}
            className="booking-field w-full text-left"
          >
            <span>Khách & phòng</span>
            <strong className="block truncate text-sm text-slate-950">{guestSummary}</strong>
          </button>

          {guestOpen ? (
            <div
              className={
                advancedMode === 'collapsible'
                  ? 'mt-3 w-full min-w-[300px] rounded-xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/10'
                  : 'absolute right-0 top-[calc(100%+10px)] z-40 w-full min-w-[300px] rounded-xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/15'
              }
            >
              <div className="grid gap-4">
                <BoDemKhach label="Người lớn" value={form.adults} min={1} onChange={(value) => setFormValue('adults', String(value))} />
                <BoDemKhach label="Trẻ em" value={form.children} onChange={(value) => setFormValue('children', String(value))} />
                <BoDemKhach label="Phòng" value={form.rooms} min={1} onChange={(value) => setFormValue('rooms', String(value))} />
              </div>
              <button
                type="button"
                onClick={() => setGuestOpen(false)}
                className="mt-5 w-full rounded-lg border border-brand-600 px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-sky-50"
              >
                Xong
              </button>
            </div>
          ) : null}
        </div>

        <button
          type={advancedMode === 'collapsible' ? 'button' : 'submit'}
          onClick={
            advancedMode === 'collapsible'
              ? () => {
                  setAdvancedOpen((current) => !current);
                  setDestinationOpen(false);
                  setDateOpen(false);
                  setGuestOpen(false);
                }
              : undefined
          }
          className="m-1 h-14 self-start rounded-[14px] bg-brand-600 px-7 text-base font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700 md:h-[62px]"
        >
          {advancedMode === 'collapsible' ? (advancedOpen ? 'Thu gọn' : submitLabel) : submitLabel}
        </button>
      </div>

      <div className={`mt-3 flex flex-wrap gap-2 ${advancedMode === 'collapsible' && !advancedOpen ? 'hidden' : ''}`}>
        {[
          ['availableOnly', 'Còn phòng'],
          ['freeCancellation', 'Hủy miễn phí'],
          ['breakfastIncluded', 'Có bữa sáng'],
        ].map(([field, label]) => (
          <button
            key={field}
            type="button"
            onClick={() => handleToggle(field)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              form[field] ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showAdvanced && (advancedMode !== 'collapsible' || advancedOpen) ? (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <NhomLoc title="Mức giá mỗi đêm">
              {KHOANG_GIA.map((band) => (
                <LuaChonLoc
                  key={band.value || 'all'}
                  active={selectedPriceBand === band.value}
                  onClick={() => handlePriceBandChange(band.value)}
                >
                  {band.label}
                </LuaChonLoc>
              ))}
            </NhomLoc>

            <NhomLoc title="Loại chỗ ở">
              <LuaChonLoc active={!form.roomType} onClick={() => setFormValue('roomType', '')}>
                Tất cả
              </LuaChonLoc>
              {LOAI_PHONG.map((type) => (
                <LuaChonLoc key={type.value} active={form.roomType === type.value} onClick={() => setFormValue('roomType', type.value)}>
                  {type.label}
                </LuaChonLoc>
              ))}
            </NhomLoc>

            <NhomLoc title="Điểm đánh giá">
              {LUA_CHON_DANH_GIA.map((option) => (
                <LuaChonLoc key={option.value || 'all'} active={form.minRating === option.value} onClick={() => setFormValue('minRating', option.value)}>
                  {option.label}
                </LuaChonLoc>
              ))}
            </NhomLoc>

            <NhomLoc title="Chính sách đặt phòng">
              {LUA_CHON_CHINH_SACH.map((option) => (
                <LuaChonLoc key={option.field} active={form[option.field]} onClick={() => handleToggle(option.field)}>
                  {option.label}
                </LuaChonLoc>
              ))}
            </NhomLoc>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Tiện nghi phổ biến</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TIEN_NGHI.map((amenity) => {
                const active = form.amenities.includes(amenity.value);
                return (
                  <LuaChonLoc key={amenity.value} active={active} onClick={() => handleAmenityToggle(amenity.value)}>
                    {amenity.label}
                  </LuaChonLoc>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
            >
              Làm mới
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}

export default ThanhTimKiem;
