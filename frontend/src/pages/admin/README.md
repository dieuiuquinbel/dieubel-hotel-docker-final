# Khu vực `pages/admin`

Đây là nhóm màn hình quản trị.

## Chức năng từng file

- `AdminDashboard.jsx`  
  Màn hình tổng quan vận hành: KPI, cảnh báo, tồn kho, việc cần xử lý.

- `QuanLyDatPhong.jsx`  
  Màn hình quản lý đơn đặt phòng: hàng đợi xử lý, check-in/check-out, hủy/hoàn tiền.  
  File này nay chỉ còn điều phối dữ liệu; phần UI lớn đã tách sang `components/admin/bookings/`.

- `QuanLyDatPhong-TienIch.jsx`  
  Các hàm hoặc thành phần phụ trợ riêng cho trang quản lý đặt phòng.

- `AdminRooms.jsx`  
  Quản lý phòng: xem danh sách phòng, lọc kho và thêm phòng mới.  
  File này nay chỉ còn điều phối dữ liệu; phần UI lớn đã tách sang `components/admin/rooms/`.

- `AdminCustomers.jsx`  
  Quản lý khách hàng: tìm kiếm, tạo tài khoản trực tiếp, sửa thông tin, khóa/xóa.

- `AdminRevenue.jsx`  
  Báo cáo doanh thu theo khoảng thời gian và tổng doanh thu tích lũy.

- `AdminOperations.jsx`  
  Xử lý yêu cầu hoàn tiền và hỗ trợ/khiếu nại.

- `AdminInvoices.jsx`  
  Tra cứu và xem danh sách hóa đơn.

- `AdminMarketing.jsx`  
  Hiện đang chỉ quản lý `Voucher` là phần có dữ liệu thật.

## Quy ước hiện tại

- Page chỉ giữ logic của màn hình.
- Component con nên đặt vào `components/admin/...` nếu đủ lớn để tái sử dụng hoặc cần tách nhỏ để dễ đọc.
- API gọi qua `src/services/quanTriApi.js`, `datPhongApi.js`, `voucherApi.js`.

## Trạng thái cleanup hiện tại

Ba nhóm đã được tách theo module rõ hơn:

1. `components/admin/bookings/`
2. `components/admin/rooms/`
3. `components/admin/customers/`

Phần còn có thể tách tiếp nếu làm thêm một vòng nữa:

- `AdminRevenue.jsx`
- `AdminDashboard.jsx`
