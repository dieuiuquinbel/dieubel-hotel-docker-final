// Helper lọc và hiển thị dữ liệu phòng.
import { ROOM_TYPES } from './roomConstants';

export function roomText(room) {
  return [room.id, room.room_name, room.hotel_name, room.city, room.address, room.room_type]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getInventory(room) {
  return Number(room.inventory_count ?? room.inventoryCount ?? room.available_rooms ?? room.availableRooms ?? 0);
}

export function taoThongKePhong(rooms) {
  return [
    { label: 'Tổng phòng', value: rooms.length },
    { label: 'Còn phòng', value: rooms.filter((room) => getInventory(room) > 3).length, tone: 'text-emerald-700' },
    { label: 'Sắp hết', value: rooms.filter((room) => getInventory(room) > 0 && getInventory(room) <= 3).length, tone: 'text-amber-700' },
    { label: 'Hết phòng', value: rooms.filter((room) => getInventory(room) <= 0).length, tone: 'text-rose-700' },
  ];
}

export function locPhong({ rooms, query, status, type }) {
  const keyword = query.trim().toLowerCase();

  return rooms
    .filter((room) => !keyword || roomText(room).includes(keyword))
    .filter((room) => type === 'all' || room.room_type === type)
    .filter((room) => {
      if (status === 'all') return true;

      const count = getInventory(room);
      if (status === 'available') return count > 3;
      if (status === 'low') return count > 0 && count <= 3;
      if (status === 'sold_out') return count <= 0;
      return true;
    });
}

export function nhanLoaiPhong(roomType) {
  return ROOM_TYPES[roomType] || roomType;
}
