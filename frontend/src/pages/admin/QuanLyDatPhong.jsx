// Chức năng: Trang admin quản lý trạng thái đơn đặt phòng.
// Màn điều hành đơn đặt phòng cho quản lý.
// File này chỉ điều phối dữ liệu, chọn tab, lọc đơn và nối sự kiện với các component con.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  capNhatTrangThaiDatPhongAdminApi,
  capNhatYeuCauHoanTienAdminApi,
  layTatCaDatPhongAdminApi,
  luuGhiChuAdminApi,
  xacNhanThanhToanAdminApi,
} from '../../services/datPhongApi';
import { PHUONG_THUC_THANH_TOAN, TRANG_THAI_DAT_PHONG } from '../../utils/lichSuDatPhong';
import BookingDetail from '../../components/admin/bookings/BookingDetail';
import BookingQueueItem from '../../components/admin/bookings/BookingQueueItem';
import { TABS_DAT_PHONG } from '../../components/admin/bookings/bookingConstants';
import {
  chonTabMacDinh,
  demDonTheoTab,
  khopNgayDatPhong,
  khopTabDatPhong,
  khopTimKiemDatPhong,
  laTabHopLe,
  taoThongKeHangDoi,
} from '../../components/admin/bookings/bookingHelpers';
import { TheThongKeHangDoi } from '../../components/admin/bookings/BookingShared';

