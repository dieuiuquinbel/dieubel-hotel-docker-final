// Các card và section nhỏ cho trang doanh thu admin.
import { dinhDangNgay, dinhDangTien } from '../../../utils/dinhDang';

export function RevenueStatCard({ label, value, tone = 'text-slate-950', hint }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs font-bold text-slate-500">{hint}</p> : null}
    </article>
  );
}

export function RevenueHeader({ onReload }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Doanh thu</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Tách riêng số liệu theo khoảng thời gian và tổng tích lũy toàn hệ thống.
        </p>
      </div>
      <button
        type="button"
        onClick={onReload}
        className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white"
      >
        Tải lại
      </button>
    </section>
  );
}

export function RevenueFilters({ dateFrom, dateTo, preset, setDateFrom, setDateTo, applyPreset, applyRange }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 xl:grid-cols-[180px_180px_170px_auto]">
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">Từ ngày</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">Đến ngày</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">Mốc nhanh</span>
          <select
            value={preset}
            onChange={(event) => applyPreset(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none"
          >
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày</option>
            <option value="month">Tháng này</option>
            <option value="custom">Tùy chọn</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={applyRange}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700"
          >
            Áp dụng khoảng thời gian
          </button>
        </div>
      </div>
    </section>
  );
}

export function RevenueRangeSection({ title, subtitle, badge, cards }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">{badge}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => <RevenueStatCard key={card.label} {...card} />)}
      </div>
    </article>
  );
}

export function RevenueBreakdown({ periodBreakdown, maxValue }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-lg font-black text-slate-950">Phân tích trong kỳ</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Chỉ số này chỉ tính trong khoảng ngày đang chọn.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {periodBreakdown.map(([label, value]) => (
          <div key={label}>
            <div className="mb-2 flex justify-between gap-3 text-sm">
              <span className="font-black text-slate-700">{label}</span>
              <span className="font-black text-slate-950">{dinhDangTien(value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-brand-600"
                style={{
                  width: `${Number(value) > 0 ? Math.max(5, Math.round((Number(value) / maxValue) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function RevenueQuickAudit({ period, lifetime, inventory }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-black text-slate-950">Đối soát nhanh</h2>
      <div className="mt-4 grid gap-3">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">Yêu cầu hoàn tiền trong kỳ</p>
          <p className="mt-2 text-2xl font-black text-rose-700">{period.refundRequests || 0}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">Yêu cầu hoàn tiền đang chờ</p>
          <p className="mt-2 text-2xl font-black text-amber-700">{lifetime.pendingRefunds || 0}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">Phòng còn trong kho</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">{inventory.availableRooms || 0}</p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          Nếu chọn khoảng ngày mà không có giao dịch, toàn bộ số liệu trong kỳ sẽ về 0. Khối tổng bên phải vẫn giữ số tích lũy toàn hệ thống.
        </div>
      </div>
    </article>
  );
}
