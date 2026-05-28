// Chức năng: Hàm gọi API đăng nhập, đăng ký và xác minh.
import ketNoiApi from './ketNoiApi';

export async function dangKyTaiKhoan(payload) {
  const response = await ketNoiApi.post('/auth/register', payload);
  return response.data.data;
}

export async function dangNhapTaiKhoan(payload) {
  const response = await ketNoiApi.post('/auth/login', payload);
  return response.data.data;
}

export async function xacMinhOtpEmail(payload) {
  const response = await ketNoiApi.post('/auth/verify-email', payload);
  return response.data.data;
}

export async function guiLaiOtpEmail(payload) {
  const response = await ketNoiApi.post('/auth/resend-otp', payload);
  return response.data.data;
}

export async function layNguoiDungHienTai() {
  const response = await ketNoiApi.get('/auth/me');
  return response.data.data;
}
