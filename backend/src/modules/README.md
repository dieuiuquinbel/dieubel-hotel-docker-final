# Cấu trúc `backend/src/modules`

Mỗi module là một nhóm nghiệp vụ độc lập tương đối.

## `auth/`

- `xacThuc.service.js`  
  Xử lý đăng ký, đăng nhập, OTP email, tài khoản admin mặc định và ký JWT.

## `bookings/`

- `datPhong.service.js`  
  Tạo đơn đặt phòng, khóa tồn kho, đọc hóa đơn từ booking.

- `quanLyDatPhong.service.js`  
  Quản lý trạng thái đơn, thanh toán, hoàn tiền, hỗ trợ khách và báo cáo doanh thu.

## `rooms/`

- `phong.service.js`  
  Lấy danh sách phòng, chi tiết phòng, phòng nổi bật và thêm phòng từ admin.

## `vouchers/`

- `voucher.service.js`  
  Lấy voucher đang dùng, voucher của người dùng và lưu voucher cho người dùng.

## `admin/`

- `quanTri.service.js`  
  Tổng quan admin, danh sách khách hàng, chi tiết khách hàng, tạo/sửa/xóa/khóa khách hàng.

## `payments/`

- `thanhToan.service.js`  
  Hỗ trợ ghi lịch sử cho luồng thanh toán demo. Route này hiện bị tắt mặc định bằng env.

## `notifications/`

- `thuDienTu.service.js`  
  Gửi email OTP, email xác nhận và email nghiệp vụ khác.

## `invoices/`

- `hoaDon.service.js`  
  Đọc và trả dữ liệu hóa đơn cho admin hoặc khách.

## `system/`

- `cauTrucVanHanh.service.js`  
  Các hàm kiểm tra/cấu trúc hỗ trợ chung để backend chạy ổn định.
