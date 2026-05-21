import ketNoiApi from './ketNoiApi';

export async function taoDatPhong(payload) {
  const response = await ketNoiApi.post('/bookings', payload);
  return response.data.data;
}

export async function layDatPhongCuaToiApi() {
  const response = await ketNoiApi.get('/bookings/my');
  return response.data.data;
}

export async function layTatCaDatPhongAdminApi() {
  const response = await ketNoiApi.get('/admin/bookings');
  return response.data.data;
}

export async function capNhatTrangThaiDatPhongApi(bookingId, status, note) {
  const response = await ketNoiApi.patch(`/bookings/${bookingId}/status`, { status, note });
  return response.data.data;
}

export async function capNhatTrangThaiDatPhongAdminApi(bookingId, status, note) {
  const response = await ketNoiApi.patch(`/admin/bookings/${bookingId}/status`, { status, note });
  return response.data.data;
}

export async function xacNhanThanhToanDatPhongApi(bookingId, method, paymentCode, voucherCode) {
  const response = await ketNoiApi.post(`/bookings/${bookingId}/payments/confirm`, { method, paymentCode, voucherCode });
  return response.data.data;
}

export async function xacNhanThanhToanAdminApi(bookingId, method, paymentCode, voucherCode) {
  const response = await ketNoiApi.post(`/admin/bookings/${bookingId}/payments/confirm`, { method, paymentCode, voucherCode });
  return response.data.data;
}

export async function luuGhiChuAdminApi(bookingId, note) {
  const response = await ketNoiApi.patch(`/admin/bookings/${bookingId}/note`, { note });
  return response.data.data;
}

export async function taoYeuCauHoanTienApi(bookingId, payload) {
  const response = await ketNoiApi.post(`/bookings/${bookingId}/refund-requests`, payload);
  return response.data.data;
}

export async function layYeuCauHoanTienCuaToiApi() {
  const response = await ketNoiApi.get('/me/refund-requests');
  return response.data.data;
}

export async function guiYeuCauHoTroApi(payload) {
  const response = await ketNoiApi.post('/me/support-tickets', payload);
  return response.data.data;
}

export async function layYeuCauHoTroCuaToiApi() {
  const response = await ketNoiApi.get('/me/support-tickets');
  return response.data.data;
}

export async function layYeuCauHoanTienAdminApi() {
  const response = await ketNoiApi.get('/admin/refund-requests');
  return response.data.data;
}

export async function capNhatYeuCauHoanTienAdminApi(refundId, status, note) {
  const response = await ketNoiApi.patch(`/admin/refund-requests/${refundId}`, { status, note });
  return response.data.data;
}

export async function layYeuCauHoTroAdminApi() {
  const response = await ketNoiApi.get('/admin/support-tickets');
  return response.data.data;
}

export async function capNhatYeuCauHoTroAdminApi(ticketId, status, reply) {
  const response = await ketNoiApi.patch(`/admin/support-tickets/${ticketId}`, { status, reply });
  return response.data.data;
}

export async function layBaoCaoDoanhThuAdminApi(params = {}) {
  const response = await ketNoiApi.get('/admin/revenue-report', {
    params,
  });
  return response.data.data;
}
