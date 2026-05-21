import ketNoiApi from './ketNoiApi';

export async function layDanhSachVoucherApi() {
  const response = await ketNoiApi.get('/vouchers');
  return response.data.data;
}

export async function layKhoVoucherApi() {
  const response = await ketNoiApi.get('/me/vouchers');
  return response.data.data;
}

export async function luuVoucherApi(code) {
  const response = await ketNoiApi.post('/me/vouchers', { code });
  return response.data.data;
}
