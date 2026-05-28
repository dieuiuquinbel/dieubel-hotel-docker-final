// Chức năng: Nghiệp vụ đăng ký, đăng nhập, OTP và tài khoản admin.
// File này xử lý đăng ký, đăng nhập, OTP email, JWT và tài khoản admin mặc định.
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ketNoiDb = require("../../config/coSoDuLieu");
const {
  daCauHinhGuiMail,
  guiMail,
} = require("../notifications/thuDienTu.service");

const KHOA_BI_MAT_JWT =
  process.env.JWT_SECRET || "staynest_dev_secret_change_me";
const THOI_HAN_JWT = process.env.JWT_EXPIRES_IN || "7d";
const TAI_KHOAN_QUAN_TRI_MAC_DINH = {
  fullName: "Quan tri DieuBel",
  username: "admin",
  email: "admin@dieubel.local",
  password: "admin123",
};
const CHO_PHEP_GOI_Y_DEV_OTP = process.env.ALLOW_DEV_OTP_HINT === "true";

function taoLoi(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function chuanHoaEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function chuanHoaTenDangNhap(username = "") {
  return String(username).trim().toLowerCase();
}

function coTheDungTaiKhoanQuanTriMacDinh(identifier, password) {
  const normalizedIdentifier = String(identifier || "")
    .trim()
    .toLowerCase();
  return (
    String(password || "") === TAI_KHOAN_QUAN_TRI_MAC_DINH.password &&
    normalizedIdentifier === TAI_KHOAN_QUAN_TRI_MAC_DINH.username
  );
}

function taoTenDangNhapDuPhong(fullName = "", email = "") {
  const base =
    chuanHoaTenDangNhap(fullName)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24) ||
    chuanHoaEmail(email).split("@")[0] ||
    "user";

  return `${base}${String(Date.now()).slice(-4)}`;
}

function chuanHoaNguoiDung(row) {
  return {
    id: row.id,
    full_name: row.full_name,
    username: row.username,
    email: row.email,
    phone: row.phone,
    email_verified: Boolean(row.email_verified),
    role: row.role,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function kyToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    KHOA_BI_MAT_JWT,
    {
      expiresIn: THOI_HAN_JWT,
    },
  );
}

async function timNguoiDungTheoEmail(email) {
  const normalizedEmail = chuanHoaEmail(email);
  const [rows] = await ketNoiDb.query(
    `SELECT
        id,
        full_name,
        username,
        email,
        password_hash,
        phone,
        email_verified,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalizedEmail],
  );

  return rows[0] || null;
}

async function timNguoiDungTheoTenDangNhap(username) {
  const normalizedUsername = chuanHoaTenDangNhap(username);
  const [rows] = await ketNoiDb.query(
    `SELECT
        id,
        full_name,
        username,
        email,
        password_hash,
        phone,
        email_verified,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE username = ?
     LIMIT 1`,
    [normalizedUsername],
  );

  return rows[0] || null;
}

async function timNguoiDungTheoDinhDanh(identifier) {
  const value = String(identifier || "")
    .trim()
    .toLowerCase();
  if (!value) return null;

  const [rows] = await ketNoiDb.query(
    `SELECT
        id,
        full_name,
        username,
        email,
        password_hash,
        phone,
        email_verified,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE email = ? OR username = ?
     LIMIT 1`,
    [value, value],
  );

  return rows[0] || null;
}

async function timNguoiDungTheoId(userId) {
  const [rows] = await ketNoiDb.query(
    `SELECT
        id,
        full_name,
        username,
        email,
        phone,
        email_verified,
        role,
        status,
        created_at,
        updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId],
  );

  if (rows.length === 0) {
    return null;
  }

  return chuanHoaNguoiDung(rows[0]);
}

