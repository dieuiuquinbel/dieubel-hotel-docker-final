// Chức năng: Tiện ích lưu lịch sử phòng đã xem.
import { KHOA_LUU_TRU } from './khoaLuuTru';

const KHOA_PHONG_DA_XEM = KHOA_LUU_TRU.viewedRooms;
const KHOA_PHONG_YEU_THICH = KHOA_LUU_TRU.favoriteRooms;

function docMang(key) {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ghiMang(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function docPhongDaXem() {
  return docMang(KHOA_PHONG_DA_XEM);
}

export function luuPhongDaXem(room) {
  if (!room?.id) return docPhongDaXem();

  const current = docPhongDaXem();
  const normalized = {
    id: room.id,
    hotel_name: room.hotel_name,
    room_name: room.room_name,
    city: room.city,
    address: room.address,
    image_url: room.image_url,
    price_per_night: room.price_per_night,
    rating_avg: room.rating_avg,
    total_reviews: room.total_reviews,
    room_type: room.room_type,
    inventory_count: room.inventory_count,
    viewedAt: new Date().toISOString(),
  };

  const next = [normalized, ...current.filter((item) => item.id !== room.id)].slice(0, 12);
  ghiMang(KHOA_PHONG_DA_XEM, next);
  return next;
}

export function xoaPhongDaXem() {
  window.localStorage.removeItem(KHOA_PHONG_DA_XEM);
}

export function docPhongYeuThich() {
  return docMang(KHOA_PHONG_YEU_THICH);
}

export function laPhongYeuThich(roomId) {
  return docPhongYeuThich().some((room) => String(room.id) === String(roomId));
}

export function daoTrangThaiPhongYeuThich(room) {
  if (!room?.id) return docPhongYeuThich();

  const current = docPhongYeuThich();
  const exists = current.some((item) => String(item.id) === String(room.id));

  if (exists) {
    const next = current.filter((item) => String(item.id) !== String(room.id));
    ghiMang(KHOA_PHONG_YEU_THICH, next);
    return next;
  }

  const normalized = {
    id: room.id,
    hotel_name: room.hotel_name,
    room_name: room.room_name,
    city: room.city,
    address: room.address,
    image_url: room.image_url,
    price_per_night: room.price_per_night,
    rating_avg: room.rating_avg,
    total_reviews: room.total_reviews,
    room_type: room.room_type,
    inventory_count: room.inventory_count,
    savedAt: new Date().toISOString(),
  };

  const next = [normalized, ...current.filter((item) => String(item.id) !== String(room.id))].slice(0, 24);
  ghiMang(KHOA_PHONG_YEU_THICH, next);
  return next;
}
