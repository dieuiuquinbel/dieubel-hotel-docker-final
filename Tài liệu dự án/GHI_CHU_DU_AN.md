# Ghi chú dự án và luồng vận hành

Tài liệu này ghi lại luồng dữ liệu, nghiệp vụ quan trọng, nguyên tắc vận hành và các chỉnh sửa gần đây của dự án StayNest / DieuBel.

## 1. Mục tiêu hệ thống

Dự án phục vụ hai nhóm người dùng:

- Khách hàng: tìm phòng, xem chi tiết, đặt phòng, thanh toán, dùng voucher và xem lịch sử đặt phòng.
- Admin: quản lý đơn, phòng, khách hàng, hóa đơn, doanh thu, marketing và dữ liệu vận hành.

Hệ thống cần đảm bảo dữ liệu đặt phòng nhất quán, thao tác admin có thể truy vết và giao diện phản hồi rõ ràng khi thành công hoặc lỗi.

## 2. Luồng khởi động ứng dụng

```text
Người dùng mở trình duyệt
→ Vite hoặc static server trả frontend
→ React mount UngDung.jsx
→ React Router chọn trang phù hợp
→ React Query/Axios gọi API khi trang cần dữ liệu
→ Backend Express xử lý request
→ MySQL trả dữ liệu
→ Frontend render lại UI
```

File liên quan:

- `frontend/src/main.jsx`
- `frontend/src/app/UngDung.jsx`
- `backend/src/mayChu.js`
- `backend/src/ungDung.js`

## 3. Luồng đăng nhập

```text
Form đăng nhập
→ xacThucApi.js
→ ketNoiApi.js gửi request Axios
→ backend auth service kiểm tra email/password
→ bcrypt so mật khẩu
→ backend sinh JWT
→ frontend lưu user/token vào khoXacThuc.js
→ route bảo vệ cho phép vào tài khoản/admin
```

Khi token hết hạn:

```text
API trả 401
→ Axios response interceptor trong ketNoiApi.js
→ clearSession()
→ người dùng đăng nhập lại
```

## 4. Luồng tìm và xem phòng

```text
Trang chủ hoặc danh sách phòng
→ ThanhTimKiem.jsx lấy điều kiện lọc
→ phongApi.js gọi API phòng
→ backend phong.service.js query MySQL
→ frontend nhận danh sách phòng
→ ThePhong.jsx render từng phòng
```

Chi tiết phòng:

```text
Người dùng bấm xem chi tiết
→ route ChiTietPhong.jsx
→ phongApi.js lấy chi tiết phòng
→ backend trả thông tin phòng, ảnh, tiện nghi, giá, tồn kho
→ frontend hiển thị và cho phép đặt phòng
```

## 5. Luồng tạo đặt phòng

```text
DatPhong.jsx
→ người dùng chọn ngày, số khách, dịch vụ, voucher
→ datPhongApi.js gửi request tạo đơn
→ backend datPhong.service.js mở transaction
→ SELECT phòng FOR UPDATE
→ kiểm tra tồn kho thực tế
→ trừ inventory_count
→ tạo booking/payment/status log
→ commit transaction
→ frontend hiển thị kết quả và thông báo toàn cục
```

Điểm cần giữ:

- Luôn kiểm tra dữ liệu đầu vào ở backend, không chỉ tin vào frontend.
- Dùng transaction cho nghiệp vụ đặt phòng.
- Khóa dòng phòng bằng `FOR UPDATE` trước khi trừ tồn kho.
- Rollback khi thiếu phòng, voucher không hợp lệ hoặc dữ liệu không đạt điều kiện.

## 6. Luồng thanh toán

```text
Đơn đặt phòng được tạo
→ frontend hiển thị thông tin thanh toán hoặc VietQR
→ người dùng hoặc admin xác nhận thanh toán
→ thanhToan.service.js cập nhật payment
→ booking đổi trạng thái phù hợp
→ frontend refetch dữ liệu đơn
```

File liên quan:

- `frontend/src/components/bookings/my-bookings/MyBookingsVietQr.jsx`
- `frontend/src/utils/vietQr.js`
- `backend/src/modules/payments/thanhToan.service.js`

## 7. Luồng lịch sử đặt phòng của khách

```text
DatPhongCuaToi.jsx
→ useDatPhongCuaToi.js gọi API
→ datPhongApi.js gửi token
→ backend kiểm tra user từ JWT
→ trả danh sách booking của user
→ MyBookingsPageParts.jsx render trạng thái loading/error/empty/header/tabs
→ các component QR/progress render chi tiết
```

Phần này đã được tách lại để trang chính ngắn hơn:

- UI phụ chuyển sang `MyBookingsPageParts.jsx`.
- Helper chuyển sang `myBookingsHelpers.js`.

