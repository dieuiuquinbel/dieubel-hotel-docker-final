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
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Duyệt đặt phòng và lịch sử lưu trú</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Màn điều hành cho các việc quản lý phải quyết định hoặc thao tác trong ngày.</p>
        </div>
        <button onClick={refresh} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700">
          Tải lại
        </button>
      </section>

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

      <section className="rounded-lg border border-slate-200 bg-white p-2">
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-7">
          {TABS_DAT_PHONG.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleTabChange(item.key)}
              className={`rounded-lg px-3 py-3 text-left transition ${tab === item.key ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <span className="block text-sm font-black">{item.label}</span>
              <span className="mt-1 block text-xs font-bold opacity-70">{demDonTheoTab(bookings, item.key)} đơn</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm mã đơn hoặc tên khách trong đơn"
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500"
          />
        </div>
      </section>

      {notice ? <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">Hàng đợi công việc</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Mỗi đơn cho biết quản lý cần làm gì tiếp theo.</p>
            </div>
            <p className="text-sm font-black text-slate-500">{filteredBookings.length} đơn</p>
          </div>

          <div className="grid gap-3">
            {isLoading ? (
              <div className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">Đang tải dữ liệu đặt phòng...</div>
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
              <div className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">Không có đơn phù hợp.</div>
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