async function taoHoacCapNhatQuanTriMacDinh() {
  const passwordHash = await bcrypt.hash(
    TAI_KHOAN_QUAN_TRI_MAC_DINH.password,
    10,
  );
  const connection = await ketNoiDb.getConnection();

  try {
    await connection.beginTransaction();

    const [existingByUsername] = await connection.query(
      "SELECT id FROM users WHERE username = ? LIMIT 1 FOR UPDATE",
      [TAI_KHOAN_QUAN_TRI_MAC_DINH.username],
    );
    const [existingAdmins] = await connection.query(
      "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC FOR UPDATE",
    );

    let adminId = existingByUsername[0]?.id || existingAdmins[0]?.id || null;

    if (adminId) {
      await connection.query(
        `UPDATE users
         SET full_name = ?,
             username = ?,
             password_hash = ?,
             email_verified = TRUE,
             role = 'admin',
             status = 'active'
         WHERE id = ?`,
        [
          TAI_KHOAN_QUAN_TRI_MAC_DINH.fullName,
          TAI_KHOAN_QUAN_TRI_MAC_DINH.username,
          passwordHash,
          adminId,
        ],
      );
    } else {
      const [result] = await connection.query(
        `INSERT INTO users (full_name, username, email, password_hash, phone, email_verified, role, status)
         VALUES (?, ?, ?, ?, NULL, TRUE, 'admin', 'active')`,
        [
          TAI_KHOAN_QUAN_TRI_MAC_DINH.fullName,
          TAI_KHOAN_QUAN_TRI_MAC_DINH.username,
          TAI_KHOAN_QUAN_TRI_MAC_DINH.email,
          passwordHash,
        ],
      );
      adminId = result.insertId;
    }

    await connection.query(
      `UPDATE users
       SET role = 'customer'
       WHERE role = 'admin' AND id <> ?`,
      [adminId],
    );

    await connection.commit();
    return timNguoiDungTheoId(adminId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function taoOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function bamOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

async function guiOtpXacMinhEmail(user) {
  const otp = taoOtp();
  const otpHash = bamOtp(otp);

  await ketNoiDb.query(
    `INSERT INTO email_otps (user_id, email, otp_hash, expires_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
    [user.id, user.email, otpHash],
  );

  const mailResult = await guiMail({
    to: user.email,
    subject: "Mã xác minh tài khoản StayNest",
    html: `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Xác minh tài khoản StayNest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
  <div style="background-color: #f1f5f9; padding: 40px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0; text-align: left;">
      <!-- Brand Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">StayNest</h1>
        <p style="color: #93c5fd; margin: 5px 0 0 0; font-size: 14px; font-weight: 500;">Nâng niu kỳ nghỉ của bạn</p>
      </div>
      
      <!-- Body Content -->
      <div style="padding: 40px 30px; text-align: center;">
        <div style="display: inline-block; background-color: #eff6ff; border-radius: 50%; padding: 15px; margin-bottom: 20px;">
          <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td style="background-color: #eff6ff; border-radius: 50%; padding: 15px; text-align: center; font-size: 30px; line-height: 1;">
                🛡️
              </td>
            </tr>
          </table>
        </div>
        
        <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 22px; font-weight: 700; text-align: center;">Xác Minh Tài Khoản</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">Cảm ơn bạn đã lựa chọn StayNest. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình đăng ký tài khoản của bạn.</p>
        
        <!-- OTP Box -->
        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <span style="font-size: 36px; font-weight: 800; color: #1e40af; letter-spacing: 6px; display: inline-block; margin-left: 6px;">${otp}</span>
        </div>
        
        <!-- Timeout Badge -->
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 20px; padding: 8px 16px; margin: 0 auto 25px auto; display: inline-block; text-align: center;">
          <span style="color: #d97706; font-size: 13px; font-weight: 600;">⌛ Có hiệu lực trong vòng 10 phút</span>
        </div>
        
        <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5; text-align: center;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với bộ phận hỗ trợ khách hàng để được trợ giúp.</p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 StayNest Hotel Group. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text: `Mã OTP StayNest của bạn là ${otp}. Mã có hiệu lực trong 10 phút.`,
  });

  return {
    mailSkipped: Boolean(mailResult?.skipped),
    devOtp:
      CHO_PHEP_GOI_Y_DEV_OTP &&
      process.env.NODE_ENV !== "production" &&
      !daCauHinhGuiMail()
        ? otp
        : undefined,
  };
}

async function dangKyTaiKhoan({ fullName, username, email, password, phone }) {
  const normalizedEmail = chuanHoaEmail(email);
  const normalizedUsername =
    chuanHoaTenDangNhap(username) || taoTenDangNhapDuPhong(fullName, email);
  const trimmedName = String(fullName || "").trim();
  const trimmedPhone = String(phone || "").trim() || null;

  if (!trimmedName || !normalizedEmail || !password) {
    throw taoLoi(400, "Thieu thong tin bat buoc de dang ky.");
  }

  if (password.length < 6) {
    throw taoLoi(400, "Mat khau can it nhat 6 ky tu.");
  }

  const existingUser = await timNguoiDungTheoEmail(normalizedEmail);

  if (existingUser) {
    throw taoLoi(409, "Email nay da duoc su dung.");
  }

  const existingUsername =
    await timNguoiDungTheoTenDangNhap(normalizedUsername);

  if (existingUsername) {
    throw taoLoi(409, "Ten tai khoan nay da duoc su dung.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await ketNoiDb.query(
    `INSERT INTO users (full_name, username, email, password_hash, phone, email_verified, role, status)
     VALUES (?, ?, ?, ?, ?, FALSE, 'customer', 'active')`,
    [
      trimmedName,
      normalizedUsername,
      normalizedEmail,
      passwordHash,
      trimmedPhone,
    ],
  );

  const user = await timNguoiDungTheoId(result.insertId);
  const otpResult = await guiOtpXacMinhEmail(user);

  return {
    otpRequired: true,
    email: user.email,
    user,
    ...otpResult,
  };
}

async function xacMinhOtpEmail({ email, otp }) {
  const normalizedEmail = chuanHoaEmail(email);

  if (!normalizedEmail || !otp) {
    throw taoLoi(400, "Vui long nhap email va ma OTP.");
  }

  const [rows] = await ketNoiDb.query(
    `SELECT id, user_id
     FROM email_otps
     WHERE email = ?
       AND otp_hash = ?
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizedEmail, bamOtp(otp)],
  );

  if (!rows.length) {
    throw taoLoi(400, "Ma OTP khong dung hoac da het han.");
  }

  await ketNoiDb.query("UPDATE email_otps SET used_at = NOW() WHERE id = ?", [
    rows[0].id,
  ]);
  await ketNoiDb.query("UPDATE users SET email_verified = TRUE WHERE id = ?", [
    rows[0].user_id,
  ]);

  const user = await timNguoiDungTheoId(rows[0].user_id);

  return {
    token: kyToken(user),
    user,
  };
}

async function guiLaiOtpEmail({ email }) {
  const user = await timNguoiDungTheoEmail(email);

  if (!user) {
    throw taoLoi(404, "Khong tim thay tai khoan voi email nay.");
  }

  if (user.email_verified) {
    throw taoLoi(400, "Email nay da duoc xac minh.");
  }

  return {
    email: user.email,
    ...(await guiOtpXacMinhEmail(chuanHoaNguoiDung(user))),
  };
}

async function dangNhapTaiKhoan({ email, identifier, password }) {
  const loginIdentifier = String(identifier || email || "").trim();

  if (!loginIdentifier || !password) {
    throw taoLoi(400, "Vui long nhap email/ten tai khoan va mat khau.");
  }

  if (coTheDungTaiKhoanQuanTriMacDinh(loginIdentifier, password)) {
    const adminUser = await taoHoacCapNhatQuanTriMacDinh();

    return {
      token: kyToken(adminUser),
      user: adminUser,
    };
  }

  const user = await timNguoiDungTheoDinhDanh(loginIdentifier);

  if (!user) {
    throw taoLoi(401, "Email/ten tai khoan hoac mat khau khong dung.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw taoLoi(401, "Email/ten tai khoan hoac mat khau khong dung.");
  }

  if (user.status !== "active") {
    throw taoLoi(403, "Tai khoan nay hien khong hoat dong.");
  }

  const safeUser = chuanHoaNguoiDung(user);

  return {
    token: kyToken(safeUser),
    user: safeUser,
  };
}

module.exports = {
  timNguoiDungTheoId,
  taoHoacCapNhatQuanTriMacDinh,
  dangNhapTaiKhoan,
  dangKyTaiKhoan,
  guiLaiOtpEmail,
  xacMinhOtpEmail,
};
