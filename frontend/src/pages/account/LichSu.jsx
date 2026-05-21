// Trang lich su: tong hop phong da xem, phong yeu thich, don thanh cong va don da huy.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThePhong from '../../components/rooms/ThePhong';
import useKhoXacThuc from '../../store/khoXacThuc';
import {
  TRANG_THAI_DAT_PHONG,
  NHAN_TRANG_THAI_DAT_PHONG,
  KIEU_DAT_PHONG,
  NHAN_KIEU_DAT_PHONG,
  NHAN_TRANG_THAI_THANH_TOAN,
  TRANG_THAI_THANH_TOAN,
  tinhChinhSachHoanTien,
  luuDanhGiaDatPhong,
} from '../../utils/lichSuDatPhong';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';
import { resolveMediaUrl } from '../../utils/media';
import { xoaPhongDaXem, docPhongYeuThich, docPhongDaXem } from '../../utils/lichSuXemPhong';
import { useDatPhongCuaToi } from '../../hooks/useDatPhongCuaToi';
import { taoYeuCauHoanTienApi } from '../../services/datPhongApi';

const TAB_LICH_SU = [
  { key: 'viewed', label: 'Phòng đã xem' },
  { key: 'favorites', label: 'Phòng đã lưu' },
  { key: 'completed', label: 'Đặt phòng thành công' },
  { key: 'cancelled', label: 'Lịch sử hủy chỗ' },
];

function TheLichSuDatPhong({
  booking,
  user,
  reviewDraft,
  refundDraft = {},
  refundOpen,
  onReviewChange,
  onSubmitReview,
  onRefundChange = () => undefined,
  onRefundToggle = () => undefined,
  onRefundSubmit = () => undefined,
}) {
  const canRequestRefund =
    booking.bookingStatus === TRANG_THAI_DAT_PHONG.CONFIRMED &&
    [TRANG_THAI_THANH_TOAN.DEPOSIT_PAID, TRANG_THAI_THANH_TOAN.PAID].includes(booking.paymentStatus) &&
    !booking.refundRequest;
  const { cancelFeeAmount, refundAmount } = tinhChinhSachHoanTien(booking.paidAmount);

  return (
    <article className="subtle-card grid overflow-hidden md:grid-cols-[220px_minmax(0,1fr)]">
      <img src={resolveMediaUrl(booking.image_url)} alt={booking.hotel_name} className="h-52 w-full object-cover md:h-full" />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {NHAN_TRANG_THAI_DAT_PHONG[booking.bookingStatus] || booking.bookingStatus}
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-brand-700">
            {NHAN_TRANG_THAI_THANH_TOAN[booking.paymentStatus] || booking.paymentStatus}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{booking.id}</span>
        </div>

        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{booking.hotel_name}</h2>
        <p className="mt-1 text-sm font-bold text-slate-600">{booking.room_name}</p>
        <p className="mt-2 text-sm leading-7 text-slate-500">{booking.address}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-500">Hình thức</p>
            <p className="mt-1 text-sm font-black text-slate-950">{NHAN_KIEU_DAT_PHONG[booking.bookingType] || 'Qua đêm'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-500">Thời gian</p>
            <p className="mt-1 text-sm font-black text-slate-950">{dinhDangNgay(booking.checkIn) || 'Chưa chọn'}</p>
            {booking.bookingType === KIEU_DAT_PHONG.DAY_USE ? (
              <p className="mt-1 text-xs font-bold text-slate-500">{booking.timeSlot?.label} · {booking.timeSlot?.time}</p>
            ) : (
              <p className="mt-1 text-xs font-bold text-slate-500">Trả: {dinhDangNgay(booking.checkOut) || 'Chưa chọn'}</p>
            )}
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-500">Tổng tiền</p>
            <p className="mt-1 text-sm font-black text-brand-700">{dinhDangTien(booking.totalPrice)}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to={`/rooms/${booking.roomId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-bold text-brand-700 transition hover:bg-sky-50"
          >
            Xem lại khách sạn
          </Link>
          <button
            type="button"
            disabled={!canRequestRefund}
            onClick={() => onRefundToggle(booking.id)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {booking.refundRequest ? 'Đang chờ hoàn tiền' : 'Yêu cầu hủy / hoàn tiền'}
          </button>
          <Link
            to={`/me?supportBooking=${booking.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            Hỗ trợ / khiếu nại
          </Link>
        </div>

        {booking.refundRequest ? (
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm">
            <p className="font-black text-slate-950">Yêu cầu hoàn tiền: {booking.refundRequest.code}</p>
            <p className="mt-1 font-bold text-amber-700">
              Trạng thái: {booking.refundRequest.status} · Dự kiến hoàn {dinhDangTien(booking.refundRequest.refundAmount)}
            </p>
          </div>
        ) : null}

        {refundOpen ? (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-950">Thông tin nhận hoàn tiền</p>
                <p className="mt-1 text-xs font-bold leading-6 text-slate-600">
                  Phí hủy 20%: {dinhDangTien(cancelFeeAmount)}. Số tiền hoàn dự kiến: {dinhDangTien(refundAmount)}.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-rose-700">Admin duyệt</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['bankAccountName', 'Tên chủ tài khoản'],
                ['bankName', 'Ngân hàng'],
                ['bankAccountNumber', 'Số tài khoản'],
                ['phone', 'Số điện thoại'],
                ['email', 'Email nhận thông báo'],
              ].map(([field, label]) => (
                <label key={field} className="grid gap-1 text-xs font-bold text-slate-600">
                  {label}
                  <input
                    value={refundDraft[field] || (field === 'email' ? user?.email || '' : '')}
                    onChange={(event) => onRefundChange(booking.id, { ...refundDraft, [field]: event.target.value })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none focus:border-brand-500"
                  />
                </label>
              ))}
              <label className="grid gap-1 text-xs font-bold text-slate-600 sm:col-span-2">
                Lý do hủy
                <textarea
                  rows={3}
                  value={refundDraft.reason || ''}
                  onChange={(event) => onRefundChange(booking.id, { ...refundDraft, reason: event.target.value })}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none focus:border-brand-500"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onRefundSubmit(booking)}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-rose-700"
              >
                Gửi yêu cầu
              </button>
              <button
                type="button"
                onClick={() => onRefundToggle(booking.id, false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : null}

        {booking.bookingStatus === TRANG_THAI_DAT_PHONG.CHECKED_OUT && !booking.reviewId ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Viết đánh giá</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)_120px]">
              <select
                value={reviewDraft?.rating || 5}
                onChange={(event) => onReviewChange(booking.id, { ...reviewDraft, rating: event.target.value })}
                className="field-shell px-3 py-3 text-sm font-bold outline-none"
              >
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}
              </select>
              <input
                value={reviewDraft?.content || ''}
                onChange={(event) => onReviewChange(booking.id, { ...reviewDraft, content: event.target.value })}
                placeholder="Cảm nhận của bạn"
                className="field-shell px-3 py-3 text-sm font-semibold outline-none"
              />
              <button type="button" onClick={() => onSubmitReview(booking)} className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white">
                Gửi
              </button>
            </div>
          </div>
        ) : booking.reviewId ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Đã đánh giá đơn này.</p>
        ) : null}
      </div>
    </article>
  );
}

