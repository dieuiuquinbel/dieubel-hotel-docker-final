// Các khối giao diện dùng chung cho màn đặt phòng.
// Tách riêng để file trang chỉ còn điều phối dữ liệu và sự kiện.
export function BadgeDatPhong({ tone, children }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{children}</span>;
}

export function TheThongKeHangDoi({ label, value, hint, tone = 'text-slate-950', onClick }) {
  const content = (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{hint}</p>
    </div>
  );

  if (!onClick) return content;

  return (
    <button type="button" onClick={onClick} className="text-left transition hover:-translate-y-px hover:border-slate-300">
      {content}
    </button>
  );
}

export function DongThongTinChiTiet({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-slate-950">{value || 'Chưa có'}</p>
    </div>
  );
}
