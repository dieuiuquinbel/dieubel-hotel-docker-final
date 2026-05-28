# Cấu trúc chương trình StayNest / DieuBel

Tài liệu này mô tả cấu trúc thư mục và vai trò các file chính trong dự án. Nội dung đã gộp từ tài liệu cấu trúc và hướng dẫn hàm để tránh trùng lặp.

## 1. Thư mục gốc

```text
D:\Website khách sạn final
├─ backend/                    API server Express
├─ frontend/                   React SPA cho khách hàng và admin
├─ database/                   SQL và ghi chú cơ sở dữ liệu
├─ Hóa đơn admin/              File hóa đơn HTML sinh ra cho admin
└─ Tài liệu dự án/             Tài liệu tổng quan, cấu trúc và ghi chú vận hành
```

## 2. Backend

```text
backend/
├─ package.json                Script và thư viện backend
├─ .env                        Biến môi trường kết nối DB, JWT, mail
├─ src/
│  ├─ mayChu.js                Điểm khởi động server Node.js
│  ├─ ungDung.js               Tạo Express app, middleware, route và static files
│  ├─ config/
│  │  └─ coSoDuLieu.js         Tạo MySQL connection pool dùng chung
│  ├─ middleware/
│  │  └─ xacThuc.middleware.js Middleware kiểm tra JWT và quyền admin
│  └─ modules/
│     ├─ admin/                Dashboard, khách hàng, doanh thu, audit log
│     ├─ auth/                 Đăng ký, đăng nhập, OTP, Google auth, hồ sơ
│     ├─ bookings/             Đặt phòng khách và quản lý đặt phòng admin
│     ├─ invoices/             Sinh và phục vụ hóa đơn HTML
│     ├─ notifications/        Gửi email xác thực, đặt phòng và hóa đơn
│     ├─ payments/             Thanh toán, VietQR và trạng thái giao dịch
│     ├─ rooms/                Danh sách phòng, chi tiết phòng, CRUD phòng
│     ├─ system/               API mô tả cấu trúc/vận hành hệ thống
│     └─ vouchers/             Voucher công khai và voucher người dùng
└─ storage/                    Nơi lưu dữ liệu phát sinh nội bộ nếu có
```

### File backend chính

- `backend/src/mayChu.js`: đọc port và gọi `app.listen()`.
- `backend/src/ungDung.js`: cấu hình CORS, JSON parser, static upload, static invoice và đăng ký route API.
- `backend/src/config/coSoDuLieu.js`: tạo pool MySQL bằng `mysql2/promise`.
- `backend/src/middleware/xacThuc.middleware.js`: cung cấp `xacThuc` để verify JWT và `yeuCauAdmin` để chặn người không có quyền admin.

### Module backend

- `auth/xacThuc.service.js`: xử lý đăng ký, đăng nhập, OTP, Google auth, hồ sơ người dùng, hash mật khẩu và phát JWT.
- `bookings/datPhong.service.js`: xử lý đặt phòng của khách, kiểm tra phòng/voucher/ngày/số khách, dùng transaction và `FOR UPDATE` để tránh vượt tồn kho.
- `bookings/quanLyDatPhong.service.js`: API admin để lọc đơn, xem chi tiết, duyệt, từ chối, hủy, hoàn tiền và ghi log trạng thái.
- `payments/thanhToan.service.js`: quản lý trạng thái thanh toán, tạo dữ liệu VietQR hoặc thanh toán giả lập và cập nhật giao dịch.
- `invoices/hoaDon.service.js`: tạo hóa đơn HTML từ dữ liệu đặt phòng và lưu vào thư mục hóa đơn admin.
- `rooms/phong.service.js`: lấy danh sách phòng, chi tiết phòng, phòng nổi bật và CRUD phòng cho admin.
- `vouchers/voucher.service.js`: lấy voucher công khai, kiểm tra điều kiện áp mã và quản lý voucher người dùng sở hữu.
- `admin/quanTri.service.js`: tổng hợp dashboard, khách hàng, phòng, doanh thu và audit log.
- `notifications/thuDienTu.service.js`: gửi OTP, xác nhận đặt phòng và thông báo hóa đơn.
- `system/cauTrucVanHanh.service.js`: cung cấp dữ liệu mô tả hệ thống cho màn hình hoặc tài liệu vận hành.

## 3. Frontend

```text
frontend/
├─ package.json                Script dev/build/lint và thư viện frontend
├─ vite.config.js              Cấu hình Vite
├─ tailwind.config.js          Cấu hình Tailwind
├─ index.html                  HTML gốc của SPA
├─ src/
│  ├─ main.jsx                 Mount React app vào DOM
│  ├─ index.css                CSS global và Tailwind layers
│  ├─ app/                     Router, React Query, layout và toast toàn cục
│  ├─ components/              Component dùng chung và component theo nghiệp vụ
│  ├─ hooks/                   Custom hooks gọi API/cache/localStorage
│  ├─ pages/                   Các trang route chính
│  ├─ services/                Lớp gọi API bằng Axios
│  ├─ store/                   Zustand stores
│  └─ utils/                   Hàm tiện ích định dạng, quyền, localStorage, VietQR
```

