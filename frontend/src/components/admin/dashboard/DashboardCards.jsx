// Chức năng: Các card, biểu đồ và khối UI dùng trong dashboard admin.
// Các khối card dùng lại cho trang tổng quan admin — phiên bản nâng cấp.
import { Link } from 'react-router-dom';

// ─── Skeleton ────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[1500px] animate-pulse gap-5">
      {/* Header */}
      <div className="h-9 w-64 rounded-xl bg-slate-200" />

      {/* Stat cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-3 w-28 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-20 rounded-lg bg-slate-200" />
            <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Body sections */}
      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="h-5 w-40 rounded-lg bg-slate-200" />
            <div className="mt-4 grid gap-3">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="h-10 rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────
const ACCENT_MAP = {
  'text-rose-600': 'bg-rose-500',
  'text-sky-700': 'bg-sky-500',
  'text-emerald-700': 'bg-emerald-500',
  'text-brand-700': 'bg-blue-500',
  'text-amber-700': 'bg-amber-500',
  'text-slate-950': 'bg-slate-400',
};

export function DashboardStatCard({ label, value, hint, tone = 'text-slate-950' }) {
  const accent = ACCENT_MAP[tone] || 'bg-slate-300';
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
      {/* Accent left bar */}
      <span className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${accent}`} />
      <div className="pl-2">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
        {hint ? <p className="mt-1 text-xs font-bold text-slate-400">{hint}</p> : null}
      </div>
    </article>
  );
}

// ─── Action Item (row link) ─────────────────────────────
export function DashboardActionItem({ label, value, hint, to, tone = 'text-slate-950' }) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        {hint ? <p className="mt-0.5 text-xs font-semibold text-slate-400">{hint}</p> : null}
      </div>
      <span className={`shrink-0 text-base font-black ${tone}`}>{value}</span>
    </>
  );

  const base = 'flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition';

  if (!to) {
    return <div className={base}>{content}</div>;
  }

  return (
    <Link to={to} className={`${base} hover:border-slate-200 hover:bg-white hover:shadow-sm`}>
      {content}
    </Link>
  );
}

// ─── Progress Row ───────────────────────────────────────
export function DashboardProgressRow({ label, value, percent, tone }) {
  const safePercent = Math.max(0, Math.min(percent, 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-950">{value}</span>
          <span className="w-10 text-right text-xs font-bold text-slate-400">{safePercent}%</span>
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${tone}`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Notice Item ────────────────────────────────────────
const NOTICE_TONE = {
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-600',
};

const NOTICE_ICON = {
  rose: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
    </svg>
  ),
  amber: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
    </svg>
  ),
  emerald: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  sky: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 2 0V9H9z" clipRule="evenodd" />
    </svg>
  ),
  slate: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 2 0V9H9z" clipRule="evenodd" />
    </svg>
  ),
};

export function DashboardNoticeItem({ tone = 'slate', children }) {
  const cls = NOTICE_TONE[tone] || NOTICE_TONE.slate;
  const icon = NOTICE_ICON[tone] || NOTICE_ICON.slate;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold ${cls}`}>
      {icon}
      <span className="flex-1">{children}</span>
    </div>
  );
}

// ─── Donut SVG chart ────────────────────────────────────
export function DashboardDonutChart({ slices, label, sublabel }) {
  // slices = [{ value, color, title }]
  const total = slices.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
  const r = 36;
  const cx = 44;
  const cy = 44;
  const circumference = 2 * Math.PI * r;

  const paths = slices.map((slice, index) => {
    const pct = total > 0 ? (Number(slice.value) / total) : 0;
    const dash = pct * circumference;
    const offset = slices
      .slice(0, index)
      .reduce((sum, previousSlice) => {
        const previousPct = total > 0 ? (Number(previousSlice.value) / total) : 0;
        return sum + previousPct * circumference;
      }, 0);

    const path = (
      <circle
        key={slice.title}
        r={r}
        cx={cx}
        cy={cy}
        fill="none"
        stroke={slice.color}
        strokeWidth="14"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.8s ease' }}
      />
    );
    return path;
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle r={r} cx={cx} cy={cy} fill="none" stroke="#f1f5f9" strokeWidth="14" />
          {paths}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-black text-slate-950">{label}</span>
          {sublabel ? <span className="text-[10px] font-bold text-slate-400">{sublabel}</span> : null}
        </div>
      </div>
      <div className="grid gap-2">
        {slices.map((slice) => (
          <div key={slice.title} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="text-xs font-bold text-slate-600">{slice.title}</span>
            <span className="ml-auto pl-4 text-xs font-black text-slate-950">{slice.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
