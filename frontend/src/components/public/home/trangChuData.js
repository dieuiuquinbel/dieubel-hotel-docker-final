// Chức năng: Dữ liệu tĩnh cho nội dung trang chủ.
// Khi cần chuyển sang CMS hoặc database riêng, ưu tiên sửa file này trước.
export const SLIDE_HERO = [
  {
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1900&q=88',
    label: 'Resort biển được yêu thích',
    title: 'Kỳ nghỉ hoàn hảo bắt đầu từ đây',
    description: 'Tìm ưu đãi khách sạn, resort và căn hộ phù hợp với điểm đến, thời gian và số lượng khách của bạn.',
  },
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1900&q=88',
    label: 'Phòng nghỉ điểm cao',
    title: 'Không gian lưu trú đáng nhớ',
    description: 'Khám phá những phòng suite, deluxe và family đang được khách hàng đánh giá tốt.',
  },
  {
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1900&q=88',
    label: 'Khách sạn trung tâm',
    title: 'Dễ đi, dễ ở, dễ đặt',
    description: 'Chọn nhanh khách sạn gần trung tâm, gần biển hoặc gần phố cổ theo đúng nhu cầu chuyến đi.',
  },
  {
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1900&q=88',
    label: 'Ưu đãi cuối tuần',
    title: 'Nhiều lựa chọn cho mọi chuyến đi',
    description: 'Từ căn hộ công tác đến resort nghỉ dưỡng, DieuBel gợi ý các chỗ ở nổi bật và còn phòng.',
  },
  {
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1900&q=88',
    label: 'Suite cao cấp',
    title: 'Tận hưởng phòng đẹp, giá rõ ràng',
    description: 'Xem nhanh các khách sạn nổi bật, tiện nghi đầy đủ và chính sách hủy linh hoạt.',
  },
  {
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1900&q=88',
    label: 'Kỳ nghỉ gia đình',
    title: 'Phòng rộng cho chuyến đi trọn vẹn',
    description: 'Tìm phòng family, bungalow và villa phù hợp cho nhóm bạn hoặc gia đình.',
  },
];

export const DIEM_DEN = [
  {
    city: 'Ha Noi',
    name: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
    note: 'Khách sạn trung tâm, căn hộ dịch vụ và chỗ ở công tác.',
  },
  {
    city: 'Da Nang',
    name: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    note: 'Resort biển, suite gia đình và phòng nghỉ gần biển.',
  },
  {
    city: 'Ho Chi Minh',
    name: 'TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80',
    note: 'Lưu trú công tác, khách sạn quận 1 và căn hộ tiện nghi.',
  },
  {
    city: 'Hoi An',
    name: 'Hội An',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    note: 'Không gian nghỉ dưỡng yên tĩnh, gần phố cổ.',
  },
];

export const BO_SUU_TAP = [
  {
    title: 'Nghỉ dưỡng biển',
    detail: 'Resort, villa và suite gần biển cho kỳ nghỉ thư giãn.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    query: { city: 'Da Nang', roomType: 'suite', availableOnly: true },
  },
  {
    title: 'Chuyến công tác',
    detail: 'Khách sạn trung tâm, dễ di chuyển và giá minh bạch.',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    query: { city: 'Ho Chi Minh', roomType: 'deluxe', availableOnly: true },
  },
  {
    title: 'Gia đình & nhóm bạn',
    detail: 'Phòng rộng, nhiều khách, có bữa sáng và hủy linh hoạt.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    query: { roomType: 'family', guests: '4', adults: '2', children: '2', availableOnly: true },
  },
  {
    title: 'Gần phố cổ',
    detail: 'Chỗ ở yên tĩnh, thuận tiện khám phá ẩm thực và văn hóa.',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    query: { city: 'Hoi An', availableOnly: true },
  },
];

export const THONG_KE_TIN_CAY = [
  { value: '500+', label: 'khách sạn & khu nghỉ dưỡng', note: 'đa dạng hạng phòng' },
  { value: '50 nghìn+', label: 'khách đã đặt phòng', note: 'trải nghiệm đã xác nhận' },
  { value: '12', label: 'thành phố phổ biến', note: 'biển, núi và trung tâm' },
  { value: '4.9+', label: 'đánh giá trung bình', note: 'từ khách lưu trú' },
];

