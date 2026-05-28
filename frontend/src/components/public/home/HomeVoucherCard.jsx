// Chức năng: Card và hình voucher trên trang chủ.
// Thẻ hiển thị voucher cho trang chủ và popup khuyến mãi.
import { useState } from 'react';

export function HinhVoucher({ voucher, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative min-h-[150px] overflow-hidden rounded-2xl bg-gradient-to-br ${voucher.imageTone} p-5 text-white ${className}`}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20" />
      <div className="absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-white/15" />
      <div className="relative flex h-full min-h-[110px] flex-col justify-between">
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide">{voucher.badge}</span>
        <div>
          <p className="text-4xl font-black tracking-normal drop-shadow-sm">{voucher.imageText}</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm font-bold text-white/90">Mã {voucher.code}</p>
            <button 
              onClick={handleCopy}
              className="flex items-center justify-center rounded bg-white/20 px-2.5 py-1 text-[10px] font-black uppercase transition hover:bg-white/40"
              title="Copy mã"
            >
              {copied ? 'Đã copy ✓' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TheVoucher({ voucher, isSaved, onSave, compact = false }) {
  const expireMatch = String(voucher.expiresIn || '').match(/\d+/);
  const expireDays = expireMatch ? Number(expireMatch[0]) : 7;
  const isUrgent = expireDays <= 3;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <HinhVoucher voucher={voucher} className={compact ? 'min-h-[130px] rounded-b-none' : 'rounded-b-none'} />
      
      {/* Hiệu ứng vé đục lỗ (Cutout effect) */}
      <div className="relative h-6 bg-white">
        <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50" />
        <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50" />
        <div className="absolute left-6 right-6 top-1/2 h-0 -translate-y-1/2 border-t-[1.5px] border-dashed border-slate-200" />
      </div>

      <div className="flex flex-1 flex-col p-4 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-brand-700">{voucher.badge}</p>
            <h3 className="mt-1.5 text-lg font-black leading-snug text-slate-950">{voucher.title}</h3>
          </div>
          <div className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide ${isUrgent ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Còn {expireDays} ngày
          </div>
        </div>
        
        <p className="mt-3 text-sm leading-6 text-slate-600">{voucher.description}</p>
        
        <div className="mt-auto pt-4">
          <div className="w-fit rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Điều kiện</p>
            <p className="mt-0.5 text-sm font-black text-slate-900">
              {voucher.minSpend ? `Đơn từ ${voucher.minSpend.toLocaleString('vi-VN')} đ` : 'Mọi giá trị đơn'}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => onSave(voucher)}
            disabled={isSaved}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
              isSaved 
                ? 'cursor-not-allowed bg-slate-100 text-slate-400' 
                : 'bg-brand-600 text-white shadow-sm hover:bg-brand-700'
            }`}
          >
            {isSaved ? (
              <>
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Đã lưu vào ví
              </>
            ) : (
              'Lưu mã'
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
