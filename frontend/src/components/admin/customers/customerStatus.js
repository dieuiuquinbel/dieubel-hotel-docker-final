// Hàm ánh xạ trạng thái khách hàng sang nhãn và class hiển thị.
export function nhanTrangThaiKhach(status) {
  return status === 'active' ? 'Đang hoạt động' : 'Đã khóa';
}

export function classTrangThaiKhach(status) {
  return status === 'active'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-rose-50 text-rose-700';
}
