import { TRANG_THAI_DAT_PHONG, TRANG_THAI_THANH_TOAN } from '../../utils/lichSuDatPhong';

const CAC_BUOC = ['Giữ chỗ', 'Thanh toán', 'Xác nhận', 'Nhận phòng', 'Trả phòng'];

function layBuocHienTai(booking) {
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT) return 4;
  if (booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_IN) return 3;
  if ([TRANG_THAI_THANH_TOAN.PAID, TRANG_THAI_THANH_TOAN.DEPOSIT_PAID].includes(booking.paymentStatus)) return 2;
  if (booking.paymentStatus === TRANG_THAI_THANH_TOAN.UNPAID) return 1;
  return 0;
}

function DatPhongCuaToiTienTrinh({ booking }) {
  const buocHienTai = layBuocHienTai(booking);

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-5">
        {CAC_BUOC.map((label, index) => {
          const daQua = index <= buocHienTai;
          return (
            <div key={label} className="flex items-center gap-2 sm:block">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black sm:mx-auto ${
                  daQua ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {index + 1}
              </div>
              <p className={`text-xs font-bold sm:mt-2 sm:text-center ${daQua ? 'text-slate-950' : 'text-slate-400'}`}>{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DatPhongCuaToiTienTrinh;
