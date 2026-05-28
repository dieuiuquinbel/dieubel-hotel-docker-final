// Chức năng: Các phần UI khung trang đặt chỗ của tôi.
import { Link } from 'react-router-dom';
import { TAB_DAT_PHONG } from './myBookingsHelpers';

export function MyBookingsHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="eyebrow">Đặt chỗ của tôi</span>
        <h1 className="mt-3 text-[28px] font-bold tracking-normal text-[#222222]">Quản lý đặt chỗ và thanh toán</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
          Các phòng vừa giữ chỗ sẽ nằm tại đây để bạn thanh toán online, cọc 10% hoặc hủy giữ chỗ khi không còn nhu cầu.
        </p>
      </div>
      <Link
        to="/rooms"
        className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        Tìm thêm khách sạn
      </Link>
    </div>
  );
}

export function MyBookingsTabs({ activeTab, setActiveTab, badges = {} }) {
  return (
    <div className="mt-8 flex flex-wrap gap-2 rounded-[14px] border border-[#dddddd] bg-white p-2">
      {TAB_DAT_PHONG.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActiveTab(tab.key)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            activeTab === tab.key ? 'bg-[#222222] text-white' : 'text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]'
          }`}
        >
          {tab.label}
          {badges[tab.key] > 0 && (
            <span className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-black ${
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
            }`}>
              {badges[tab.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function MyBookingsError({ message }) {
  if (!message) return null;

  return (
    <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
      {message}
    </div>
  );
}

export function MyBookingsLoading() {
  return (
    <div className="mt-6 grid gap-5">
      {[1, 2].map((i) => (
        <div key={i} className="grid animate-pulse gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)]">
          <div className="h-44 w-full rounded-xl bg-slate-200" />
          <div className="flex flex-col justify-between py-2">
            <div>
              <div className="flex gap-2">
                <div className="h-5 w-24 rounded-full bg-slate-200" />
                <div className="h-5 w-24 rounded-full bg-slate-200" />
              </div>
              <div className="mt-4 h-6 w-2/3 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/3 rounded bg-slate-200" />
            </div>
            <div className="mt-4 flex gap-3">
              <div className="h-10 w-28 rounded-lg bg-slate-200" />
              <div className="h-10 w-28 rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MyBookingsEmpty() {
  return (
    <div className="surface-card mt-8 p-8 text-center">
      <p className="text-sm font-bold text-brand-700">Không có đơn phù hợp</p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Các đơn đang xử lý sẽ hiển thị tại đây.</h2>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        Đơn đã hủy hoặc đã trả phòng sẽ được chuyển sang tab Lịch sử để bạn xem lại.
      </p>
      <Link to="/rooms" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white">
        Tìm chỗ ở
      </Link>
    </div>
  );
}

