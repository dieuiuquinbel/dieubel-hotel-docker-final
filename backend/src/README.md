# Cấu trúc `backend/src`

Đây là mã nguồn backend Express.

## Chức năng từng file/thư mục

### File gốc

- `mayChu.js`  
  Điểm khởi động backend: nạp `.env`, chuẩn bị tài khoản admin mặc định và mở cổng HTTP.

- `ungDung.js`  
  Nơi lắp toàn bộ middleware, route công khai, route khách hàng và route quản trị.

### `config/`

- `coSoDuLieu.js`  
  Tạo pool kết nối MySQL dùng chung cho toàn backend.

### `middleware/`

- `xacThuc.middleware.js`  
  Kiểm tra JWT và nạp `req.user`.

### `modules/`

Mỗi thư mục con là một nhóm nghiệp vụ:

- `auth/`: đăng nhập, đăng ký, OTP, JWT
- `bookings/`: tạo đơn, đổi trạng thái, báo cáo doanh thu
- `rooms/`: danh sách phòng, chi tiết phòng, thêm phòng
- `vouchers/`: danh sách voucher, lưu voucher
- `admin/`: tổng quan và quản lý khách hàng
- `payments/`: luồng hỗ trợ thanh toán demo
- `notifications/`: gửi email
- `invoices/`: xuất và xem hóa đơn
- `system/`: hàm kiểm tra/cấu trúc hỗ trợ chung
