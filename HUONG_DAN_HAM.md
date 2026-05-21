# Hướng Dẫn Hàm Và API

Tài liệu này chỉ giữ các API và hàm cần biết khi sửa code.

## 1. API chính

### Xác thực

| API | Mục đích |
| --- | --- |
| `POST /api/auth/register` | Đăng ký và tạo OTP |
| `POST /api/auth/verify-email` | Xác minh OTP |
| `POST /api/auth/login` | Đăng nhập |
| `GET /api/auth/me` | Lấy user hiện tại |

### Phòng và voucher

| API | Mục đích |
| --- | --- |
| `GET /api/rooms` | Danh sách phòng |
| `GET /api/rooms/featured` | Phòng nổi bật |
| `GET /api/rooms/:id` | Chi tiết phòng |
| `GET /api/vouchers` | Voucher công khai |
| `GET /api/me/vouchers` | Voucher của user |
| `POST /api/me/vouchers` | Lưu voucher |

### Đặt phòng

| API | Mục đích |
| --- | --- |
| `POST /api/bookings` | Tạo booking, trừ tồn kho phòng |
| `GET /api/bookings/my` | Booking của user |
| `PATCH /api/bookings/:id/status` | Khách cập nhật trạng thái được phép |
| `POST /api/bookings/:id/payments/confirm` | Xác nhận thanh toán demo |
| `POST /api/bookings/:id/refund-requests` | Tạo yêu cầu hủy/hoàn tiền |
| `POST /api/bookings/:id/feedbacks` | Gửi phản hồi booking |

### Trang cá nhân

| API | Mục đích |
| --- | --- |
| `GET /api/me/refund-requests` | Yêu cầu hoàn tiền của user |
| `GET /api/me/support-tickets` | Khiếu nại/hỗ trợ của user |
| `POST /api/me/support-tickets` | Gửi khiếu nại/hỗ trợ |

### Admin

| API | Mục đích |
| --- | --- |
| `GET /api/admin/overview` | Dashboard |
| `GET /api/admin/bookings` | Danh sách booking |
| `PATCH /api/admin/bookings/:id/status` | Đổi trạng thái booking |
| `POST /api/admin/bookings/:id/payments/confirm` | Admin xác nhận thanh toán |
| `PATCH /api/admin/bookings/:id/note` | Lưu ghi chú admin |
| `GET /api/admin/customers` | Danh sách khách hàng |
| `PATCH /api/admin/customers/:id` | Sửa khách hàng |
| `PATCH /api/admin/customers/:id/status` | Khóa/mở khóa khách |
| `DELETE /api/admin/customers/:id` | Xóa hoặc khóa khách |
| `GET /api/admin/refund-requests` | Yêu cầu hoàn tiền |
| `PATCH /api/admin/refund-requests/:id` | Duyệt hoàn tiền |
| `GET /api/admin/support-tickets` | Khiếu nại/hỗ trợ |
| `PATCH /api/admin/support-tickets/:id` | Phản hồi hỗ trợ |
| `GET /api/admin/revenue-report` | Báo cáo doanh thu |
| `GET /api/admin/invoices` | Danh sách hóa đơn |

## 2. Service backend cần biết

| File | Hàm quan trọng |
| --- | --- |
| `xacThuc.service.js` | `dangKyTaiKhoan`, `xacMinhOtpEmail`, `dangNhapTaiKhoan`, `timNguoiDungTheoId` |
| `phong.service.js` | `layDanhSachPhong`, `layPhongNoiBat`, `layPhongTheoId` |
| `datPhong.service.js` | `taoDatPhong`, `layDanhSachHoaDon`, `layHoaDonTheoId` |
| `quanLyDatPhong.service.js` | `layTatCaDatPhong`, `xacNhanThanhToan`, `taoYeuCauHoanTien`, `capNhatYeuCauHoanTien`, `layBaoCaoDoanhThu` |
| `quanTri.service.js` | `layTongQuanQuanTri`, `layDanhSachKhachHang`, `capNhatTrangThaiKhachHang`, `xoaKhachHang` |

Admin mặc định được xử lý trong `taoHoacCapNhatQuanTriMacDinh()`:

- Username: `admin`
- Password: `admin123`
- Chỉ giữ một tài khoản `role = admin`

## 3. Frontend cần biết

| File | Vai trò |
| --- | --- |
| `UngDung.jsx` | Route chính, chặn admin vào giao diện khách |
| `DangNhapDangKy.jsx` | Admin đăng nhập xong về `/admin/overview` |
| `DauTrang.jsx` | Header công khai cho khách hàng |
| `AdminLayout.jsx` | Layout riêng của admin |
| `DatPhong.jsx` | Form tạo booking |
| `DatPhongCuaToi.jsx` | Thanh toán, voucher, hoàn tiền |
| `TaiKhoan.jsx` | Hồ sơ, hỗ trợ, kho voucher |
| `QuanLyDatPhong.jsx` | Admin duyệt booking |
| `AdminCustomers.jsx` | Admin quản lý khách |
| `AdminOperations.jsx` | Hoàn tiền, hỗ trợ, báo cáo |

## 4. Quy tắc sửa nhanh

- Sửa API frontend trước trong `frontend/src/services`.
- Tìm route backend trong `backend/src/ungDung.js`.
- Logic nghiệp vụ nằm trong `backend/src/services`.
- Nếu đụng database, kiểm tra `database/*.sql` và bảng MySQL thật.
