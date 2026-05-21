// Helper xử lý mốc thời gian và dữ liệu biểu diễn cho trang doanh thu.
export function ymdToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00`);
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function firstDayOfMonth(dateText) {
  return `${dateText.slice(0, 8)}01`;
}

export function buildRange(preset) {
  const today = ymdToday();

  if (preset === 'today') {
    return { dateFrom: today, dateTo: today };
  }

  if (preset === 'week') {
    return { dateFrom: addDays(today, -6), dateTo: today };
  }

  if (preset === 'month') {
    return { dateFrom: firstDayOfMonth(today), dateTo: today };
  }

  return { dateFrom: today, dateTo: today };
}

export function taoPhanTichTrongKy(period = {}) {
  return [
    ['Đã thu trong kỳ', period.paidRevenue || 0],
    ['Còn phải thu trong kỳ', period.receivableAmount || 0],
    ['Giảm giá trong kỳ', period.voucherDiscount || 0],
    ['Phí hủy giữ lại', period.cancelFeeRevenue || 0],
    ['Hoàn tiền trong kỳ', period.refundAmount || 0],
  ];
}
