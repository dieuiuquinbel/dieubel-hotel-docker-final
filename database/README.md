# Cau truc `database`

Thu muc nay chua file SQL de tao database va nap du lieu mau cho chuong trinh dat phong khach san.

## File nen dung

- `final_database.sql`
  - File SQL final, doc lap.
  - Co the chay tren database trong hoac khi muon reset sach du lieu demo.
  - Da gom `CREATE DATABASE`, `CREATE TABLE` day du, seed phong, dich vu, voucher va anh phong.
  - Khong can chay cac file `01` -> `06` truoc do.

## Cac file cu

- `01_init_schema.sql`
- `02_seed_sample_data.sql`
- `03_add_auth_booking_invoice.sql`
- `03_seed_more_rooms.sql`
- `05_clean_demo_data.sql`
- `06_expand_hotel_booking_system.sql`

Nhung file nay la lich su phat trien/migration trong qua trinh lam chuong trinh. Chung van co gia tri tham khao, nhung voi ban final thi nen uu tien chay `final_database.sql`.

## Cach chay

Mo MySQL Workbench, chon file `final_database.sql`, sau do chay toan bo script.

Luu y: file nay co `DROP TABLE IF EXISTS`, nen neu chay tren database dang co du lieu that thi du lieu cu se bi xoa.
