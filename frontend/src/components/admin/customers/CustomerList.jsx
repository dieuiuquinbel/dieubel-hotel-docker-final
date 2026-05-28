// Danh sách khách hàng ở màn hình admin — phiên bản nâng cấp với Skeleton Loader.
import { dinhDangTien } from '../../../utils/dinhDang';
import { classTrangThaiKhach, nhanTrangThaiKhach } from './customerStatus';

function CustomerListSkeleton() {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_130px_120px_140px]">
          <div className="grid gap-1.5">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-48 rounded bg-slate-100" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
          <div className="h-4 w-8 rounded bg-slate-200" />
          <div className="h-5 w-20 rounded-full bg-slate-100" />
          <div className="h-4 w-24 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function CustomerList({
  customers,
  activeCustomerId,
  isLoading,
  onSelect,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_130px_120px_140px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 max-lg:hidden">
        <span>Khách hàng</span>
        <span>Đặt phòng</span>
        <span>Trạng thái</span>
        <span>Chi tiêu</span>
      </div>

      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <CustomerListSkeleton />
        ) : customers.length ? (
          customers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => onSelect(customer.id)}
              className={`grid w-full gap-3 px-4 py-3.5 text-left transition-all duration-150 hover:bg-sky-50 lg:grid-cols-[1fr_130px_120px_140px] ${
                activeCustomerId === customer.id
                  ? 'bg-sky-50 border-l-2 border-l-sky-500'
                  : 'bg-white border-l-2 border-l-transparent'
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">{customer.full_name}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                  @{customer.username} {customer.email ? `· ${customer.email}` : ''}
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
                  {customer.phone || 'Chưa có SĐT'}
                </p>
              </div>
              <div className="flex items-center">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                  {customer.booking_count} đơn
                </span>
              </div>
              <div className="flex items-center">
                <span className={`rounded-full px-2.5 py-1 text-xs font-black ${classTrangThaiKhach(customer.status)}`}>
                  {nhanTrangThaiKhach(customer.status)}
                </span>
              </div>
              <p className="flex items-center text-sm font-black text-emerald-700">
                {dinhDangTien(customer.total_spent)}
              </p>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-slate-300">
              <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM17 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 0 0-1.5-4.33A5 5 0 0 1 19 16v1h-6.07zM6 11a5 5 0 0 1 5 5v1H1v-1a5 5 0 0 1 5-5z" />
            </svg>
            <p className="text-sm font-bold text-slate-500">Không tìm thấy khách hàng phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerList;
