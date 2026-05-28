// Chức năng: Trang admin quản lý voucher và chiến dịch marketing.
// Trang voucher của admin — phiên bản nâng cấp với bảng rõ hơn và badge đầy đủ.
import { useQuery } from '@tanstack/react-query';
import { layDanhSachVoucherApi } from '../../services/voucherApi';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';

function VoucherStatusBadge({ voucher }) {
  const now = new Date();
  const isExpired = voucher.end_at && new Date(voucher.end_at) < now;
  const isUsedUp = voucher.total_quantity > 0 && voucher.used_quantity >= voucher.total_quantity;
  const isOff = voucher.is_active === false;

  if (isOff) {
    return <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-600">Tắt</span>;
  }
  if (isExpired) {
    return <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700">Hết hạn</span>;
  }
  if (isUsedUp) {
    return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">Đã dùng hết</span>;
  }
  return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">Đang hoạt động</span>;
}

function docGiaTriVoucher(voucher) {
  if (voucher.discount_value && voucher.discount_type === 'percent') {
    return `${Math.round(Number(voucher.discount_value) * 100)}%`;
  }
  if (voucher.discount_value && Number(voucher.discount_value) > 0) {
    return dinhDangTien(voucher.discount_value);
  }
  if (voucher.service_benefit) return voucher.service_benefit;
  return 'Ưu đãi dịch vụ';
}

function docLoaiVoucher(voucher) {
  const map = { percent: 'Giảm %', fixed: 'Giảm tiền', service: 'Dịch vụ' };
  return map[voucher.discount_type] || 'Khác';
}

function SoLuongBar({ used, total }) {
  if (!total || total <= 0) return <span className="text-xs font-bold text-slate-400">Không giới hạn</span>;
  const pct = Math.min(Math.round((used / total) * 100), 100);
  const remaining = total - used;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-600">Còn {remaining}</span>
        <span className="text-[10px] font-semibold text-slate-400">{used}/{total}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AdminMarketing() {
  const voucherQuery = useQuery({
    queryKey: ['admin', 'vouchers'],
    queryFn: layDanhSachVoucherApi,
    staleTime: 60 * 1000,
  });

  const vouchers = voucherQuery.data || [];
  const now = new Date();
  const activeCount = vouchers.filter(
    (v) => v.is_active !== false && !(v.end_at && new Date(v.end_at) < now),
  ).length;
  const percentCount = vouchers.filter((v) => v.discount_type === 'percent').length;
  const fixedCount = vouchers.filter((v) => v.discount_type === 'fixed').length;
  const serviceCount = vouchers.filter((v) => v.discount_type === 'service').length;

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Marketing</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Quản lý Voucher</h1>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tổng voucher', value: vouchers.length, tone: 'text-slate-950', accent: 'bg-slate-400' },
          { label: 'Đang hoạt động', value: activeCount, tone: 'text-emerald-700', accent: 'bg-emerald-500' },
          { label: 'Giảm % / Tiền', value: `${percentCount} / ${fixedCount}`, tone: 'text-brand-700', accent: 'bg-blue-500' },
          { label: 'Dịch vụ đính kèm', value: serviceCount, tone: 'text-amber-700', accent: 'bg-amber-500' },
        ].map((card) => (
          <article key={card.label} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
            <span className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${card.accent}`} />
            <div className="pl-2">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
              <p className={`mt-2 text-2xl font-black ${card.tone}`}>{card.value}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Voucher table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Table header */}
        <div className="grid grid-cols-[minmax(0,1fr)_120px_100px_160px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 max-lg:hidden">
          <span>Mã và mô tả</span>
          <span>Loại</span>
          <span>Giá trị</span>
          <span>Số lượng</span>
          <span>Trạng thái</span>
        </div>

        {/* Loading */}
        {voucherQuery.isLoading ? (
          <div className="grid gap-0 divide-y divide-slate-100 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,1fr)_120px_100px_160px_120px] gap-4 px-5 py-4 max-lg:grid-cols-1">
                <div className="grid gap-1.5">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-3 w-48 rounded bg-slate-100" />
                </div>
                <div className="h-5 w-16 rounded-full bg-slate-100" />
                <div className="h-5 w-20 rounded bg-slate-200" />
                <div className="h-8 w-full rounded-lg bg-slate-100" />
                <div className="h-5 w-20 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : null}

        {/* Error */}
        {voucherQuery.isError ? (
          <div className="flex items-center gap-2.5 p-5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-600">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-bold text-rose-700">Không tải được danh sách voucher.</p>
          </div>
        ) : null}

        {/* Data */}
        {!voucherQuery.isLoading && !voucherQuery.isError ? (
          <div className="divide-y divide-slate-100">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id || voucher.code}
                className="grid grid-cols-[minmax(0,1fr)_120px_100px_160px_120px] items-center gap-4 px-5 py-4 transition hover:bg-slate-50 max-lg:grid-cols-1 max-lg:gap-2"
              >
                {/* Code + desc */}
                <div className="min-w-0">
                  <p className="font-mono text-sm font-black tracking-wide text-slate-950">{voucher.code}</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                    {voucher.title || voucher.description || 'Voucher'}
                  </p>
                  {voucher.min_order_amount && Number(voucher.min_order_amount) > 0 ? (
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                      Đơn tối thiểu {dinhDangTien(voucher.min_order_amount)}
                    </p>
                  ) : null}
                </div>

                {/* Loại */}
                <div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">
                    {docLoaiVoucher(voucher)}
                  </span>
                </div>

                {/* Giá trị */}
                <p className="text-sm font-black text-brand-700">{docGiaTriVoucher(voucher)}</p>

                {/* Số lượng */}
                <div>
                  <SoLuongBar used={voucher.used_quantity || 0} total={voucher.total_quantity || 0} />
                  {voucher.end_at ? (
                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                      HSD: {dinhDangNgay(voucher.end_at)}
                    </p>
                  ) : null}
                </div>

                {/* Trạng thái */}
                <div>
                  <VoucherStatusBadge voucher={voucher} />
                </div>
              </div>
            ))}

            {!vouchers.length ? (
              <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-slate-300">
                  <path fillRule="evenodd" d="M5 5a3 3 0 0 1 5.998 0H14a1 1 0 0 1 .894 1.447l-6 12A1 1 0 0 1 8 19H4a1 1 0 0 1-.894-1.447l3.06-6.12A3.001 3.001 0 0 1 5 5zm3 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-bold text-slate-500">Chưa có voucher nào</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default AdminMarketing;
