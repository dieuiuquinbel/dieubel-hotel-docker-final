export function laQuanTriVien(user) {
  if (!user) return false;

  const role = String(user.role || user.vaiTro || '').toLowerCase();

  return role === 'admin' || role === 'quan_tri';
}
