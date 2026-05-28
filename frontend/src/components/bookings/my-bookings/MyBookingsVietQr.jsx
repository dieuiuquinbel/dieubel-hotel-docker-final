// Chức năng: Hiển thị mã VietQR cho thanh toán đơn đặt phòng.
// Ảnh VietQR dùng cho màn "Đặt phòng của tôi".
// Tách riêng để file trang chính chỉ còn điều phối dữ liệu thanh toán.
import { taoAnhVietQr, daCauHinhVietQr } from '../../../utils/vietQr';

export default function MyBookingsVietQr({ amount, bookingId, paymentMethod, paymentCode }) {
  const qrUrl = taoAnhVietQr({ amount, bookingId, paymentMethod, paymentCode });

  if (!daCauHinhVietQr()) {
    return (
      <div className="grid aspect-square w-full max-w-[220px] place-items-center rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
        <div>
          <p className="text-sm font-black text-amber-800">Chưa cấu hình VietQR</p>
          <p className="mt-2 text-xs leading-5 text-amber-700">
            Điền VITE_VIETQR_BANK_ID, VITE_VIETQR_ACCOUNT_NO, VITE_VIETQR_ACCOUNT_NAME trong frontend .env.
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt={`VietQR thanh toán ${bookingId}`}
      className="aspect-square w-full max-w-[220px] rounded-xl border border-slate-200 bg-white object-contain p-2 shadow-sm"
    />
  );
}
