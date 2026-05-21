// Trang voucher của admin.
// File này chỉ giữ lại phần có dữ liệu thật từ backend, không chứa tab placeholder.
import { useQuery } from '@tanstack/react-query';
import { layDanhSachVoucherApi } from '../../services/voucherApi';
import { dinhDangTien } from '../../utils/dinhDang';

function StatCard({ label, value, hint, tone = 'text-slate-950' }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs font-bold text-slate-500">{hint}</p> : null}
    </article>
  );
}

function docGiaTriVoucher(voucher) {
  if (voucher.discount_amount) return dinhDangTien(voucher.discount_amount);
  if (voucher.discount_percent) return `${voucher.discount_percent}%`;
  return 'Ưu đãi';
}

function nhanTrangThaiVoucher(voucher) {
  if (voucher.is_active === false) return 'Tắt';
  return 'Đang có';
}

function AdminMarketing() {
  const voucherQuery = useQuery({
    queryKey: ['admin', 'vouchers'],
    queryFn: layDanhSachVoucherApi,
    staleTime: 60 * 1000,
  });

  const vouchers = voucherQuery.data || [];
  const activeCount = vouchers.filter((voucher) => voucher.is_active !== false).length;
  const percentCount = vouchers.filter((voucher) => voucher.discount_percent).length;
  const fixedCount = vouchers.filter((voucher) => voucher.discount_amount).length;

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Voucher</h1>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard label="Tổng voucher" value={vouchers.length} />
        <StatCard label="Đang hoạt động" value={activeCount} tone="text-emerald-700" />
        <StatCard label="Kiểu ưu đãi" value={`${fixedCount} tiền / ${percentCount} %`} />
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-[minmax(0,1fr)_180px_140px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-slate-500 max-md:hidden">
          <span>Mã và mô tả</span>
          <span>Giá trị</span>
          <span>Trạng thái</span>
        </div>

        {voucherQuery.isLoading ? (
          <div className="p-5 text-sm font-bold text-slate-500">Đang tải voucher...</div>
        ) : null}

        {voucherQuery.isError ? (
          <div className="p-5 text-sm font-bold text-rose-700">Không tải được voucher.</div>
        ) : null}

        {!voucherQuery.isLoading && !voucherQuery.isError ? (
          <div className="divide-y divide-slate-100">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id || voucher.code}
                className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px_140px]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{voucher.code}</p>
                  <p className="mt-1 truncate text-xs font-bold text-slate-500">
                    {voucher.name || voucher.description || 'Voucher'}
                  </p>
                </div>
                <p className="text-sm font-black text-brand-700">{docGiaTriVoucher(voucher)}</p>
                <span
                  className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-black ${
                    voucher.is_active === false
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {nhanTrangThaiVoucher(voucher)}
                </span>
              </div>
            ))}

            {!vouchers.length ? (
              <div className="p-8 text-center text-sm font-bold text-slate-500">Chưa có voucher.</div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default AdminMarketing;
