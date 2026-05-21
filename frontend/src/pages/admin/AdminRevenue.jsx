// Trang doanh thu của admin.
// File này tách rõ số liệu theo khoảng thời gian và số liệu tích lũy toàn hệ thống.
import { useEffect, useMemo, useState } from 'react';
import { layBaoCaoDoanhThuAdminApi } from '../../services/datPhongApi';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';
import {
  RevenueBreakdown,
  RevenueFilters,
  RevenueHeader,
  RevenueQuickAudit,
  RevenueRangeSection,
} from '../../components/admin/revenue/RevenueCards';
import { buildRange, taoPhanTichTrongKy } from '../../components/admin/revenue/revenueHelpers';

export default function AdminRevenue() {
  const [report, setReport] = useState(null);
  const [preset, setPreset] = useState('month');
  const [dateFrom, setDateFrom] = useState(buildRange('month').dateFrom);
  const [dateTo, setDateTo] = useState(buildRange('month').dateTo);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async (nextDateFrom = dateFrom, nextDateTo = dateTo) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await layBaoCaoDoanhThuAdminApi({
        date_from: nextDateFrom,
        date_to: nextDateTo,
      });
      setReport(data);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không tải được báo cáo doanh thu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh(dateFrom, dateTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (nextPreset) => {
    setPreset(nextPreset);

    if (nextPreset === 'custom') return;

    const range = buildRange(nextPreset);
    setDateFrom(range.dateFrom);
    setDateTo(range.dateTo);
    refresh(range.dateFrom, range.dateTo);
  };

  const period = report?.period || {};
  const lifetime = report?.lifetime || {};
  const inventory = report?.inventory || {};

  const periodCards = [
    {
      label: 'Đã thu trong kỳ',
      value: dinhDangTien(period.paidRevenue || 0),
      tone: 'text-brand-700',
      hint: 'Theo khoảng ngày đang chọn',
    },
    {
      label: 'Còn phải thu trong kỳ',
      value: dinhDangTien(period.receivableAmount || 0),
      tone: 'text-amber-700',
      hint: 'Các đơn phát sinh trong kỳ chưa tất toán',
    },
    {
      label: 'Hoàn tiền trong kỳ',
      value: dinhDangTien(period.refundAmount || 0),
      tone: 'text-rose-700',
      hint: `${period.refundRequests || 0} yêu cầu phát sinh`,
    },
    {
      label: 'Số đơn trong kỳ',
      value: period.totalBookings || 0,
      hint: `${period.cancelledBookings || 0} đơn hủy, ${period.noShowBookings || 0} no-show`,
    },
  ];

  const lifetimeCards = [
    {
      label: 'Tổng đã thu',
      value: dinhDangTien(lifetime.paidRevenue || 0),
      tone: 'text-brand-700',
      hint: 'Toàn bộ lịch sử hệ thống',
    },
    {
      label: 'Tổng còn phải thu',
      value: dinhDangTien(lifetime.receivableAmount || 0),
      tone: 'text-amber-700',
      hint: 'Tất cả đơn chưa tất toán',
    },
    {
      label: 'Tổng hoàn tiền',
      value: dinhDangTien(lifetime.refundAmount || 0),
      tone: 'text-rose-700',
      hint: `${lifetime.pendingRefunds || 0} yêu cầu đang chờ`,
    },
    {
      label: 'Tổng số đơn',
      value: lifetime.totalBookings || 0,
      hint: `${lifetime.cancelledBookings || 0} đơn hủy, ${lifetime.noShowBookings || 0} no-show`,
    },
  ];

  const periodBreakdown = useMemo(() => taoPhanTichTrongKy(period), [period]);
  const maxValue = Math.max(...periodBreakdown.map(([, value]) => Number(value) || 0), 1);

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">
      <RevenueHeader onReload={() => refresh(dateFrom, dateTo)} />

      <RevenueFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        preset={preset}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        applyPreset={applyPreset}
        applyRange={() => refresh(dateFrom, dateTo)}
      />

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
          Đang tải báo cáo...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <RevenueRangeSection
              title="Doanh thu theo thời gian"
              subtitle={`Từ ${dinhDangNgay(period.dateFrom || dateFrom)} đến ${dinhDangNgay(period.dateTo || dateTo)}`}
              badge="Trong kỳ"
              cards={periodCards}
            />
            <RevenueRangeSection
              title="Tổng doanh thu hệ thống"
              subtitle="Tính toàn bộ lịch sử từ trước đến nay."
              badge="Tích lũy"
              cards={lifetimeCards}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <RevenueBreakdown periodBreakdown={periodBreakdown} maxValue={maxValue} />
            <RevenueQuickAudit period={period} lifetime={lifetime} inventory={inventory} />
          </section>
        </>
      ) : null}
    </div>
  );
}
