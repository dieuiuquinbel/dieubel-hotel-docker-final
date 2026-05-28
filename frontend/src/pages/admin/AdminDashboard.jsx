// Chức năng: Trang tổng quan số liệu vận hành admin.
// Trang tổng quan của khu vực quản trị — phiên bản nâng cấp với Skeleton + Donut Chart.
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { layTongQuanQuanTriApi } from '../../services/quanTriApi';
import { dinhDangTien } from '../../utils/dinhDang';
import {
  DashboardActionItem,
  DashboardDonutChart,
  DashboardNoticeItem,
  DashboardProgressRow,
  DashboardSkeleton,
  DashboardStatCard,
} from '../../components/admin/dashboard/DashboardCards';
import {
  tinhTongPhongTheoDoi,
  tinhTyLeXacNhan,
} from '../../components/admin/dashboard/dashboardHelpers';

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: layTongQuanQuanTriApi,
    staleTime: 60 * 1000,
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-rose-400">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.707 7.293a1 1 0 0 0-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 1 0 1.414 1.414L10 11.414l1.293 1.293a1 1 0 0 0 1.414-1.414L11.414 10l1.293-1.293a1 1 0 0 0-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <p className="text-sm font-bold text-rose-700">Không tải được dữ liệu tổng quan admin.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-black text-white transition hover:bg-rose-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

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

  const urgentCount = (Number(stats.pendingBookings || 0) + Number(stats.cancelRequestedBookings || 0));

  const donutSlices = [
    { title: 'Còn bán', value: availableRooms, color: '#10b981' },
    { title: 'Đang lưu trú', value: checkedInRooms, color: '#0ea5e9' },
    { title: 'Đã giữ chỗ', value: reservedRooms, color: '#f59e0b' },
  ];

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">DieuBel Admin</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Tổng quan vận hành</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/bookings?tab=confirmed"
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Mở đơn đặt phòng
          </Link>
          <Link
            to="/admin/operations"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Hàng đợi khiếu nại
          </Link>
        </div>
      </section>

      {/* Urgent alert */}
      {urgentCount > 0 ? (
        <section className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-black text-white">
            {urgentCount}
          </span>
          <p className="flex-1 text-sm font-bold text-rose-800">
            Có <strong>{urgentCount} đơn cần xử lý</strong> ngay hôm nay — kiểm tra hàng đợi đặt phòng.
          </p>
          <Link
            to="/admin/bookings?tab=review"
            className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-rose-700"
          >
            Xem ngay
          </Link>
        </section>
      ) : null}

      {/* Stat cards */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <DashboardStatCard
          label="Đơn cần xử lý"
          value={urgentCount || 0}
          tone="text-rose-600"
          hint={`${stats.pendingBookings || 0} chờ duyệt · ${stats.cancelRequestedBookings || 0} yêu cầu hủy`}
        />
        <DashboardStatCard
          label="Nhận phòng hôm nay"
          value={stats.arrivalsToday || 0}
          tone="text-sky-700"
          hint="Khách đến ngày hôm nay"
        />
        <DashboardStatCard
          label="Kho còn bán"
          value={availableRooms}
          tone="text-emerald-700"
          hint={`${stats.totalRoomTypes || 0} loại phòng`}
        />
        <DashboardStatCard
          label="Doanh thu thực thu"
          value={dinhDangTien(stats.paidRevenue || 0)}
          tone="text-brand-700"
          hint="Tổng đã thanh toán"
        />
        <DashboardStatCard
          label="Tổng đơn"
          value={stats.totalBookings || 0}
          hint={`Đã xác nhận ${confirmedRatio}`}
        />
        <DashboardStatCard
          label="Khách hàng"
          value={stats.totalCustomers || 0}
          hint={`Mới ${stats.newCustomers7d || 0} trong 7 ngày`}
        />
      </section>

      {/* Room status + Actions */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

        {/* Tình trạng phòng */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-black text-slate-950">Tình trạng phòng</h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">Phân bổ phòng theo trạng thái hiện tại</p>

          <div className="mt-5">
            <DashboardDonutChart
              slices={donutSlices}
              label={String(trackedRooms)}
              sublabel="phòng"
            />
          </div>

          <div className="mt-5 grid gap-3">
            <DashboardProgressRow label="Còn bán" value={availableRooms} percent={availablePercent} tone="bg-emerald-500" />
            <DashboardProgressRow label="Đang lưu trú" value={checkedInRooms} percent={checkedInPercent} tone="bg-sky-500" />
            <DashboardProgressRow label="Đã giữ / đã xác nhận" value={reservedRooms} percent={reservedPercent} tone="bg-amber-500" />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Tổng phòng theo dõi</p>
              <p className="mt-1 text-xl font-black text-slate-950">{trackedRooms}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-600">Sắp hết / Đã hết</p>
              <p className="mt-1 text-xl font-black text-amber-700">
                {stats.lowInventoryRooms || 0} / {stats.soldOutRooms || 0}
              </p>
            </div>
          </div>
        </section>

        {/* Cần làm hôm nay */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-black text-slate-950">Cần xử lý hôm nay</h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">Các hành động ưu tiên cao nhất</p>
          <div className="mt-4 grid gap-2">
            <DashboardActionItem
              label="Đơn chờ duyệt"
              value={stats.pendingBookings || 0}
              to="/admin/bookings?tab=review"
              tone="text-rose-600"
            />
            <DashboardActionItem
              label="Thanh toán ngoại lệ"
              value={stats.receivableAmount ? dinhDangTien(stats.receivableAmount) : dinhDangTien(0)}
              to="/admin/bookings?tab=payment"
              tone="text-amber-700"
            />
            <DashboardActionItem
              label="Khách đến nhận phòng hôm nay"
              value={stats.arrivalsToday || 0}
              to="/admin/bookings?tab=arrival"
              tone="text-sky-700"
            />
            <DashboardActionItem
              label="Yêu cầu hủy / hoàn tiền"
              value={stats.cancelRequestedBookings || 0}
              hint={`${stats.pendingRefunds || 0} đang chờ`}
              to="/admin/bookings?tab=cancel"
              tone="text-rose-600"
            />
            <DashboardActionItem
              label="Đơn đã xác nhận / tổng đơn"
              value={confirmedRatio}
              to="/admin/bookings?tab=confirmed"
              tone="text-emerald-700"
            />
          </div>
        </section>
      </section>

      {/* Revenue + Notices */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

        {/* Doanh thu */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-black text-slate-950">Doanh thu và thanh toán</h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">Snapshot tài chính toàn hệ thống</p>
          <div className="mt-4 grid gap-2">
            <DashboardActionItem label="Đã thu" value={dinhDangTien(stats.paidRevenue || 0)} tone="text-emerald-700" />
            <DashboardActionItem label="Còn phải thu" value={dinhDangTien(stats.receivableAmount || 0)} tone="text-amber-700" />
            <DashboardActionItem
              label="Hoàn tiền chờ duyệt"
              value={dinhDangTien(stats.pendingRefundAmount || 0)}
              hint={`${stats.pendingRefunds || 0} yêu cầu`}
              tone="text-rose-600"
            />
          </div>
        </section>

        {/* Thông báo vận hành */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-black text-slate-950">Thông báo vận hành</h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">Cảnh báo và trạng thái hệ thống</p>
          <div className="mt-4 grid gap-2">
            <DashboardNoticeItem tone={Number(stats.pendingBookings || 0) > 0 ? 'rose' : 'emerald'}>
              {Number(stats.pendingBookings || 0) > 0
                ? `Còn ${stats.pendingBookings} đơn mới chưa duyệt.`
                : 'Không còn đơn mới chờ duyệt.'}
            </DashboardNoticeItem>
            <DashboardNoticeItem tone={Number(stats.arrivalsToday || 0) > 0 ? 'sky' : 'slate'}>
              {Number(stats.arrivalsToday || 0) > 0
                ? `Hôm nay có ${stats.arrivalsToday} đơn đến ngày nhận phòng.`
                : 'Hôm nay chưa có đơn đến check-in.'}
            </DashboardNoticeItem>
            <DashboardNoticeItem tone={Number(stats.pendingRefunds || 0) > 0 ? 'amber' : 'slate'}>
              {Number(stats.pendingRefunds || 0) > 0
                ? `Có ${stats.pendingRefunds} yêu cầu hoàn tiền đang chờ xử lý.`
                : 'Không có yêu cầu hoàn tiền tồn đọng.'}
            </DashboardNoticeItem>
            <DashboardNoticeItem
              tone={
                Number(stats.soldOutRooms || 0) > 0 || Number(stats.lowInventoryRooms || 0) > 0
                  ? 'amber'
                  : 'emerald'
              }
            >
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
