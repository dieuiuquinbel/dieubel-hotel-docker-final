// Chức năng: Card đánh giá nổi dùng trong trang chủ.
// Thẻ bình luận chạy trong khối đánh giá động của trang chủ.
// Bản nâng cấp hỗ trợ staggered animation delay khi biến mất.
export default function HomeReviewPopupCard({ review, isExiting, exitDirection, slot }) {
  return (
    <article
      className={`review-popup-card ${isExiting ? `review-popup-exit-${exitDirection}` : ''}`}
      style={{
        animationDelay: isExiting ? `${slot * 120}ms` : '0ms',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-slate-950">
          {review.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-xs font-bold text-slate-400">Đánh giá từ {review.trip}</p>
          <p className="mt-0.5 text-sm font-black text-slate-950">{review.name}</p>
          <p className="mt-1 line-clamp-2 text-sm font-black leading-snug text-slate-900">{review.text}</p>
        </div>
        <span className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-black text-white">{review.score}</span>
      </div>
    </article>
  );
}
