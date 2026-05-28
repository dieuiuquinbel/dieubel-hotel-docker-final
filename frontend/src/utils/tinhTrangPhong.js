// Chức năng: Hằng số và nhãn tình trạng phòng.
export function layThongTinTinhTrangPhong(inventoryCount) {
  const count = Number(inventoryCount) || 0;

  if (count <= 0) {
    return {
      label: 'Hết phòng',
      lopHuyHieu: 'bg-slate-900/80 text-white',
      textClass: 'text-rose-600',
      description: () => 'Tạm thời không còn phòng trống.',
    };
  }

  if (count <= 3) {
    return {
      label: 'Sắp hết',
      lopHuyHieu: 'bg-amber-100 text-amber-700',
      textClass: 'text-amber-600',
      description: () => `Chỉ còn ${count} phòng, nên đặt sớm.`,
    };
  }

  return {
    label: 'Còn phòng',
    lopHuyHieu: 'bg-emerald-100 text-emerald-700',
    textClass: 'text-emerald-600',
    description: () => `Còn ${count} phòng, có thể đặt ngay.`,
  };
}
