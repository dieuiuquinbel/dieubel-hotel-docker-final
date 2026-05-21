// Trang tai khoan: thong tin ca nhan, diem thuong, voucher, phong da luu va ho tro.
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';
import { TRANG_THAI_DAT_PHONG } from '../../utils/lichSuDatPhong';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';
import { docPhongYeuThich, docPhongDaXem } from '../../utils/lichSuXemPhong';
import { QUA_THANH_VIEN, docDiemThuong, docNhiemVuNhanThuong, doiQuaThuong } from '../../utils/diemThuong';
import { useDatPhongCuaToi } from '../../hooks/useDatPhongCuaToi';
import { useKhoVoucherCuaToi } from '../../hooks/useKhoVoucherCuaToi';
import { guiYeuCauHoTroApi, layYeuCauHoanTienCuaToiApi, layYeuCauHoTroCuaToiApi } from '../../services/datPhongApi';

const GOI_Y_DANH_GIA = [
  'Chưa có đánh giá nào. Sau khi hoàn tất đặt phòng, bạn có thể quay lại để viết cảm nhận.',
  'Đánh giá giúp những khách khác chọn phòng phù hợp hơn.',
];

const MUC_THANH_BEN = [
  { id: 'profile', label: 'Tổng quan' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'rewards', label: 'Đổi thưởng' },
  { id: 'wallet', label: 'Kho voucher' },
  { id: 'refunds', label: 'Hoàn tiền' },
  { id: 'support', label: 'Hỗ trợ / khiếu nại' },
  { id: 'tasks', label: 'Nhiệm vụ' },
];

