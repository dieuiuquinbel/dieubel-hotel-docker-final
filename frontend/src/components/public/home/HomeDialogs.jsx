// Chức năng: Các hộp thoại trên trang chủ.
// Hai popup dùng riêng cho trang chủ: mời đăng nhập và kho voucher.
import { TheVoucher } from './HomeVoucherCard';

export function PopupMoiDangNhap({ open, onClose, onAuth }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label="Đóng popup"
        >
          ×
        </button>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-base font-black text-white">DB</div>
        <p className="mt-5 text-sm font-black uppercase tracking-wide text-brand-700">Ưu đãi thành viên mới</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Đăng nhập / đăng ký để nhận ngay ưu đãi cực hấp dẫn</h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-600">
          Giảm ngay <span className="font-black text-slate-950">10%</span> cho booking khách sạn đầu tiên khi dùng tài khoản DieuBel.
        </p>
        <button
          type="button"
          onClick={onAuth}
          className="mt-6 w-full rounded-xl bg-brand-600 px-5 py-4 text-base font-black text-white shadow-sm shadow-brand-500/25 transition hover:bg-brand-700"
        >
          Đăng nhập hoặc đăng ký
        </button>
      </div>
    </div>
  );
}

export function HopThoaiVoucher({ open, vouchers, savedCodes, onClose, onSave }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-black text-brand-700">Kho ưu đãi DieuBel</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Tất cả mã giảm giá</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {vouchers.map((voucher) => (
            <TheVoucher key={voucher.id} voucher={voucher} isSaved={savedCodes.includes(voucher.code)} onSave={onSave} />
          ))}
        </div>
      </div>
    </div>
  );
}
