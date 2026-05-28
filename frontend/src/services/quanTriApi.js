// Chức năng: Hàm gọi API quản trị khách hàng và vận hành.
import ketNoiApi from './ketNoiApi';

export async function layTongQuanQuanTriApi() {
  const response = await ketNoiApi.get('/admin/overview');
  return response.data.data;
}

export async function layDanhSachKhachHangAdminApi(params = {}) {
  const response = await ketNoiApi.get('/admin/customers', { params });
  return response.data.data;
}

export async function taoKhachHangAdminApi(payload) {
  const response = await ketNoiApi.post('/admin/customers', payload);
  return response.data.data;
}

export async function layChiTietKhachHangAdminApi(customerId) {
  const response = await ketNoiApi.get(`/admin/customers/${customerId}`);
  return response.data.data;
}

export async function capNhatKhachHangAdminApi(customerId, payload) {
  const response = await ketNoiApi.patch(`/admin/customers/${customerId}`, payload);
  return response.data.data;
}

export async function capNhatTrangThaiKhachHangAdminApi(customerId, status) {
  const response = await ketNoiApi.patch(`/admin/customers/${customerId}/status`, { status });
  return response.data.data;
}

export async function xoaKhachHangAdminApi(customerId) {
  const response = await ketNoiApi.delete(`/admin/customers/${customerId}`);
  return response.data.data;
}
