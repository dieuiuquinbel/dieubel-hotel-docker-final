# Cau truc chuong trinh

Tai lieu nay mo ta nhanh cac khoi source code chinh sau khi sap xep lai. Database va du lieu seed duoc giu nguyen.

## Frontend

- `frontend/src/app`: lop dieu phoi ung dung React, khai bao route va layout tong.
- `frontend/src/pages/public`: trang cong khai nhu trang chu.
- `frontend/src/pages/rooms`: danh sach phong va chi tiet phong.
- `frontend/src/pages/bookings`: luong dat phong, dat cho cua toi, thanh toan va tien trinh don.
- `frontend/src/pages/account`: tai khoan, lich su, diem thuong, voucher va ho tro.
- `frontend/src/pages/auth`: dang nhap, dang ky va xac minh OTP.
- `frontend/src/pages/admin`: cac man hinh quan tri.
- `frontend/src/components`: component dung lai theo nhom `layout`, `rooms`, `search`, `auth`, `admin`.
- `frontend/src/services`: cac ham goi backend API.
- `frontend/src/hooks`: custom hook dung chung cho cac trang.
- `frontend/src/store`: kho trang thai frontend.
- `frontend/src/utils`: ham tien ich, dinh dang, localStorage, tinh trang phong, VietQR.

## Backend

- `backend/src/mayChu.js`: diem khoi dong server.
- `backend/src/ungDung.js`: cau hinh Express, middleware va route API.
- `backend/src/config`: ket noi MySQL.
- `backend/src/middleware`: middleware xac thuc/phan quyen.
- `backend/src/modules/auth`: dang nhap, dang ky, OTP, JWT va admin mac dinh.
- `backend/src/modules/rooms`: truy van phong.
- `backend/src/modules/bookings`: tao dat phong va quan ly trang thai don.
- `backend/src/modules/invoices`: tao va tra file hoa don.
- `backend/src/modules/payments`: xu ly thanh toan demo.
- `backend/src/modules/notifications`: gui email.
- `backend/src/modules/vouchers`: ma uu dai va kho voucher.
- `backend/src/modules/admin`: tong quan va quan ly khach hang.
- `backend/src/modules/system`: dam bao cau truc bang/cot mo rong.