function BangTrong({ title, description }) {
  return (
    <div className="surface-card mt-5 p-8 text-center">
      <p className="text-sm font-bold text-brand-700">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function LichSu() {
  const user = useKhoXacThuc((state) => state.user);
  const [activeTab, setActiveTab] = useState('viewed');
  const [reviewByBooking, setReviewByBooking] = useState({});
  const [refundOpenByBooking, setRefundOpenByBooking] = useState({});
  const [refundByBooking, setRefundByBooking] = useState({});
  const [notice, setNotice] = useState('');
  const { bookings, refresh: refreshBookings } = useDatPhongCuaToi(user);
  const viewedRooms = docPhongDaXem();
  const favoriteRooms = docPhongYeuThich();
  const completedBookings = bookings.filter((booking) =>
    [TRANG_THAI_DAT_PHONG.CONFIRMED, TRANG_THAI_DAT_PHONG.CHECKED_IN, TRANG_THAI_DAT_PHONG.CHECKED_OUT].includes(booking.bookingStatus),
  );
  const cancelledBookings = bookings.filter((booking) =>
    [TRANG_THAI_DAT_PHONG.CANCELLED, TRANG_THAI_DAT_PHONG.NO_SHOW].includes(booking.bookingStatus),
  );

  const refresh = () => refreshBookings().catch(() => undefined);
  const updateReviewDraft = (bookingId, draft) => setReviewByBooking((current) => ({ ...current, [bookingId]: draft }));
  const updateRefundDraft = (bookingId, draft) => setRefundByBooking((current) => ({ ...current, [bookingId]: draft }));
  const toggleRefundForm = (bookingId, forcedValue) => {
    setRefundOpenByBooking((current) => ({
      ...current,
      [bookingId]: typeof forcedValue === 'boolean' ? forcedValue : !current[bookingId],
    }));
  };
  const submitReview = (booking) => {
    luuDanhGiaDatPhong({ booking, ...(reviewByBooking[booking.id] || { rating: 5, content: '' }) });
    refresh();
  };
  const submitRefundRequest = async (booking) => {
    const draft = refundByBooking[booking.id] || {};
    const refundPayload = {
      bankName: draft.bankName,
      bankAccountName: draft.bankAccountName,
      bankAccountNumber: draft.bankAccountNumber,
      phone: draft.phone,
      email: draft.email || user?.email,
      reason: draft.reason,
    };
    const requiredFields = ['bankName', 'bankAccountName', 'bankAccountNumber', 'phone', 'email'];
    const missingField = requiredFields.some((field) => !String(refundPayload[field] || '').trim());

    if (missingField) {
      setNotice('Vui lòng nhập đủ thông tin nhận hoàn tiền trước khi gửi yêu cầu.');
      return;
    }

    try {
      await taoYeuCauHoanTienApi(booking.id, refundPayload);
      setRefundOpenByBooking((current) => ({ ...current, [booking.id]: false }));
      setRefundByBooking((current) => ({ ...current, [booking.id]: {} }));
      setNotice(`Đã gửi yêu cầu hủy/hoàn tiền cho đơn ${booking.id}. Admin sẽ duyệt trước khi phòng được mở lại.`);
      await refreshBookings();
    } catch (error) {
      setNotice(error?.response?.data?.message || 'Không tạo được yêu cầu hủy/hoàn tiền trên MySQL.');
    }
  };

  const renderContent = () => {
    if (activeTab === 'favorites') {
      return favoriteRooms.length ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3" onClick={refresh}>
          {favoriteRooms.map((room) => <ThePhong key={`favorite-${room.id}`} room={room} layout="vertical" />)}
        </div>
      ) : <BangTrong title="Chưa có phòng đã lưu" description="Nhấn nút yêu thích ở trang chi tiết hoặc thẻ khách sạn để lưu lại." />;
    }

    if (activeTab === 'completed') {
      return completedBookings.length ? (
        <div className="mt-5 grid gap-5">
          {completedBookings.map((booking) => (
            <TheLichSuDatPhong
              key={`completed-${booking.id}`}
              booking={booking}
              user={user}
              reviewDraft={reviewByBooking[booking.id]}
              refundDraft={refundByBooking[booking.id]}
              refundOpen={Boolean(refundOpenByBooking[booking.id])}
              onReviewChange={updateReviewDraft}
              onSubmitReview={submitReview}
              onRefundChange={updateRefundDraft}
              onRefundToggle={toggleRefundForm}
              onRefundSubmit={submitRefundRequest}
            />
          ))}
        </div>
      ) : <BangTrong title="Chưa có lịch sử đặt phòng thành công" description="Các đơn đã thanh toán/cọc hoặc đã trả phòng sẽ được lưu ở đây." />;
    }

    if (activeTab === 'cancelled') {
      return cancelledBookings.length ? (
        <div className="mt-5 grid gap-5">
          {cancelledBookings.map((booking) => <TheLichSuDatPhong key={`cancelled-${booking.id}`} booking={booking} user={user} />)}
        </div>
      ) : <BangTrong title="Chưa có lịch sử hủy chỗ" description="Khi bạn hủy giữ chỗ, đơn sẽ rời khỏi Đặt chỗ của tôi và nằm tại đây." />;
    }

    return viewedRooms.length ? (
      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3" onClick={refresh}>
        {viewedRooms.map((room) => <ThePhong key={`viewed-${room.id}`} room={room} layout="vertical" />)}
      </div>
    ) : <BangTrong title="Chưa có lịch sử xem" description="Mở một khách sạn bất kỳ để hệ thống lưu vào tab này." />;
  };

  return (
    <main className="history-page-bg flex-1">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Lịch sử</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Nhật ký phòng và đặt chỗ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Lưu lại phòng đã xem, phòng đã lưu, các đơn thành công và những đơn đã hủy để bạn kiểm tra lại khi cần.
            </p>
          </div>
          {activeTab === 'viewed' ? (
            <button
              type="button"
              onClick={() => {
                xoaPhongDaXem();
                refresh();
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
            >
              Xóa lịch sử xem
            </button>
          ) : null}
        </div>

        {notice ? (
          <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-bold text-brand-700">
            {notice}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="self-start rounded-2xl border border-slate-200 bg-white p-3 lg:sticky lg:top-28">
            {TAB_LICH_SU.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`mb-2 w-full rounded-xl px-4 py-3 text-left text-sm font-black transition last:mb-0 ${
                  activeTab === tab.key ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20' : 'text-slate-600 hover:bg-sky-50 hover:text-brand-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </aside>

          <section className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-950">{TAB_LICH_SU.find((tab) => tab.key === activeTab)?.label}</h2>
            </div>
            {renderContent()}
          </section>
        </div>
      </section>
    </main>
  );
}

export default LichSu;
