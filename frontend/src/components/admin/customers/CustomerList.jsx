// Danh sách khách hàng ở màn hình admin.
// Component này chỉ hiển thị list và trả sự kiện chọn khách lên component cha.
import { dinhDangTien } from '../../../utils/dinhDang';
import { classTrangThaiKhach, nhanTrangThaiKhach } from './customerStatus';

function CustomerList({
  customers,
  activeCustomerId,
  isLoading,
  onSelect,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[1fr_130px_120px_140px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500 max-lg:hidden">
        <span>Khách hàng</span>
        <span>Đặt phòng</span>
        <span>Trạng thái</span>
        <span>Chi tiêu</span>
      </div>

      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-5 text-sm font-bold text-slate-500">Đang tải khách hàng...</div>
        ) : customers.length ? (
          customers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => onSelect(customer.id)}
              className={`grid w-full gap-3 px-4 py-4 text-left transition hover:bg-sky-50 lg:grid-cols-[1fr_130px_120px_140px] ${
                activeCustomerId === customer.id ? 'bg-sky-50 ring-1 ring-inset ring-brand-200' : 'bg-white'
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">{customer.full_name}</p>
                <p className="mt-1 truncate text-xs font-bold text-slate-500">
                  {customer.username} {customer.email ? `- ${customer.email}` : ''}
                </p>
                <p className="mt-1 truncate text-xs font-bold text-slate-500">
                  {customer.phone || 'Chưa có số điện thoại'}
                </p>
              </div>
              <p className="text-sm font-black text-slate-700">{customer.booking_count}</p>
              <span className={`h-fit w-fit rounded-full px-2.5 py-1 text-xs font-black ${classTrangThaiKhach(customer.status)}`}>
                {nhanTrangThaiKhach(customer.status)}
              </span>
              <p className="text-sm font-black text-brand-700">{dinhDangTien(customer.total_spent)}</p>
            </button>
          ))
        ) : (
          <div className="p-5 text-sm font-bold text-slate-500">Không có khách hàng phù hợp.</div>
        )}
      </div>
    </div>
  );
}

export default CustomerList;
