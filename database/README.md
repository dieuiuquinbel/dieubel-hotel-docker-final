# Cấu trúc `database`

Thư mục này chứa toàn bộ file SQL để dựng schema và nạp dữ liệu mẫu.

## Ý nghĩa các file chính

- `01_init_schema.sql`  
  Tạo schema nền ban đầu.

- `02_seed_sample_data.sql`  
  Nạp dữ liệu mẫu ban đầu cho hệ thống.

- `03_add_auth_booking_invoice.sql`  
  Bổ sung các bảng/cột phục vụ xác thực, booking và hóa đơn.

- `03_seed_more_rooms.sql`  
  Nạp thêm dữ liệu phòng mẫu.

- `05_clean_demo_data.sql`  
  Dọn và nạp lại một số dữ liệu demo.  
  Lưu ý: file này hiện vẫn còn dùng một số ảnh web ngoài, chưa hoàn toàn độc lập với mạng.

- `06_expand_hotel_booking_system.sql`  
  Bổ sung các cột và bảng mở rộng cho hệ thống khách sạn.

## Khuyến nghị

Nếu muốn bản final sạch hơn nữa, nên tách tiếp thành:

- `schema/`
- `seed/`
- `migration/`

để người đọc dễ phân biệt file nào tạo bảng, file nào chỉ là dữ liệu mẫu.