### App và route

- `frontend/src/main.jsx`: import CSS global và mount `UngDung` vào `#root`.
- `frontend/src/app/UngDung.jsx`: tạo `QueryClientProvider`, khai báo route khách hàng/admin, gắn layout chung, chatbot, thông báo toàn cục và route bảo vệ.

### Services

- `ketNoiApi.js`: tạo Axios instance, tự gắn Bearer token và xóa phiên khi API trả `401`.
- `xacThucApi.js`: gọi API đăng nhập, đăng ký, OTP, Google auth và hồ sơ.
- `phongApi.js`: gọi API danh sách phòng, chi tiết phòng, phòng nổi bật và dữ liệu phòng admin.
- `datPhongApi.js`: gọi API tạo đặt phòng, lịch sử đơn, thanh toán, hoàn tiền và quản lý đơn admin.
- `quanTriApi.js`: gọi API dashboard, khách hàng, doanh thu, vận hành và audit log.
- `voucherApi.js`: gọi API voucher công khai và voucher của người dùng.

### Store

- `khoXacThuc.js`: lưu user/token bằng Zustand persist, cung cấp `setSession` và `clearSession`.
- `khoThongBao.js`: store thông báo toàn cục để nhiều màn hình dùng chung toast.

### Layout và trang công khai

- `DauTrang.jsx`: header, logo, menu điều hướng và trạng thái đăng nhập.
- `ChanTrang.jsx`: footer và liên kết cuối trang.
- `BangMoiThanhVien.jsx`: modal hoặc khối mời đăng nhập/đăng ký thành viên.
- `BoThongBaoToanCuc.jsx`: đọc `khoThongBao.js` và hiển thị toast thành công/lỗi/cảnh báo/thông tin.
- `TrangChu.jsx`: quản lý hero, popup đánh giá, phòng nổi bật và voucher.
- `HomeSections.jsx`: render các section trang chủ; phần đánh giá bị trùng đã được loại bỏ.
- `trangChuData.js`: dữ liệu tĩnh trang chủ; dữ liệu `DANH_GIA` cũ đã được xóa vì không còn dùng.

### Đặt phòng và phòng

- `DatPhong.jsx`: tạo đơn đặt phòng, chọn dịch vụ, voucher và thanh toán.
- `DatPhongCuaToi.jsx`: xem đơn đặt phòng của khách; phần UI phụ và helper đã được tách ra.
- `MyBookingsPageParts.jsx`: header, tabs, trạng thái loading/error/empty cho trang đặt phòng của tôi.
- `myBookingsHelpers.js`: helper lọc dữ liệu, tính nhãn trạng thái và chuẩn hóa hiển thị.
- `MyBookingsProgress.jsx`, `MyBookingsQrMock.jsx`, `MyBookingsVietQr.jsx`: hiển thị tiến trình đơn, QR mẫu và VietQR.
- `DanhSachPhong.jsx`, `ChiTietPhong.jsx`: danh sách phòng và chi tiết phòng.
- `ThePhong.jsx`, `KhungThePhong.jsx`, `TheBoLocDangDung.jsx`, `ThanhTimKiem.jsx`: thẻ phòng, skeleton, bộ lọc đang dùng và thanh tìm kiếm.

### Tài khoản và admin

- `TaiKhoan.jsx`, `LichSu.jsx`: hồ sơ cá nhân, điểm thưởng, gợi ý đánh giá và lịch sử hoạt động.
- `AdminDashboard.jsx`: số liệu tổng quan.
- `QuanLyDatPhong.jsx`: xử lý đơn đặt phòng admin.
- `AdminRooms.jsx`: quản lý phòng.
- `AdminCustomers.jsx`: quản lý khách hàng.
- `AdminInvoices.jsx`: quản lý hóa đơn.
- `AdminRevenue.jsx`: doanh thu.
- `AdminMarketing.jsx`: marketing.
- `AdminOperations.jsx`: vận hành và audit.

### Hooks và utils

- `useDatPhongCuaToi.js`: lấy danh sách đơn đặt phòng của người dùng.
- `useKhoVoucherCuaToi.js`: lấy voucher người dùng đang sở hữu.
- `useTimKiemGanDay.js`: quản lý lịch sử tìm kiếm gần đây.
- `dinhDang.js`, `duongDan.js`, `khoaLuuTru.js`, `media.js`, `moFileHtml.js`, `phanQuyen.js`, `tinhTrangPhong.js`, `vietQr.js`, `diemThuong.js`: các tiện ích định dạng, đường dẫn, localStorage, media fallback, mở file HTML, phân quyền, trạng thái phòng, VietQR và điểm thưởng.

## 4. Database

```text
database/
├─ README.md                   Ghi chú database
└─ final_database.sql          SQL tổng hợp cơ sở dữ liệu hiện tại
```

Nhóm dữ liệu chính:

- Người dùng và xác thực.
- Phòng và dữ liệu phòng.
- Đặt phòng, lịch sử trạng thái, thanh toán và hoàn tiền.
- Voucher và quyền nhận voucher.
- Hóa đơn và audit log admin.
