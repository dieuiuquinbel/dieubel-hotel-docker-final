# Cấu trúc `frontend/src`

Thư mục này là toàn bộ mã nguồn React.

## Các nhóm chính

### `app/`

Chứa bộ điều phối chính của frontend.

- `UngDung.jsx`: nơi khai báo route, gắn layout khách hàng/admin, đồng bộ phiên đăng nhập.

### `components/`

Chứa các khối giao diện dùng lại.

- `admin/`: component dùng riêng cho khu vực quản trị.
  - `bookings/`: hàng đợi đơn, panel chi tiết, helper đặt phòng.
  - `customers/`: danh sách khách, form tạo khách, panel chi tiết.
  - `rooms/`: danh sách phòng, form tạo phòng, helper kho phòng.
- `auth/`: chặn route hoặc hỗ trợ đăng nhập.
- `chatbot/`: chatbot nội bộ.
- `layout/`: header, footer, khung chung.
- `public/home/`: section lớn và dữ liệu tĩnh của trang chủ.
- `rooms/`: card phòng, bộ lọc đang dùng.
- `search/`: thanh tìm kiếm và bộ lọc tìm phòng.

### `pages/`

Chứa màn hình hoàn chỉnh theo từng khu vực.

- `public/`: trang công khai.
- `rooms/`: danh sách phòng, chi tiết phòng.
- `bookings/`: tạo đơn, xem đơn của tôi.
- `account/`: tài khoản, lịch sử.
- `auth/`: đăng nhập, đăng ký, OTP.
- `admin/`: giao diện quản trị.

### `services/`

Chứa các hàm gọi API.  
Quy ước: mỗi file chỉ chuyên giao tiếp với backend, không chứa layout.

### `store/`

Chứa state chung của frontend.

- `khoXacThuc.js`: lưu token và thông tin user.

### `utils/`

Chứa hàm tiện ích:

- định dạng ngày, tiền,
- ánh xạ trạng thái,
- xử lý local storage,
- dựng QR,
- xử lý media local.

## Gợi ý đọc code

Nếu cần hiểu frontend từ đầu:

1. `main.jsx`
2. `app/UngDung.jsx`
3. `pages/admin/*` hoặc `pages/public/*` tùy khu vực cần tìm
4. `components/admin/*` hoặc `components/public/home/*` nếu page đã được tách nhỏ
5. `services/*`
6. `utils/*`