function TaiKhoan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useKhoXacThuc((state) => state.user);
  const setUser = useKhoXacThuc((state) => state.setUser);
  const clearSession = useKhoXacThuc((state) => state.clearSession);
  const [activeSection, setActiveSection] = useState(searchParams.get('supportBooking') ? 'support' : 'profile');
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(() => docDiemThuong());
  const [redeemed, setRedeemed] = useKhoVoucherCuaToi(user);
  const [supportTickets, setSupportTickets] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [supportForm, setSupportForm] = useState({
    bookingCode: searchParams.get('supportBooking') || '',
    category: 'booking',
    title: '',
    content: '',
  });
  const { bookings } = useDatPhongCuaToi(user);

  const viewedRooms = useMemo(() => docPhongDaXem(), []);
  const favoriteRooms = useMemo(() => docPhongYeuThich(), []);
  const completedBookings = bookings.filter((booking) =>
    [TRANG_THAI_DAT_PHONG.CONFIRMED, TRANG_THAI_DAT_PHONG.CHECKED_IN, TRANG_THAI_DAT_PHONG.CHECKED_OUT].includes(booking.bookingStatus),
  );
  const rewardTasks = docNhiemVuNhanThuong({
    user,
    bookings,
    favoriteRooms,
    reviews: bookings.filter((booking) => booking.reviewId),
  });
  const membership = points >= 500 ? 'Vàng' : points >= 200 ? 'Bạc' : 'Cơ bản';

  const refreshRequests = async () => {
    try {
      const [nextTickets, nextRefunds] = await Promise.all([
        layYeuCauHoTroCuaToiApi(),
        layYeuCauHoanTienCuaToiApi(),
      ]);
      setSupportTickets(nextTickets);
      setRefundRequests(nextRefunds);
    } catch {
      setMessage('Không tải được yêu cầu hỗ trợ/hoàn tiền từ MySQL.');
    }
  };

  useEffect(() => {
    refreshRequests();
  }, []);

  const handleSaveProfile = () => {
    const nextName = displayName.trim();
    if (!nextName) {
      setMessage('Tên hiển thị không được để trống.');
      return;
    }

    setUser({ ...user, full_name: nextName });
    setMessage('Đã cập nhật tên hiển thị.');
  };

  const handleRedeem = (reward) => {
    const result = doiQuaThuong(reward);
    setPoints(result.points);
    setRedeemed(result.redeemed);
    setMessage(result.ok ? `Đã đổi ${reward.title}.` : 'Bạn chưa đủ điểm để đổi phần thưởng này.');
  };

  const handleSubmitSupport = async () => {
    if (!supportForm.title.trim() || !supportForm.content.trim()) {
      setMessage('Vui lòng nhập tiêu đề và nội dung hỗ trợ.');
      return;
    }

    try {
      const nextTickets = await guiYeuCauHoTroApi(supportForm);
      setSupportTickets(nextTickets);
      setSupportForm((current) => ({ ...current, title: '', content: '' }));
      setMessage('Đã gửi yêu cầu hỗ trợ. Admin sẽ phản hồi trong khu quản trị.');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Không gửi được yêu cầu hỗ trợ.');
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const renderProfile = () => (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">Thông tin cá nhân</h2>
            <p className="mt-1 text-sm text-slate-500">Chỉ đổi tên hiển thị, tên đăng nhập được giữ nguyên.</p>
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Lưu thay đổi
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Tên hiển thị</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Tên đăng nhập</span>
            <input value={user?.username || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-500 outline-none" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Email</span>
            <input value={user?.email || ''} readOnly className="field-shell px-4 py-4 text-sm font-semibold text-slate-500 outline-none" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Trạng thái email</span>
            <input
              value={user?.email_verified ? 'Đã xác minh' : 'Chưa xác minh'}
              readOnly
              className="field-shell px-4 py-4 text-sm font-semibold text-slate-500 outline-none"
            />
          </label>
        </div>
        {message ? <p className="mt-4 text-sm font-bold text-brand-700">{message}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link to="/my-bookings" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-500">
          <p className="text-sm font-bold text-brand-700">Đặt chỗ</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{bookings.length}</p>
          <p className="mt-2 text-sm text-slate-500">Theo dõi các phòng đã đặt.</p>
        </Link>
        <button
          type="button"
          onClick={() => setActiveSection('history')}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-brand-500"
        >
          <p className="text-sm font-bold text-brand-700">Lịch sử</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{viewedRooms.length}</p>
          <p className="mt-2 text-sm text-slate-500">Phòng đã xem gần đây.</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('reviews')}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-brand-500"
        >
          <p className="text-sm font-bold text-brand-700">Đánh giá</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{completedBookings.length}</p>
          <p className="mt-2 text-sm text-slate-500">Đơn có thể viết đánh giá.</p>
        </button>
      </section>

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-11 w-auto min-w-[132px] flex-none items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-black text-white shadow-sm shadow-brand-500/20 ring-4 ring-sky-100 transition hover:bg-brand-700 hover:ring-sky-200"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Lịch sử xem phòng</h2>
      <p className="mt-1 text-sm text-slate-500">Tách riêng phòng đã xem và phòng đã lưu để khách quay lại nhanh hơn.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-black text-slate-950">Phòng đã xem</h3>
          <div className="mt-4 grid gap-3">
            {viewedRooms.slice(0, 5).map((room) => (
              <Link key={room.id} to={`/rooms/${room.id}`} className="rounded-xl bg-white p-3 text-sm transition hover:text-brand-700">
                <p className="font-black">{room.name}</p>
                <p className="mt-1 text-slate-500">{room.city || room.location}</p>
              </Link>
            ))}
            {!viewedRooms.length ? <p className="text-sm text-slate-500">Chưa có phòng đã xem.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-black text-slate-950">Phòng đã lưu</h3>
          <div className="mt-4 grid gap-3">
            {favoriteRooms.slice(0, 5).map((room) => (
              <Link key={room.id} to={`/rooms/${room.id}`} className="rounded-xl bg-white p-3 text-sm transition hover:text-brand-700">
                <p className="font-black">{room.name}</p>
                <p className="mt-1 text-slate-500">{room.city || room.location}</p>
              </Link>
            ))}
            {!favoriteRooms.length ? <p className="text-sm text-slate-500">Chưa lưu phòng nào.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );

  const renderReviews = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Đánh giá của tôi</h2>
      <p className="mt-1 text-sm text-slate-500">{completedBookings.length} đơn đủ điều kiện viết đánh giá.</p>
      <div className="mt-5 grid gap-3">
        {GOI_Y_DANH_GIA.map((item) => (
          <p key={item} className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {item}
          </p>
        ))}
      </div>
    </section>
  );

  const renderRewards = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Đổi thưởng</h2>
      <p className="mt-1 text-sm text-slate-500">Danh sách voucher có thể đổi. Điểm hiện có: {points}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {QUA_THANH_VIEN.map((reward) => (
          <article key={reward.id} className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-950">{reward.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{reward.description}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-brand-700">{reward.cost} điểm</span>
            </div>
            <button
              type="button"
              onClick={() => handleRedeem(reward)}
              disabled={points < reward.cost}
              className="mt-4 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Đổi ngay
            </button>
          </article>
        ))}
      </div>
      {message ? <p className="mt-4 text-sm font-bold text-brand-700">{message}</p> : null}
    </section>
  );

  const renderWallet = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Kho voucher</h2>
      <p className="mt-1 text-sm text-slate-500">Các voucher đã đổi sẽ nằm riêng tại đây để dễ kiểm tra trước khi đặt phòng.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {redeemed.length ? (
          redeemed.map((reward) => (
            <div key={reward.code} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-black text-slate-950">{reward.title}</p>
              <p className="mt-2 font-bold text-brand-700">{reward.code}</p>
              <p className="mt-2 text-slate-500">Đã lưu vào tài khoản của bạn.</p>
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có voucher nào trong kho.</p>
        )}
      </div>
    </section>
  );

  const renderRefunds = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">Yêu cầu hoàn tiền</h2>
          <p className="mt-1 text-sm text-slate-500">Theo dõi các yêu cầu hủy/hoàn tiền đã gửi từ trang Đặt chỗ của tôi.</p>
        </div>
        <button type="button" onClick={refreshRequests} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black text-slate-700">
          Tải lại
        </button>
      </div>
      <div className="mt-5 grid gap-3">
        {refundRequests.length ? (
          refundRequests.map((refund) => (
            <article key={refund.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">{refund.code} · {refund.bookingId}</p>
                  <p className="mt-1 text-sm font-bold text-slate-600">{refund.hotelName} · {dinhDangNgay(refund.checkIn)} - {dinhDangNgay(refund.checkOut)}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-brand-700">{refund.status}</span>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <p><strong>Đã thanh toán:</strong> {dinhDangTien(refund.paidAmount)}</p>
                <p><strong>Phí hủy 20%:</strong> {dinhDangTien(refund.cancelFeeAmount)}</p>
                <p><strong>Dự kiến hoàn:</strong> {dinhDangTien(refund.refundAmount)}</p>
              </div>
              {refund.adminNote ? <p className="mt-3 rounded-xl bg-white p-3 text-sm font-bold text-slate-600">Admin: {refund.adminNote}</p> : null}
            </article>
          ))
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có yêu cầu hoàn tiền.</p>
        )}
      </div>
    </section>
  );

  const renderSupport = () => (
    <section className="grid gap-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-950">Hỗ trợ / khiếu nại</h2>
        <p className="mt-1 text-sm text-slate-500">Gửi vấn đề tổng quát về đặt phòng, thanh toán, hoàn tiền, dịch vụ hoặc tài khoản.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Đơn liên quan</span>
            <select
              value={supportForm.bookingCode}
              onChange={(event) => setSupportForm((current) => ({ ...current, bookingCode: event.target.value }))}
              className="field-shell px-4 py-4 text-sm font-semibold outline-none"
            >
              <option value="">Không gắn với đơn cụ thể</option>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>{booking.id} · {booking.hotel_name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Loại vấn đề</span>
            <select
              value={supportForm.category}
              onChange={(event) => setSupportForm((current) => ({ ...current, category: event.target.value }))}
              className="field-shell px-4 py-4 text-sm font-semibold outline-none"
            >
              <option value="booking">Đặt phòng</option>
              <option value="payment">Thanh toán</option>
              <option value="refund">Hoàn tiền</option>
              <option value="service">Dịch vụ</option>
              <option value="account">Tài khoản</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Tiêu đề</span>
            <input
              value={supportForm.title}
              onChange={(event) => setSupportForm((current) => ({ ...current, title: event.target.value }))}
              className="field-shell px-4 py-4 text-sm font-semibold outline-none"
            />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Nội dung</span>
            <textarea
              rows={5}
              value={supportForm.content}
              onChange={(event) => setSupportForm((current) => ({ ...current, content: event.target.value }))}
              className="field-shell px-4 py-4 text-sm font-semibold outline-none"
            />
          </label>
        </div>
        <button type="button" onClick={handleSubmitSupport} className="mt-4 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white">
          Gửi yêu cầu
        </button>
        {message ? <p className="mt-4 text-sm font-bold text-brand-700">{message}</p> : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-black text-slate-950">Yêu cầu đã gửi</h3>
        <div className="mt-4 grid gap-3">
          {supportTickets.length ? (
            supportTickets.map((ticket) => (
              <article key={ticket.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-black text-slate-950">{ticket.code} · {ticket.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">{ticket.status}</span>
                </div>
                <p className="mt-2 leading-6 text-slate-600">{ticket.content}</p>
                {ticket.adminReply ? <p className="mt-3 rounded-xl bg-white p-3 font-bold text-brand-700">Admin: {ticket.adminReply}</p> : null}
              </article>
            ))
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có yêu cầu hỗ trợ.</p>
          )}
        </div>
      </div>
    </section>
  );

  const renderTasks = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Nhiệm vụ nhận điểm</h2>
      <p className="mt-1 text-sm text-slate-500">Nhiệm vụ đơn giản, chỉ gắn với hành động thật trong website.</p>
      <div className="mt-5 grid gap-3">
        {rewardTasks.map((task) => (
          <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="font-black text-slate-950">{task.title}</p>
              <p className="mt-1 text-sm font-bold text-brand-700">+{task.points} điểm</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${task.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {task.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  const sectionMap = {
    profile: renderProfile,
    history: renderHistory,
    reviews: renderReviews,
    rewards: renderRewards,
    wallet: renderWallet,
    refunds: renderRefunds,
    support: renderSupport,
    tasks: renderTasks,
  };

  return (
    <main className="history-page-bg flex-1">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="surface-card overflow-hidden">
          <div className="bg-gradient-to-r from-sky-50 via-white to-amber-50 p-6 sm:p-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Xin chào, {user?.full_name}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Quản lý thông tin cá nhân, lịch sử, điểm thưởng và voucher đã đổi.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="self-start rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-28">
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm font-bold text-slate-500">Hạng thành viên</p>
                <p className="mt-2 text-3xl font-black text-brand-700">{membership}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{points} điểm thưởng</p>
              </div>

              <div className="mt-4 grid gap-2">
                {MUC_THANH_BEN.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-black transition ${
                      activeSection === item.id
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                        : 'text-slate-600 hover:bg-sky-50 hover:text-brand-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-500">Tổng quan nhanh</p>
                <div className="mt-4 grid gap-3 text-sm font-bold text-slate-700">
                  <p>{bookings.length} đặt chỗ</p>
                  <p>{viewedRooms.length} phòng đã xem</p>
                  <p>{favoriteRooms.length} phòng đã lưu</p>
                  <p>{redeemed.length} voucher đã đổi</p>
                </div>
              </div>
            </aside>

            <div className="grid gap-6">
              {sectionMap[activeSection]()}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default TaiKhoan;
