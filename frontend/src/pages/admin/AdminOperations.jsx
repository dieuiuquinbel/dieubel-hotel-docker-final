// Admin van hanh: xu ly yeu cau hoan tien, ho tro khach hang va bao cao doanh thu.
import { useEffect, useState } from 'react';
import {
  capNhatYeuCauHoanTienAdminApi,
  capNhatYeuCauHoTroAdminApi,
  layBaoCaoDoanhThuAdminApi,
  layYeuCauHoanTienAdminApi,
  layYeuCauHoTroAdminApi,
} from '../../services/datPhongApi';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';

function StatCard({ label, value, tone = 'text-slate-950' }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
    </article>
  );
}

function AdminOperations() {
  const [report, setReport] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [replyByTicket, setReplyByTicket] = useState({});
  const [noteByRefund, setNoteByRefund] = useState({});

  const refresh = async () => {
    setError('');
    try {
      const [nextReport, nextRefunds, nextTickets] = await Promise.all([
        layBaoCaoDoanhThuAdminApi(),
        layYeuCauHoanTienAdminApi(),
        layYeuCauHoTroAdminApi(),
      ]);
      setReport(nextReport);
      setRefunds(nextRefunds);
      setTickets(nextTickets);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không tải được dữ liệu vận hành từ MySQL.');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRefund = async (refund, status) => {
    try {
      const data = await capNhatYeuCauHoanTienAdminApi(refund.id, status, noteByRefund[refund.id] || '');
      setRefunds(data);
      await refresh();
      setNotice(status === 'rejected' ? 'Đã từ chối yêu cầu hoàn tiền.' : 'Đã duyệt yêu cầu hoàn tiền và trả phòng về kho.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không cập nhật được yêu cầu hoàn tiền.');
    }
  };

  const handleTicket = async (ticket, status) => {
    try {
      const data = await capNhatYeuCauHoTroAdminApi(ticket.id, status, replyByTicket[ticket.id] || '');
      setTickets(data);
      setNotice('Đã cập nhật yêu cầu hỗ trợ.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Không cập nhật được yêu cầu hỗ trợ.');
    }
  };

  const cards = [
    ['Tổng đơn', report?.totalBookings || 0],
    ['Doanh thu đã thu', dinhDangTien(report?.paidRevenue || 0), 'text-brand-700'],
    ['Còn phải thu', dinhDangTien(report?.receivableAmount || 0)],
    ['Voucher đã giảm', dinhDangTien(report?.voucherDiscount || 0)],
    ['Yêu cầu hoàn tiền', report?.refundRequests || 0, 'text-rose-600'],
    ['Phí hủy giữ lại', dinhDangTien(report?.cancelFeeRevenue || 0), 'text-emerald-700'],
    ['Dự kiến hoàn', dinhDangTien(report?.refundAmount || 0), 'text-amber-700'],
    ['Phòng còn trong kho', report?.availableRooms || 0],
  ];

  return (
    <div className="grid gap-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">Vận hành</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Hoàn tiền, khiếu nại và doanh thu</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Hàng đợi này tách khỏi bảng đặt phòng để admin xử lý yêu cầu hủy/hoàn tiền và hỗ trợ khách rõ ràng hơn.
            </p>
          </div>
          <button type="button" onClick={refresh} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white">
            Tải lại
          </button>
        </div>
      </section>

      {notice ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">{error}</div> : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, tone]) => <StatCard key={label} label={label} value={value} tone={tone} />)}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-950">Yêu cầu hủy / hoàn tiền</h3>
          <div className="mt-4 grid gap-3">
            {refunds.length ? (
              refunds.map((refund) => (
                <article key={refund.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{refund.code} · {refund.bookingId}</p>
                      <p className="mt-1 font-bold text-slate-600">{refund.guestName} · {refund.hotelName}</p>
                      <p className="mt-1 text-slate-500">{dinhDangNgay(refund.checkIn)} - {dinhDangNgay(refund.checkOut)}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-brand-700">{refund.status}</span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <p><strong>Đã thu:</strong> {dinhDangTien(refund.paidAmount)}</p>
                    <p><strong>Phí 20%:</strong> {dinhDangTien(refund.cancelFeeAmount)}</p>
                    <p><strong>Hoàn 80%:</strong> {dinhDangTien(refund.refundAmount)}</p>
                  </div>
                  <p className="mt-2 text-slate-600">TK: {refund.bankAccountName} · {refund.bankName} · {refund.bankAccountNumber}</p>
                  {refund.reason ? <p className="mt-2 text-slate-600">Lý do: {refund.reason}</p> : null}
                  <textarea
                    value={noteByRefund[refund.id] || ''}
                    onChange={(event) => setNoteByRefund((current) => ({ ...current, [refund.id]: event.target.value }))}
                    rows={2}
                    placeholder="Ghi chú admin"
                    className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold outline-none focus:border-brand-500"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button disabled={refund.status !== 'pending'} onClick={() => handleRefund(refund, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:bg-slate-300">
                      Duyệt hoàn tiền
                    </button>
                    <button disabled={refund.status !== 'pending'} onClick={() => handleRefund(refund, 'rejected')} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-700 disabled:text-slate-400">
                      Từ chối
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Chưa có yêu cầu hoàn tiền.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-950">Hỗ trợ / khiếu nại</h3>
          <div className="mt-4 grid gap-3">
            {tickets.length ? (
              tickets.map((ticket) => (
                <article key={ticket.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{ticket.code} · {ticket.title}</p>
                      <p className="mt-1 font-bold text-slate-600">{ticket.guestName} · {ticket.guestEmail}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">{ticket.status}</span>
                  </div>
                  <p className="mt-3 leading-6 text-slate-600">{ticket.content}</p>
                  <textarea
                    value={replyByTicket[ticket.id] || ticket.adminReply || ''}
                    onChange={(event) => setReplyByTicket((current) => ({ ...current, [ticket.id]: event.target.value }))}
                    rows={3}
                    placeholder="Phản hồi cho khách"
                    className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold outline-none focus:border-brand-500"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => handleTicket(ticket, 'processing')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700">
                      Đang xử lý
                    </button>
                    <button onClick={() => handleTicket(ticket, 'resolved')} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-black text-white">
                      Phản hồi & đóng
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Chưa có yêu cầu hỗ trợ.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminOperations;
