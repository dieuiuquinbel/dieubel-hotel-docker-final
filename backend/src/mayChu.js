// Chức năng: Nạp môi trường, chuẩn bị admin mặc định và khởi động server.
// Điểm khởi động của backend.
// File này nạp biến môi trường, chuẩn bị tài khoản admin mặc định và mở cổng HTTP.
require('dotenv').config();

const ungDung = require('./ungDung');
const { taoHoacCapNhatQuanTriMacDinh } = require('./modules/auth/xacThuc.service');

const cong = Number(process.env.PORT) || 5000;
let mayChu = null;

function xuLyLoiKhoiDong(error) {
  if (error?.code === 'EADDRINUSE') {
    console.error(`Không thể khởi động backend vì cổng ${cong} đang được tiến trình khác sử dụng.`);
    console.error(`Hãy tắt tiến trình cũ hoặc đổi PORT trong file backend/.env rồi chạy lại.`);
    process.exit(1);
  }

  console.error('Backend khởi động thất bại:', error);
  process.exit(1);
}

async function khoiDongMayChu() {
  try {
    const admin = await taoHoacCapNhatQuanTriMacDinh();
    console.log(`Default admin ready: ${admin.username} / ${admin.email}`);
  } catch (error) {
    console.warn(`Default admin seed skipped: ${error.message}`);
  }

  mayChu = ungDung.listen(cong, () => {
    console.log(`Server is running at http://localhost:${cong}`);
  });

  mayChu.on('error', xuLyLoiKhoiDong);
}

khoiDongMayChu();
