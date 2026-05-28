// Chức năng: Cấu hình Axios chung và interceptor token.
// Cau hinh Axios dung chung cho moi request tu frontend den backend API.
import axios from 'axios';
import useKhoXacThuc from '../store/khoXacThuc';

const ketNoiApi = axios.create({
  baseURL: '/api',
});

ketNoiApi.interceptors.request.use((config) => {
  const token = useKhoXacThuc.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

ketNoiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && useKhoXacThuc.getState().token) {
      useKhoXacThuc.getState().clearSession();
    }

    return Promise.reject(error);
  }
);

export default ketNoiApi;
