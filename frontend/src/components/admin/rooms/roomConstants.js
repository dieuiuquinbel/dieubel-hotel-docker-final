// Chức năng: Hằng số form, loại phòng và tiện nghi cho quản lý phòng.
// Hằng số dùng chung cho màn quản lý phòng.
export const ROOM_TYPES = {
  standard: 'Tiêu chuẩn',
  superior: 'Superior',
  deluxe: 'Deluxe',
  suite: 'Suite',
  family: 'Gia đình',
};

export const AMENITIES = [
  ['wifi', 'Wi‑Fi'],
  ['air_conditioner', 'Điều hòa'],
  ['breakfast', 'Bữa sáng'],
  ['pool', 'Hồ bơi'],
  ['parking', 'Bãi đỗ xe'],
  ['balcony', 'Ban công'],
];

export const EMPTY_ROOM = {
  hotel_name: '',
  room_name: '',
  city: '',
  address: '',
  room_type: 'standard',
  description: '',
  price_per_night: '',
  max_guests: '2',
  inventory_count: '1',
  amenities: [],
  breakfast_included: false,
  free_cancellation: true,
  is_active: true,
};
