// Ch?c n?ng: C?u h?nh l?a ch?n v? gi? tr? m?c ??nh cho thanh t?m ki?m ph?ng.
export const DIEM_DEN = [
  { value: 'Ha Noi', label: 'Hà Nội', subtitle: 'Khách sạn trung tâm, căn hộ dịch vụ' },
  { value: 'Da Nang', label: 'Đà Nẵng', subtitle: 'Resort biển, suite gia đình' },
  { value: 'Ho Chi Minh', label: 'TP. Hồ Chí Minh', subtitle: 'Khách sạn công tác, căn hộ trung tâm' },
  { value: 'Hoi An', label: 'Hội An', subtitle: 'Không gian nghỉ dưỡng gần phố cổ' },
  { value: 'Phu Quoc', label: 'Phú Quốc', subtitle: 'Resort đảo, villa gia đình và hồ bơi' },
  { value: 'Nha Trang', label: 'Nha Trang', subtitle: 'Khách sạn biển, phòng view đại dương' },
  { value: 'Da Lat', label: 'Đà Lạt', subtitle: 'Villa nghỉ dưỡng, homestay và phòng áp mái' },
  { value: 'Sa Pa', label: 'Sa Pa', subtitle: 'Lodge núi, phòng săn mây và kỳ nghỉ yên tĩnh' },
];

export const LOAI_PHONG = [
  { value: 'standard', label: 'Tiêu chuẩn' },
  { value: 'superior', label: 'Superior' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'suite', label: 'Suite' },
  { value: 'family', label: 'Gia đình' },
];

export const TIEN_NGHI = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'air_conditioner', label: 'Điều hòa' },
  { value: 'breakfast', label: 'Bữa sáng' },
  { value: 'pool', label: 'Hồ bơi' },
  { value: 'parking', label: 'Bãi đỗ xe' },
  { value: 'balcony', label: 'Ban công' },
];

export const KHOANG_GIA = [
  { value: '', label: 'Mọi mức giá', min: '', max: '' },
  { value: 'under-800', label: 'Dưới 800k', min: '', max: '800000' },
  { value: '800-1500', label: '800k - 1.5tr', min: '800000', max: '1500000' },
  { value: '1500-2500', label: '1.5tr - 2.5tr', min: '1500000', max: '2500000' },
  { value: '2500-plus', label: 'Từ 2.5tr', min: '2500000', max: '' },
];

export const LUA_CHON_DANH_GIA = [
  { value: '', label: 'Tất cả mức điểm' },
  { value: '9', label: '9.0+ xuất sắc' },
  { value: '8', label: '8.0+ rất tốt' },
  { value: '7', label: '7.0+ tốt' },
];

export const LUA_CHON_CHINH_SACH = [
  { field: 'availableOnly', label: 'Còn phòng' },
  { field: 'freeCancellation', label: 'Hủy miễn phí' },
  { field: 'breakfastIncluded', label: 'Có bữa sáng' },
];

export const THU_TRONG_TUAN = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const TEN_THANG = [
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

export const FORM_MAC_DINH = {
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
