export function dinhDangTien(value) {
  return Number(value || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
}

function thanhNgayNoiDia(year, month, day) {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function docNgay(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return thanhNgayNoiDia(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dinhDangNgay(value) {
  const date = docNgay(value);
  if (!date) return value || '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export function dinhDangNgayGio(value) {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${dinhDangNgay(date)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function chuyenNgayHienThiSangIso(value) {
  if (!value) return '';

  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const date = thanhNgayNoiDia(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
    return date ? text : '';
  }

  const displayMatch = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (!displayMatch) return '';

  const day = Number(displayMatch[1]);
  const month = Number(displayMatch[2]);
  const yearText = displayMatch[3];
  const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText);
  const date = thanhNgayNoiDia(year, month, day);
  if (!date) return '';

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
