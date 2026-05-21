# DieuBel Hotel Booking

Đây là bản `final` của đồ án đặt phòng khách sạn, gồm:

- `frontend`: giao diện khách hàng và giao diện quản trị.
- `backend`: API Express + MySQL.
- `database`: schema, seed và các file migration SQL.

## 1. Kiến trúc tổng quan

```text
Frontend React
  -> gọi API qua src/services/*
  -> route chính nằm ở frontend/src/app/UngDung.jsx

Backend Express
  -> route chính nằm ở backend/src/ungDung.js
  -> mỗi nhóm nghiệp vụ tách trong backend/src/modules/*

MySQL
  -> schema và seed nằm trong database/*
```

## 2. Cấu trúc thư mục chính

```text
frontend/
  src/
    app/            Bộ điều phối route và layout gốc
    components/     Thành phần UI dùng lại
    pages/          Trang theo từng khu vực
    services/       Hàm gọi API
    store/          Trạng thái đăng nhập
    utils/          Hàm tiện ích

backend/
  src/
    config/         Kết nối DB
    middleware/     Middleware xác thực
    modules/        Nghiệp vụ theo từng nhóm
    mayChu.js       Điểm khởi động backend
    ungDung.js      Khai báo toàn bộ route API

database/
  *.sql             Schema, seed và migration
```

## 3. Quy ước đọc code

### Frontend

- `pages/*`: mỗi file là một màn hình lớn.
- `components/*`: phần UI có thể ghép lại.
- `services/*`: chỉ chuyên gọi API, không chứa layout.
- `utils/*`: chỉ chứa hàm tiện ích, định dạng, ánh xạ trạng thái, xử lý local.

### Backend

- `ungDung.js`: nơi khai báo route.
- `modules/*/*.service.js`: nơi chứa logic nghiệp vụ.
- `middleware/*`: nơi xử lý xác thực hoặc kiểm tra request.

## 4. Những gì đã được dọn trong pass cuối

- Bỏ query thừa `recentBookings` khỏi admin overview.
- Thu gọn module `Marketing` về đúng phần có dữ liệu thật là `Voucher`.
- Khóa route thanh toán demo riêng bằng env:
  - `ENABLE_DEMO_PAYMENT=false`
- Ẩn gợi ý OTP dev khỏi UI thường:
  - `ALLOW_DEV_OTP_HINT=false`
- Tách trang `Khách hàng`, `Đơn đặt phòng`, `Quản lý phòng`, `Trang chủ` thành các component con để dễ sửa tiếp.

## 5. Trạng thái dữ liệu hiện tại

Hệ thống hiện dùng dữ liệu thật từ MySQL cho các phần:

- `users`
- `rooms`
- `bookings`
- `refund_requests`
- `support_tickets`
- `vouchers`

Những phần còn mang tính nội dung trình bày tĩnh chủ yếu nằm ở `frontend/src/components/public/home/trangChuData.js`.

## 6. Chạy dự án

### Chạy backend

```powershell
cd backend
npm install
npm run dev
```

### Chạy frontend

```powershell
cd frontend
npm install
npm run dev
```

### Địa chỉ mặc định

```text
Frontend: http://localhost:5714
Backend:  http://localhost:5000
```

## 7. File nên đọc đầu tiên

Nếu cần hiểu nhanh toàn bộ chương trình, nên đọc theo thứ tự:

1. [frontend/src/app/UngDung.jsx](D:/Website khách sạn final/frontend/src/app/UngDung.jsx)
2. [backend/src/ungDung.js](D:/Website khách sạn final/backend/src/ungDung.js)
3. [frontend/src/pages/admin/README.md](D:/Website khách sạn final/frontend/src/pages/admin/README.md)
4. [frontend/src/components/public/home/README.md](D:/Website khách sạn final/frontend/src/components/public/home/README.md)
5. [backend/src/modules/README.md](D:/Website khách sạn final/backend/src/modules/README.md)

## 8. Hướng mở rộng tiếp theo

- Chuyển dữ liệu trình bày ở trang chủ từ dữ liệu tĩnh sang nguồn cấu hình riêng hoặc DB nếu cần quản trị nội dung.
- Làm chức năng sửa phòng, khóa bán/mở bán và đổi phòng cho admin.
- Tách tiếp `AdminRevenue.jsx` và `AdminDashboard.jsx` nếu muốn giảm độ dài file thêm nữa.
- Thêm test cho các luồng:
  - tạo khách hàng,
  - thêm phòng với ảnh local,
  - báo cáo doanh thu theo khoảng ngày.
