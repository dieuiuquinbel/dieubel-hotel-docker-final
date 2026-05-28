// Chức năng: Tạo pool kết nối MySQL dùng chung cho backend.
// Cấu hình pool kết nối MySQL dùng chung cho toàn bộ backend.
const mysql = require('mysql2/promise');

const ketNoiDb = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_booking_db',
  connectTimeout: 5000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = ketNoiDb;