export default function QuanLyDatPhong() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState('confirmed');
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [note, setNote] = useState('');
  const [refundDecisionNote, setRefundDecisionNote] = useState('');

  const filteredBookings = useMemo(
    () => bookings
      .filter((booking) => khopTabDatPhong(booking, tab))
      .filter((booking) => khopTimKiemDatPhong(booking, query))
      .filter((booking) => khopNgayDatPhong(booking, dateFilter)),
    [bookings, dateFilter, query, tab],
  );

  const selectedBooking = filteredBookings.find((booking) => booking.id === selectedId) || filteredBookings[0] || null;
  const queueStats = useMemo(() => taoThongKeHangDoi(bookings), [bookings]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await layTatCaDatPhongAdminApi();
      setBookings(data);

      const requestedTab = searchParams.get('tab');
      setTab(laTabHopLe(requestedTab) ? requestedTab : chonTabMacDinh(data));
      setSelectedId((current) => (current && data.some((booking) => booking.id === current) ? current : data[0]?.id || null));
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không tải được dữ liệu đặt phòng.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (laTabHopLe(requestedTab)) {
      setTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    setSelectedId(null);
  }, [tab, query, dateFilter]);

  useEffect(() => {
    setNote(selectedBooking?.adminNote || '');
    setRefundDecisionNote(selectedBooking?.refundRequest?.adminNote || '');
  }, [selectedBooking?.adminNote, selectedBooking?.id, selectedBooking?.refundRequest?.adminNote]);

  const runBookingMutation = async (action, successMessage) => {
    if (!selectedBooking) return;

    setError('');
    try {
      const data = await action();
      setBookings(data);
      setSelectedId(selectedBooking.id);
      setNotice(successMessage);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Thao tác thất bại. Dữ liệu không được cập nhật.');
    }
  };

  const handleStatus = (bookingId, status, actionNote) =>
    runBookingMutation(() => capNhatTrangThaiDatPhongAdminApi(bookingId, status, actionNote), 'Đã cập nhật trạng thái đặt phòng.');

  const handlePayment = (bookingId, method) =>
    runBookingMutation(() => xacNhanThanhToanAdminApi(bookingId, method), 'Đã ghi nhận thanh toán cho trường hợp ngoại lệ.');

  const handleSaveNote = (bookingId) =>
    runBookingMutation(() => luuGhiChuAdminApi(bookingId, note), 'Đã lưu ghi chú nội bộ.');

  const handleRefundDecision = async (refundId, status) => {
    setError('');
    try {
      await capNhatYeuCauHoanTienAdminApi(refundId, status, refundDecisionNote);
      await refresh();
      setNotice(status === 'rejected' ? 'Đã từ chối yêu cầu hủy / hoàn tiền.' : 'Đã duyệt yêu cầu hủy / hoàn tiền.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không cập nhật được yêu cầu hủy / hoàn tiền.');
    }
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setSelectedId(null);
    if (nextTab === 'confirmed') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: nextTab }, { replace: true });
    }
  };

  return (
    <div className="grid gap-5">

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Vận hành</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Duyệt đặt phòng và lưu trú</h1>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          >
            <path fillRule="evenodd" d="M4 2a1 1 0 0 1 1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 0 14.001 13H11a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .61-1.276z" clipRule="evenodd" />
          </svg>
          Tải lại
        </button>
      </section>

      {/* Queue stats */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {queueStats.map((item) => (
          <TheThongKeHangDoi
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={item.tone}
            onClick={() => handleTabChange(item.tabKey)}
          />
        ))}
      </section>

      {/* Tabs */}
      <section className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="grid gap-1.5 md:grid-cols-3 xl:grid-cols-7">
          {TABS_DAT_PHONG.map((item) => {
            const count = demDonTheoTab(bookings, item.key);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabChange(item.key)}
                className={`rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                  tab === item.key
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <span className="flex items-center justify-between gap-1">
                  <span className="block truncate text-sm font-black">{item.label}</span>
                  {count > 0 ? (
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                      tab === item.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search + Date filter */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_200px]">
          <div className="relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 10.89 3.476l4.817 4.817a1 1 0 0 1-1.414 1.414l-4.816-4.816A6 6 0 0 1 2 8z" clipRule="evenodd" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm mã đơn hoặc tên khách"
              className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm font-semibold outline-none transition focus:border-sky-400"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-400"
          />
        </div>
      </section>

      {/* Notices */}
      {notice ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-600">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-emerald-700">{notice}</p>
        </div>
      ) : null}
      {error ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-600">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-rose-700">{error}</p>
        </div>
      ) : null}

      {/* Queue + Detail */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-950">Hàng đợi công việc</h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">Mỗi đơn cho biết quản lý cần làm gì tiếp theo.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {filteredBookings.length} đơn
            </span>
          </div>

          <div className="grid gap-2.5">
            {isLoading ? (
              // Skeleton loader
              <div className="grid gap-2.5 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex justify-between gap-3">
                      <div className="grid gap-2">
                        <div className="h-3 w-28 rounded bg-slate-200" />
                        <div className="h-4 w-36 rounded bg-slate-200" />
                        <div className="h-3 w-48 rounded bg-slate-100" />
                      </div>
                      <div className="grid gap-1.5">
                        <div className="h-5 w-20 rounded-full bg-slate-200" />
                        <div className="h-5 w-16 rounded-full bg-slate-100" />
                      </div>
                    </div>
                    <div className="mt-3 h-14 rounded-lg bg-slate-50" />
                  </div>
                ))}
              </div>
            ) : filteredBookings.length ? (
              filteredBookings.map((booking) => (
                <BookingQueueItem
                  key={booking.id}
                  booking={booking}
                  selected={selectedBooking?.id === booking.id}
                  onSelect={() => setSelectedId(booking.id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 px-4 py-10 text-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-slate-300">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM7 9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-bold text-slate-500">Không có đơn phù hợp</p>
              </div>
            )}
          </div>
        </div>

        <BookingDetail
          booking={selectedBooking}
          note={note}
          refundDecisionNote={refundDecisionNote}
          setNote={setNote}
          setRefundDecisionNote={setRefundDecisionNote}
          onStatus={handleStatus}
          onPayment={handlePayment}
          onSaveNote={handleSaveNote}
          onRefundDecision={handleRefundDecision}
        />
      </section>
    </div>
  );
}
