# StayNest / DieuBel - Tổng quan dự án

StayNest / DieuBel là hệ thống đặt phòng khách sạn dạng client-server. Dự án gồm giao diện dành cho khách hàng, khu vực quản trị dành cho admin, REST API xử lý nghiệp vụ và cơ sở dữ liệu MySQL lưu trữ thông tin vận hành.

## 1. Thành phần chính

- `frontend/`: React SPA cho khách hàng và quản trị viên.
- `backend/`: Express REST API xử lý xác thực, phòng, đặt phòng, thanh toán, hóa đơn, voucher và báo cáo quản trị.
- `database/`: SQL và ghi chú cơ sở dữ liệu.
- `Hóa đơn admin/`: thư mục lưu các hóa đơn HTML được sinh cho admin.
- `Tài liệu dự án/`: nơi lưu tài liệu tổng quan, cấu trúc và ghi chú vận hành.

## 2. Công nghệ sử dụng

Frontend:

- Vite: chạy dev server và build production.
- React: xây dựng giao diện theo component.
- React Router DOM: điều hướng trang.
- TanStack React Query: lấy, cache và đồng bộ dữ liệu API.
- Zustand: lưu trạng thái đăng nhập và thông báo toàn cục.
- Axios: gọi API, tự gắn token và xử lý lỗi đăng nhập.
- Tailwind CSS: dựng giao diện responsive.

Backend:

- Node.js + Express: server API.
- mysql2/promise: kết nối MySQL bằng async/await.
- JWT + bcryptjs: xác thực người dùng.
- multer: xử lý upload ảnh phòng.
- nodemailer: gửi email, OTP và thông báo.

Database:

- MySQL lưu tài khoản, phòng, đặt phòng, thanh toán, voucher, hóa đơn, audit log và các dữ liệu nghiệp vụ liên quan.

## 3. Chức năng chính

Khu vực khách hàng:

- Xem trang chủ, danh sách phòng và chi tiết phòng.
- Tìm kiếm, lọc phòng và xem phòng nổi bật.
- Đăng ký, đăng nhập, xác thực OTP và quản lý hồ sơ.
- Tạo đặt phòng, áp voucher, thanh toán và xem lịch sử đặt phòng.
- Nhận thông báo trạng thái đặt phòng và thanh toán.

Khu vực admin:

- Xem dashboard tổng quan.
- Quản lý đơn đặt phòng, duyệt đơn, từ chối, hủy và hoàn tiền.
- Quản lý phòng, khách hàng, hóa đơn, doanh thu, marketing và vận hành.
- Theo dõi audit log và các trạng thái xử lý nghiệp vụ.

## 4. Cách chạy dự án

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

## 5. Tài liệu liên quan

- `README.md`: tổng quan dự án, công nghệ, chức năng và cách chạy.
- `CAU_TRUC_CHUONG_TRINH.md`: cấu trúc thư mục, file chính và vai trò từng module.
- `GHI_CHU_DU_AN.md`: luồng dữ liệu, nghiệp vụ quan trọng, ghi chú vận hành và các chỉnh sửa gần đây.
- `database/README.md`: ghi chú riêng cho cơ sở dữ liệu.

## 6. Tóm tắt phân tích hệ thống

Hệ thống được tổ chức theo mô hình frontend gọi API backend, backend xử lý nghiệp vụ và truy vấn MySQL. Frontend chịu trách nhiệm hiển thị, điều hướng và giữ trạng thái phiên người dùng. Backend chịu trách nhiệm xác thực, kiểm tra quyền, kiểm tra dữ liệu, xử lý transaction đặt phòng và trả kết quả thống nhất cho frontend.

Điểm quan trọng nhất của dự án là nghiệp vụ đặt phòng. Khi khách tạo đơn, backend cần kiểm tra ngày nhận/trả phòng, số khách, phòng, voucher, thanh toán và tồn kho thực tế. Phần đặt phòng sử dụng transaction và khóa dòng phòng bằng `SELECT ... FOR UPDATE` để giảm rủi ro hai người đặt vượt số phòng còn lại.

Khu vực admin được tách theo nhóm nghiệp vụ để dễ quản lý: đặt phòng, phòng, khách hàng, hóa đơn, doanh thu, marketing và vận hành. Các thao tác quan trọng nên tiếp tục ghi log trạng thái để có thể truy vết khi cần kiểm tra đơn hoặc báo cáo.
