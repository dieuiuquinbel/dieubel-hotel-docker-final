function KhungThePhong({ compact = false }) {
  if (compact) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="h-52 animate-pulse bg-slate-200" />
        <div className="space-y-3 p-5">
          <div className="h-6 w-3/4 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[280px_1fr_200px]">
      <div className="h-64 animate-pulse bg-slate-200 lg:h-full" />
      <div className="space-y-4 p-5">
        <div className="h-8 w-2/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-5 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-16 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
        <div className="h-20 w-24 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

export default KhungThePhong;