## 8. Luồng quản trị đặt phòng

```text
Admin đăng nhập
→ TuyenDuongBaoVe.jsx kiểm tra quyền
→ QuanLyDatPhong.jsx tải danh sách đơn
→ quanLyDatPhong.service.js trả dữ liệu tổng hợp
→ admin duyệt, từ chối, hủy hoặc hoàn tiền
→ backend cập nhật booking/payment/refund/status log
→ frontend refetch danh sách và chi tiết
```

Component chính:

- `BookingQueueItem.jsx`: một dòng đơn trong hàng đợi.
- `BookingDetail.jsx`: panel chi tiết và nút thao tác.
- `BookingShared.jsx`: badge/trạng thái dùng chung.
- `bookingHelpers.js`: helper định dạng dữ liệu đơn.

## 9. Luồng hóa đơn

```text
Booking đủ điều kiện
→ backend hoaDon.service.js tạo HTML hóa đơn
→ lưu vào Hóa đơn admin hoặc thư mục được cấu hình
→ Express phục vụ static invoice
→ admin mở/xem hóa đơn từ frontend
```

Ghi chú:

- `hoaDon.service.js` đã được sửa lỗi syntax dư dấu `}`.
- `ungDung.js` đã cấu hình phục vụ thư mục hóa đơn để admin mở file ổn định hơn.

## 10. Luồng voucher

```text
Frontend lấy voucher công khai hoặc voucher của tôi
→ voucherApi.js
→ backend voucher.service.js
→ MySQL kiểm tra điều kiện
→ frontend hiển thị voucher khả dụng
→ khi đặt phòng, voucher được gửi kèm booking request
```

Backend vẫn là nơi quyết định voucher có hợp lệ hay không. Frontend chỉ nên dùng dữ liệu voucher để hỗ trợ hiển thị và chọn mã.

## 11. Luồng thông báo toàn cục

```text
Một page/component cần báo thành công hoặc lỗi
→ gọi store khoThongBao.js
→ BoThongBaoToanCuc.jsx đang render ở UngDung.jsx nhận state
→ toast hiển thị trên toàn app
→ tự đóng hoặc người dùng đóng
```

Lợi ích:

- Không phải tạo thông báo riêng ở từng page.
- Trạng thái lỗi/thành công thống nhất hơn.
- Các page chỉ cần gọi store, không phải tự quản lý UI toast.

## 12. Luồng dữ liệu localStorage

Frontend có một số dữ liệu cục bộ:

- `khoXacThuc.js`: user/token.
- `lichSuTimKiem.js`: lịch sử tìm kiếm.
- `lichSuXemPhong.js`: phòng đã xem.
- `lichSuDatPhong.js`: dữ liệu phụ trợ hoặc lịch sử local nếu cần.
- `khoaLuuTru.js`: gom key localStorage để tránh đặt tên rải rác.

## 13. Ghi chú vận hành

- Không xóa `node_modules` nếu mục tiêu chỉ là dọn tài liệu hoặc đọc code. Đây là thư mục thư viện cần để chạy dự án.
- Khi thay đổi nghiệp vụ đặt phòng, cần kiểm tra cả frontend, backend và database vì luồng này ảnh hưởng tồn kho, thanh toán và lịch sử trạng thái.
- Khi thêm thao tác admin quan trọng, nên ghi audit log hoặc status log để dễ kiểm tra lại.
- Khi sửa API, cần kiểm tra file service tương ứng ở frontend để tránh lệch tên field hoặc endpoint.
- Khi sửa giao diện admin, nên kiểm tra cả trạng thái loading, empty, error và dữ liệu thật.

## 14. Các chỉnh sửa gần đây

- Sửa lỗi syntax backend trong `backend/src/modules/invoices/hoaDon.service.js`.
- Bổ sung import và cấu hình thư mục hóa đơn trong `backend/src/ungDung.js`.
- Thêm hệ thống thông báo toàn cục ở frontend bằng `khoThongBao.js` và `BoThongBaoToanCuc.jsx`.
- Tách bớt code trang `DatPhongCuaToi.jsx` sang `MyBookingsPageParts.jsx` và `myBookingsHelpers.js`.
- Xóa block đánh giá khách hàng bị trùng ở trang chủ.
- Xóa dữ liệu đánh giá cũ không còn dùng trong `trangChuData.js`.
- Gỡ các dòng eslint-disable không còn hợp lệ.
- Thêm ghi chú ngắn ở đầu các file `.js/.jsx` để dễ nhận biết chức năng file.
- Xóa thư mục rỗng không cần thiết.
- Gộp tài liệu `.md` ở thư mục gốc vào 3 file trong `Tài liệu dự án/`.
