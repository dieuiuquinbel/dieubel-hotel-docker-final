// Chức năng: Middleware kiểm tra JWT và gắn user vào request.
// Middleware xác thực JWT.
// File này đọc access token, nạp user hiện tại và chặn request chưa đăng nhập.
const jwt = require('jsonwebtoken');
const { timNguoiDungTheoId } = require('../modules/auth/xacThuc.service');

const KHOA_BI_MAT_JWT = process.env.JWT_SECRET || 'staynest_dev_secret_change_me';

async function yeuCauDangNhap(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Thiếu access token.',
      });
    }

    const token = authorization.slice(7);
    const payload = jwt.verify(token, KHOA_BI_MAT_JWT);
    const user = await timNguoiDungTheoId(payload.sub);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        message: 'Phiên đăng nhập không còn hợp lệ.',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    });
  }
}

module.exports = {
  yeuCauDangNhap,
};
