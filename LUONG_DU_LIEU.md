# Luồng Dữ Liệu

Tài liệu này mô tả ngắn các luồng nghiệp vụ chính.

## 1. Tổng quan

```text
React page
  -> frontend service Axios
  -> Express route
  -> backend service
  -> MySQL
  -> JSON trả về frontend
```

## 2. Đăng nhập

```text
POST /api/auth/login
  -> dangNhapTaiKhoan()
  -> kiểm tra user, mật khẩu, status
  -> ký JWT
  -> frontend lưu token bằng Zustand
```

Sau đăng nhập:

- `role = admin`: luôn về `/admin/overview`, không xem giao diện khách.
- `role = customer`: về trang khách hàng hoặc redirect đang có.

Backend luôn seed một admin duy nhất khi khởi động:

- Username: `admin`
- Password: `admin123`
- Các tài khoản admin khác sẽ bị hạ xuống `customer`

## 3. Đặt phòng

```text
DatPhong.jsx
  -> POST /api/bookings
  -> taoDatPhong()
  -> SELECT rooms FOR UPDATE
  -> kiểm tra inventory_count
  -> UPDATE rooms SET inventory_count = inventory_count - rooms_count
  -> INSERT bookings
  -> tạo hóa đơn
  -> commit transaction
```

Booking mới:

- `booking_status = holding`
- `payment_status = unpaid`
- `deposit_amount = 10%`
- `remaining_amount = total_price`

## 4. Thanh toán và voucher

```text
DatPhongCuaToi.jsx
  -> chọn voucher đủ điều kiện
  -> POST /api/bookings/:id/payments/confirm
  -> xacNhanThanhToan()
  -> tính giảm giá
  -> cập nhật booking
  -> INSERT payment_transactions
  -> INSERT booking_status_logs
```

Voucher không đủ điều kiện sẽ bị vô hiệu hóa ở UI.

## 5. Hủy và hoàn tiền

Đơn chưa thanh toán:

```text
PATCH /api/bookings/:id/status
  -> cancelled
  -> trả rooms_count về rooms.inventory_count
```

Đơn đã thanh toán:

```text
POST /api/bookings/:id/refund-requests
  -> tạo refund_requests
  -> phí hủy 20%
  -> booking_status = cancel_requested
```

Admin duyệt:

```text
PATCH /api/admin/refund-requests/:id
  -> refund approved/completed
  -> booking cancelled
  -> payment refunded
  -> trả phòng về inventory_count
```

## 6. Khiếu nại/hỗ trợ

```text
TaiKhoan.jsx
  -> POST /api/me/support-tickets
  -> INSERT support_tickets

AdminOperations.jsx
  -> GET /api/admin/support-tickets
  -> PATCH /api/admin/support-tickets/:id
```

Khiếu nại chung nằm ở MePage, admin xử lý trong khu vận hành.

## 7. Quản lý khách hàng

```text
AdminCustomers.jsx
  -> GET /api/admin/customers
  -> PATCH /api/admin/customers/:id
  -> DELETE /api/admin/customers/:id
```

Logic xóa:

- Chưa có booking: xóa thật khỏi `users`.
- Đã có booking: khóa `status = inactive` để giữ lịch sử và doanh thu.

## 8. Bảng chính

| Bảng | Vai trò |
| --- | --- |
| `users` | Tài khoản khách/admin |
| `rooms` | Phòng và `inventory_count` |
| `bookings` | Đơn đặt phòng |
| `invoices` | Hóa đơn |
| `vouchers` | Mã ưu đãi |
| `user_vouchers` | Voucher của user |
| `payment_transactions` | Giao dịch thanh toán |
| `booking_status_logs` | Log trạng thái |
| `refund_requests` | Hủy/hoàn tiền |
| `support_tickets` | Khiếu nại/hỗ trợ |
| `admin_audit_logs` | Log thao tác admin |

## 9. Kiểm tra lỗi nhanh

- Không tải được admin booking: kiểm tra `refund_requests`, `support_tickets`, backend và MySQL.
- Admin vẫn thấy giao diện khách: kiểm tra `UngDung.jsx` và `DangNhapDangKy.jsx`.
- Số phòng không giảm: kiểm tra `datPhong.service.js` và `rooms.inventory_count`.
- Xóa khách không mất: nếu khách đã có booking thì đó là khóa mềm, không phải lỗi.
