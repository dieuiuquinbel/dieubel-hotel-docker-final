// Chức năng: Tiện ích xử lý đường dẫn trong frontend.
export function taoDuongDanDatPhong(roomId) {
  return `/booking?roomId=${roomId}`;
}

export function taoDuongDanDangNhapChuyenHuong(targetPath = '/') {
  return `/auth?mode=login&redirect=${encodeURIComponent(targetPath)}`;
}

export function taoDuongDanDangKyChuyenHuong(targetPath = '/') {
  return `/auth?mode=register&redirect=${encodeURIComponent(targetPath)}`;
}
