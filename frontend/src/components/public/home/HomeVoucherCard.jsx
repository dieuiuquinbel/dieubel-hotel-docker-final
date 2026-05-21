// Thẻ hiển thị voucher cho trang chủ và popup khuyến mãi.
export function HinhVoucher({ voucher, className = '' }) {
  return (
    <div className={`relative min-h-[150px] overflow-hidden rounded-2xl bg-gradient-to-br ${voucher.imageTone} p-5 text-white ${className}`}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20" />
      <div className="absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-white/15" />
      <div className="relative flex h-full min-h-[110px] flex-col justify-between">
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide">{voucher.badge}</span>
        <div>
          <p className="text-4xl font-black tracking-normal drop-shadow-sm">{voucher.imageText}</p>
          <p className="mt-1 text-sm font-bold text-white/88">Mã {voucher.code}</p>
        </div>
      </div>
    </div>
  );
}

export function TheVoucher({ voucher, isSaved, onSave, compact = false }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <HinhVoucher voucher={voucher} className={compact ? 'min-h-[130px] rounded-none' : 'rounded-none'} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-brand-700">{voucher.badge}</p>
            <h3 className="mt-2 text-lg font-black leading-snug text-slate-950">{voucher.title}</h3>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-brand-700">{voucher.expiresIn}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{voucher.description}</p>
        <p className="mt-3 text-xs font-bold text-slate-500">
          {voucher.minSpend ? `Đơn tối thiểu ${voucher.minSpend.toLocaleString('vi-VN')} đ` : 'Không yêu cầu giá trị tối thiểu'}
        </p>
        <button
          type="button"
          onClick={() => onSave(voucher)}
          disabled={isSaved}
          className="mt-4 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-default disabled:bg-slate-300"
        >
          {isSaved ? 'Đã lưu' : 'Lưu mã'}
        </button>
      </div>
    </article>
  );
}
