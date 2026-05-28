// Chức năng: Tiện ích lưu lịch sử tìm kiếm phòng.
import { KHOA_LUU_TRU } from './khoaLuuTru';

const KHOA_LUU_TIM_KIEM = KHOA_LUU_TRU.recentSearches;

export function docTimKiemGanDay() {
  try {
    const value = window.localStorage.getItem(KHOA_LUU_TIM_KIEM);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function luuTimKiemGanDay(payload) {
  const current = docTimKiemGanDay();
  const normalized = {
    id: [
      payload.city || 'anywhere',
      payload.checkIn || 'na',
      payload.checkOut || 'na',
      payload.adults || payload.guests || '2',
      payload.children || '0',
      payload.rooms || '1',
      payload.roomType || 'all',
      payload.minPrice || 'min',
      payload.maxPrice || 'max',
      payload.minRating || 'rating',
      Array.isArray(payload.amenities) ? payload.amenities.join('.') : 'amenities',
    ].join('-'),
    city: payload.city || '',
    checkIn: payload.checkIn || '',
    checkOut: payload.checkOut || '',
    adults: payload.adults || payload.guests || '2',
    children: payload.children || '0',
    rooms: payload.rooms || '1',
    guests: payload.guests || String(Number(payload.adults || 2) + Number(payload.children || 0)),
    roomType: payload.roomType || '',
    minPrice: payload.minPrice || '',
    maxPrice: payload.maxPrice || '',
    minRating: payload.minRating || '',
    amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
    breakfastIncluded: Boolean(payload.breakfastIncluded),
    freeCancellation: Boolean(payload.freeCancellation),
    availableOnly: payload.availableOnly !== false,
    savedAt: new Date().toISOString(),
  };

  const next = [normalized, ...current.filter((item) => item.id !== normalized.id)].slice(0, 6);
  window.localStorage.setItem(KHOA_LUU_TIM_KIEM, JSON.stringify(next));
  return next;
}

export function xoaTimKiemGanDay() {
  window.localStorage.removeItem(KHOA_LUU_TIM_KIEM);
}
