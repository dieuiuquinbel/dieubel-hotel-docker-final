// Trang tổng quan của khu vực quản trị.
// File này chỉ hiển thị số liệu khái quát, cảnh báo vận hành và liên kết tới các hàng đợi xử lý.
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { layTongQuanQuanTriApi } from '../../services/quanTriApi';
import { dinhDangTien } from '../../utils/dinhDang';
import {
  DashboardActionItem,
  DashboardNoticeItem,
  DashboardProgressRow,
  DashboardStatCard,
} from '../../components/admin/dashboard/DashboardCards';
import {
  tinhTongPhongTheoDoi,
  tinhTyLeXacNhan,
} from '../../components/admin/dashboard/dashboardHelpers';

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: layTongQuanQuanTriApi,
    staleTime: 60 * 1000,
  });

  const stats = data?.stats || {};
  const {
    availableRooms,
    checkedInRooms,
    reservedRooms,
    trackedRooms,
    availablePercent,
    checkedInPercent,
    reservedPercent,
  } = tinhTongPhongTheoDoi(stats);
  const confirmedRatio = tinhTyLeXacNhan(stats);

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">Đang tải tổng quan...</div>;
  }

  if (isError) {
    return <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">Không tải được dữ liệu tổng quan admin.</div>;
  }

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Tổng quan vận hành</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/bookings?tab=confirmed" className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white">Mở đơn đặt phòng</Link>
          <Link to="/admin/operations" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700">Mở hàng đợi khiếu nại</Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <DashboardStatCard label="Đơn cần xử lý" value={(Number(stats.pendingBookings || 0) + Number(stats.cancelRequestedBookings || 0)) || 0} tone="text-rose-600" />
        <DashboardStatCard label="Nhận phòng hôm nay" value={stats.arrivalsToday || 0} tone="text-sky-700" />
        <DashboardStatCard label="Kho còn bán" value={availableRooms} tone="text-emerald-700" hint={`${stats.totalRoomTypes || 0} loại phòng`} />
        <DashboardStatCard label="Doanh thu thực thu" value={dinhDangTien(stats.paidRevenue || 0)} tone="text-brand-700" />
        <DashboardStatCard label="Tổng đơn" value={stats.totalBookings || 0} hint={`Đã xác nhận ${confirmedRatio}`} />
        <DashboardStatCard label="Khách hàng" value={stats.totalCustomers || 0} hint={`Mới ${stats.newCustomers7d || 0} trong 7 ngày`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-black text-slate-950">Cần xử lý hôm nay</h2>
          <div className="mt-4 grid gap-2">
            <DashboardActionItem label="Đơn chờ duyệt" value={stats.pendingBookings || 0} to="/admin/bookings?tab=review" tone="text-rose-600" />
            <DashboardActionItem label="Thanh toán ngoại lệ" value={stats.receivableAmount ? dinhDangTien(stats.receivableAmount) : dinhDangTien(0)} to="/admin/bookings?tab=payment" tone="text-amber-700" />
            <DashboardActionItem label="Khách đến nhận phòng hôm nay" value={stats.arrivalsToday || 0} to="/admin/bookings?tab=arrival" tone="text-sky-700" />
            <DashboardActionItem label="Yêu cầu hủy / hoàn tiền" value={stats.cancelRequestedBookings || 0} hint={`${stats.pendingRefunds || 0} đang chờ`} to="/admin/bookings?tab=cancel" tone="text-rose-600" />
            <DashboardActionItem label="Đơn đã xác nhận / tổng đơn" value={confirmedRatio} to="/admin/bookings?tab=confirmed" tone="text-emerald-700" />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-black text-slate-950">Tình trạng phòng</h2>
          <div className="mt-4 grid gap-4">
            <DashboardProgressRow label="Còn bán" value={availableRooms} percent={availablePercent} tone="bg-emerald-500" />
            <DashboardProgressRow label="Đang lưu trú" value={checkedInRooms} percent={checkedInPercent} tone="bg-sky-500" />
            <DashboardProgressRow label="Đã giữ / đã xác nhận" value={reservedRooms} percent={reservedPercent} tone="bg-amber-500" />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Tổng phòng theo dõi</p>
                <p className="mt-1 text-lg font-black text-slate-950">{trackedRooms}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Loại phòng sắp hết / hết</p>
                <p className="mt-1 text-lg font-black text-amber-700">{stats.lowInventoryRooms || 0} / {stats.soldOutRooms || 0}</p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-black text-slate-950">Doanh thu và thanh toán</h2>
          <div className="mt-4 grid gap-2">
            <DashboardActionItem label="Đã thu" value={dinhDangTien(stats.paidRevenue || 0)} tone="text-brand-700" />
            <DashboardActionItem label="Còn phải thu" value={dinhDangTien(stats.receivableAmount || 0)} tone="text-amber-700" />
            <DashboardActionItem label="Hoàn tiền chờ duyệt" value={dinhDangTien(stats.pendingRefundAmount || 0)} hint={`${stats.pendingRefunds || 0} yêu cầu`} tone="text-rose-600" />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-black text-slate-950">Thông báo vận hành</h2>
          <div className="mt-4 grid gap-2">
            <DashboardNoticeItem tone={Number(stats.pendingBookings || 0) > 0 ? 'rose' : 'emerald'}>
              {Number(stats.pendingBookings || 0) > 0
                ? `Còn ${stats.pendingBookings || 0} đơn mới chưa duyệt.`
                : 'Không còn đơn mới chờ duyệt.'}
            </DashboardNoticeItem>
            <DashboardNoticeItem tone={Number(stats.arrivalsToday || 0) > 0 ? 'sky' : 'slate'}>
              {Number(stats.arrivalsToday || 0) > 0
                ? `Hôm nay có ${stats.arrivalsToday || 0} đơn đến ngày nhận phòng.`
                : 'Hôm nay chưa có đơn đến check-in.'}
            </DashboardNoticeItem>
            <DashboardNoticeItem tone={Number(stats.pendingRefunds || 0) > 0 ? 'amber' : 'slate'}>
              {Number(stats.pendingRefunds || 0) > 0
                ? `Có ${stats.pendingRefunds || 0} yêu cầu hoàn tiền đang chờ xử lý.`
                : 'Không có yêu cầu hoàn tiền tồn đọng.'}
            </DashboardNoticeItem>
            <DashboardNoticeItem tone={Number(stats.soldOutRooms || 0) > 0 || Number(stats.lowInventoryRooms || 0) > 0 ? 'amber' : 'emerald'}>
              {Number(stats.soldOutRooms || 0) > 0 || Number(stats.lowInventoryRooms || 0) > 0
                ? `Có ${stats.lowInventoryRooms || 0} loại phòng sắp hết và ${stats.soldOutRooms || 0} loại phòng đã hết.`
                : 'Kho phòng đang ổn, chưa có loại phòng cảnh báo.'}
            </DashboardNoticeItem>
          </div>
        </section>
      </section>
    </div>
  );
}
