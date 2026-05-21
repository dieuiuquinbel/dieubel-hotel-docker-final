import ketNoiApi from './ketNoiApi';

export async function layDanhSachPhong(queryString = '') {
  const suffix = queryString ? `?${queryString}` : '';
  const response = await ketNoiApi.get(`/rooms${suffix}`);
  return response.data;
}

export async function layPhongNoiBat(limit = 4) {
  const response = await ketNoiApi.get(`/rooms/featured?limit=${limit}`);
  return response.data.data;
}

export async function layPhongTheoId(roomId) {
  const response = await ketNoiApi.get(`/rooms/${roomId}`);
  return response.data.data;
}

export async function taoPhongAdminApi(payload) {
  const response = await ketNoiApi.post('/admin/rooms', payload);
  return response.data.data;
}
