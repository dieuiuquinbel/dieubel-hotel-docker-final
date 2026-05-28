// Chức năng: Hàm tính toán số liệu hiển thị cho dashboard admin.
// Helper tính toán cho trang tổng quan admin.
export function tinhTongPhongTheoDoi(stats = {}) {
  const availableRooms = Number(stats.availableRooms || 0);
  const checkedInRooms = Number(stats.checkedInRooms || 0);
  const reservedRooms = Number(stats.reservedRooms || 0);
  const trackedRooms = availableRooms + checkedInRooms + reservedRooms;

  return {
    availableRooms,
    checkedInRooms,
    reservedRooms,
    trackedRooms,
    availablePercent: trackedRooms ? Math.round((availableRooms / trackedRooms) * 100) : 0,
    checkedInPercent: trackedRooms ? Math.round((checkedInRooms / trackedRooms) * 100) : 0,
    reservedPercent: trackedRooms ? Math.round((reservedRooms / trackedRooms) * 100) : 0,
  };
}

export function tinhTyLeXacNhan(stats = {}) {
  return Number(stats.totalBookings || 0)
    ? `${stats.confirmedBookings || 0} / ${stats.totalBookings || 0}`
    : '0 / 0';
}