export const DIEM_TIN_CAY = [
  { title: 'Giá rõ ràng', detail: 'Thông tin giá phòng, phụ phí và ưu đãi được hiển thị trước khi khách xác nhận đặt phòng.' },
  { title: 'Lựa chọn phù hợp', detail: 'Dễ dàng tìm khách sạn, resort hoặc căn hộ theo vị trí, ngân sách và nhu cầu lưu trú.' },
  { title: 'Chính sách linh hoạt', detail: 'Nhiều chỗ ở hỗ trợ giữ chỗ, đặt cọc và hủy phòng theo điều kiện hiển thị sẵn.' },
  { title: 'Theo dõi thuận tiện', detail: 'Khách có thể xem lại đặt phòng, trạng thái thanh toán và thông tin nhận phòng khi cần.' },
];

export const BINH_LUAN_POPUP = [
  { name: 'Mai Phương', trip: 'Công tác Hà Nội', text: 'Giá rõ ràng, đặt xong xem lại hóa đơn rất tiện.', score: '9.5' },
  { name: 'Quốc Huy', trip: 'Du lịch Đà Lạt', text: 'Lọc theo ngân sách nhanh, danh sách trả về đúng nhu cầu.', score: '9.0' },
  { name: 'Minh Anh', trip: 'Kỳ nghỉ Đà Nẵng', text: 'Mình tìm được phòng gần biển dưới 1 triệu, có cả ưu đãi.', score: '9.4' },
  { name: 'Linh Chi', trip: 'Gia đình Hội An', text: 'Phòng family dễ tìm, bữa sáng và hủy miễn phí hiển thị rõ.', score: '9.6' },
  { name: 'Tuấn Kiệt', trip: 'Cuối tuần Phú Quốc', text: 'Thanh toán VietQR nhanh, QR nhận phòng rất tiện khi check-in.', score: '9.3' },
  { name: 'Bảo Trân', trip: 'Nghỉ dưỡng Nha Trang', text: 'Dịch vụ thêm được ghi rõ nên không phải hỏi lại nhân viên.', score: '9.2' },
  { name: 'Hoàng Nam', trip: 'Công tác TP.HCM', text: 'Trang chi tiết phòng đủ thông tin, biết ngay còn phòng hay không.', score: '9.1' },
  { name: 'An Nhiên', trip: 'Du lịch Đà Nẵng', text: 'Áp voucher trước khi thanh toán nên tổng tiền dễ kiểm soát.', score: '9.7' },
  { name: 'Khánh Vy', trip: 'Đi chơi Hà Nội', text: 'Giao diện dễ dùng, hỏi trợ lý là ra phòng đúng ngân sách.', score: '9.4' },
  { name: 'Đức Minh', trip: 'Nghỉ dưỡng Phú Quốc', text: 'Đặt phòng nhanh, trạng thái thanh toán cập nhật rõ ràng.', score: '9.5' },
  { name: 'Thanh Tùng', trip: 'Du lịch Nha Trang', text: 'Ảnh phòng rõ, tiện nghi ghi đầy đủ nên chọn phòng rất nhanh.', score: '9.2' },
  { name: 'Hạ Vy', trip: 'Gia đình Hội An', text: 'Có phòng family đúng số khách, giá cuối cùng dễ hiểu.', score: '9.6' },
];

export const SO_DANH_GIA_MOI_LUOT = 4;
export const CAC_SLOT_DANH_GIA = Array.from({ length: SO_DANH_GIA_MOI_LUOT }, (_, index) => index);
export const THOI_GIAN_HIEN_TUNG_DANH_GIA = 1000;
export const THOI_GIAN_BAT_DAU_THOAT_DANH_GIA = 4500;
export const THOI_GIAN_THOAT_NHOM_DANH_GIA = 1200;
export const TONG_NHOM_DANH_GIA = Math.ceil(BINH_LUAN_POPUP.length / SO_DANH_GIA_MOI_LUOT);