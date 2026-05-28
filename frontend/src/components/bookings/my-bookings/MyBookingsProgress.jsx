// Chức năng: Thanh tiến trình trạng thái của một đơn đặt phòng.
// Thanh tiến trình đặt phòng cho khách.
// Mỗi bước phản ánh trạng thái từ giữ chỗ đến trả phòng.
import { TRANG_THAI_DAT_PHONG, TRANG_THAI_THANH_TOAN } from '../../../utils/lichSuDatPhong';

const CAC_BUOC = ['Giữ chỗ', 'Thanh toán', 'Xác nhận', 'Nhận phòng', 'Trả phòng'];

function layBuocHienTai(booking) {
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT) return 4;
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) return 4; // Khi đang ở phòng, bước tiếp theo cần làm là Trả phòng (index 4)
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED) return 3; // Đã xác nhận đơn, bước tiếp theo cần làm là Nhận phòng (index 3)
  if ([TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus)) return 2;
  if (booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID) return 1;
  return 0;
}

export default function MyBookingsProgress({ booking }) {
  const buocHienTai = layBuocHienTai(booking);

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-5">
        {CAC_BUOC.map((label, index) => {
          const daQua = index < buocHienTai;
          const hienTai = index === buocHienTai;
          return (
            <div key={label} className="flex items-center gap-2 sm:block">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black sm:mx-auto transition-colors duration-300 ${
                  daQua ? 'bg-emerald-50 text-emerald-600' : hienTai ? 'bg-brand-600 text-white shadow-[0_0_0_4px_rgba(var(--brand-500),0.1)]' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {daQua ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <p className={`text-xs font-bold sm:mt-2 sm:text-center ${daQua ? 'text-emerald-700' : hienTai ? 'text-brand-700' : 'text-slate-400'}`}>
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
