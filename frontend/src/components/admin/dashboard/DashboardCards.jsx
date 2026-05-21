// Các khối card dùng lại cho trang tổng quan admin.
import { Link } from 'react-router-dom';

export function DashboardStatCard({ label, value, hint, tone = 'text-slate-950' }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs font-bold text-slate-500">{hint}</p> : null}
    </article>
  );
}

export function DashboardActionItem({ label, value, hint, to, tone = 'text-slate-950' }) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-800">{label}</p>
        {hint ? <p className="mt-1 text-xs font-bold text-slate-500">{hint}</p> : null}
      </div>
      <span className={`shrink-0 text-lg font-black ${tone}`}>{value}</span>
    </>
  );

  if (!to) {
    return <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">{content}</div>;
  }

  return (
    <Link to={to} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50">
      {content}
    </Link>
  );
}

export function DashboardProgressRow({ label, value, percent, tone }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-slate-700">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${tone}`} style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }} />
      </div>
    </div>
  );
}

export function DashboardNoticeItem({ tone = 'slate', children }) {
  const toneClass = {
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }[tone] || 'border-slate-200 bg-slate-50 text-slate-700';

  return <div className={`rounded-lg border px-4 py-3 text-sm font-bold ${toneClass}`}>{children}</div>;
}
