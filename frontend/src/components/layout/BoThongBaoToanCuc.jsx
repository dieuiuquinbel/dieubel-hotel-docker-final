// Chức năng: Hiển thị toast thông báo toàn cục.
import useKhoThongBao from '../../store/khoThongBao';

function BoThongBaoToanCuc() {
  const toasts = useKhoThongBao((state) => state.toasts);
  const xoaThongBao = useKhoThongBao((state) => state.xoaThongBao);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-24 z-[9999] flex w-full max-w-sm flex-col gap-3 sm:right-6">
      {toasts.map((toast) => {
        const isSuccess = toast.tone === 'success';
        const isInfo = toast.tone === 'info';
        
        let bgStyle = 'border-rose-100 bg-rose-50/95 text-rose-900 shadow-rose-950/5';
        let iconColor = 'stroke-rose-600';
        let progressStyle = 'bg-rose-500';
        let iconSvg = (
          <svg className={`h-5 w-5 ${iconColor}`} fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        );

        if (isSuccess) {
          bgStyle = 'border-emerald-100 bg-emerald-50/95 text-emerald-900 shadow-emerald-950/5';
          iconColor = 'stroke-emerald-600';
          progressStyle = 'bg-emerald-500';
          iconSvg = (
            <svg className={`h-5 w-5 ${iconColor}`} fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        } else if (isInfo) {
          bgStyle = 'border-sky-100 bg-sky-50/95 text-sky-950 shadow-sky-950/5';
          iconColor = 'stroke-sky-600';
          progressStyle = 'bg-sky-500';
          iconSvg = (
            <svg className={`h-5 w-5 ${iconColor}`} fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          );
        }

        return (
          <div
            key={toast.id}
            onClick={() => xoaThongBao(toast.id)}
            className={`relative flex items-start gap-3.5 overflow-hidden rounded-2xl border p-4.5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer animate-toast-slide-in ${bgStyle}`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              {iconSvg}
            </div>
            
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[14px] font-extrabold leading-6">
                {isSuccess ? 'Thành công' : isInfo ? 'Thông báo' : 'Thất bại'}
              </p>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed opacity-90">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 transition"
              aria-label="Đóng"
            >
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Visual timer bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5">
              <div className={`h-full animate-toast-progress ${progressStyle}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BoThongBaoToanCuc;
