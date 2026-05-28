// Chức năng: Trang tài khoản, điểm thưởng, voucher và hỗ trợ.
// Trang tai khoan: thong tin ca nhan, diem thuong, voucher, phong da luu va ho tro.
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import useKhoXacThuc from '../../store/khoXacThuc';
import { TRANG_THAI_DAT_PHONG } from '../../utils/lichSuDatPhong';
import { dinhDangNgay, dinhDangTien } from '../../utils/dinhDang';
import { docPhongYeuThich, docPhongDaXem } from '../../utils/lichSuXemPhong';
import { QUA_THANH_VIEN, docDiemThuong, docNhiemVuNhanThuong, doiQuaThuong } from '../../utils/diemThuong';
import { useDatPhongCuaToi } from '../../hooks/useDatPhongCuaToi';
import { useKhoVoucherCuaToi } from '../../hooks/useKhoVoucherCuaToi';
import { guiYeuCauHoTroApi, layYeuCauHoanTienCuaToiApi, layYeuCauHoTroCuaToiApi } from '../../services/datPhongApi';
import { resolveMediaUrl } from '../../utils/media';

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
  const location = useLocation();
  const supportBooking = searchParams.get('supportBooking');
  const user = useKhoXacThuc((state) => state.user);
  const setUser = useKhoXacThuc((state) => state.setUser);
  const clearSession = useKhoXacThuc((state) => state.clearSession);
  const [activeSection, setActiveSection] = useState(supportBooking ? 'support' : 'profile');
  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(() => docDiemThuong());
  const [redeemed, setRedeemed] = useKhoVoucherCuaToi(user);
  const [supportTickets, setSupportTickets] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [supportForm, setSupportForm] = useState({
    bookingCode: supportBooking || '',
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
  const nextTierInfo = useMemo(() => {
    if (points >= 500) return { label: 'Tối đa', progress: 100, text: 'Bạn đã đạt hạng cao nhất!' };
    if (points >= 200) return { label: 'Vàng', progress: ((points - 200) / 300) * 100, text: `Cần thêm ${500 - points} điểm để lên hạng Vàng.` };
    return { label: 'Bạc', progress: (points / 200) * 100, text: `Cần thêm ${200 - points} điểm để lên hạng Bạc.` };
  }, [points]);

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

  useEffect(() => {
    if (location.pathname === '/me' && !supportBooking) {
      setActiveSection('profile');
    }
  }, [location.pathname, supportBooking]);

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
      <p className="mt-1 text-sm text-slate-500">Xem lại các phòng bạn đã tham khảo hoặc lưu trữ gần đây.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-black text-slate-950">Phòng đã xem</h3>
          <div className="mt-4 grid gap-3">
            {viewedRooms.slice(0, 5).map((room) => (
              <Link key={room.id} to={`/rooms/${room.id}`} className="flex items-center gap-4 rounded-xl bg-white p-3 transition hover:shadow-sm">
                <img src={resolveMediaUrl(room.image_url) || '/images/default-room.jpg'} alt={room.name} className="h-16 w-16 rounded-lg object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-black text-slate-950">{room.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{room.city || room.location}</p>
                </div>
              </Link>
            ))}
            {!viewedRooms.length ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
                <p className="text-sm font-bold text-slate-500">Chưa có phòng đã xem.</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-black text-slate-950">Phòng đã lưu</h3>
          <div className="mt-4 grid gap-3">
            {favoriteRooms.slice(0, 5).map((room) => (
              <div key={room.id} className="group relative flex items-center gap-4 rounded-xl bg-white p-3 transition hover:shadow-sm">
                <img src={resolveMediaUrl(room.image_url) || '/images/default-room.jpg'} alt={room.name} className="h-16 w-16 rounded-lg object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-black text-slate-950">{room.name}</p>
                  <p className="mt-1 text-xs font-bold text-brand-700">{dinhDangTien(room.price || 0)}/đêm</p>
                </div>
                <Link to={`/rooms/${room.id}`} className="absolute inset-0 rounded-xl ring-2 ring-transparent transition group-hover:ring-brand-500"></Link>
              </div>
            ))}
            {!favoriteRooms.length ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
                <p className="text-sm font-bold text-slate-500">Chưa lưu phòng nào.</p>
              </div>
            ) : null}
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
        {completedBookings.length ? (
          completedBookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-bold text-slate-950">{booking.hotel_name}</p>
              <Link to="/my-bookings" className="mt-3 inline-block rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition">
                Đến trang đặt chỗ để đánh giá
              </Link>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-sky-50 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm text-brand-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="mt-4 text-base font-black text-slate-900">Bạn chưa có chuyến đi nào gần đây!</p>
            <p className="mt-2 text-sm text-slate-600">Đặt phòng ngay để trải nghiệm và để lại đánh giá nhé.</p>
            <Link to="/rooms" className="mt-5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-black text-white transition hover:bg-brand-700 shadow-sm shadow-brand-500/30">
              Khám phá chỗ ở
            </Link>
          </div>
        )}
      </div>
    </section>
  );

  const renderRewards = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Đổi thưởng</h2>
      <p className="mt-1 text-sm text-slate-500">Sử dụng điểm tích lũy để đổi lấy các phần quà giá trị. Điểm hiện có: {points}</p>
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

  const renderWallet = () => {
    const sortedRedeemed = [...redeemed].sort((a, b) => {
      const aTime = new Date(a.redeemedAt || a.savedAt).getTime();
      const bTime = new Date(b.redeemedAt || b.savedAt).getTime();
      return aTime - bTime;
    });

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-950">Kho voucher</h2>
        <p className="mt-1 text-sm text-slate-500">Các mã ưu đãi bạn đã đổi hoặc lưu vào tài khoản.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {sortedRedeemed.length ? (
            sortedRedeemed.map((reward) => {
              const savedTime = new Date(reward.redeemedAt || reward.savedAt).getTime();
              const expireMatch = String(reward.expiresIn || '').match(/\d+/);
              const expireDays = expireMatch ? Number(expireMatch[0]) : 7;
              const expireTime = savedTime + expireDays * 24 * 60 * 60 * 1000;
              const daysLeft = Math.ceil((expireTime - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft > 0 && daysLeft <= 3;

              return (
                <div key={reward.code} className={`relative overflow-hidden rounded-2xl border ${isUrgent ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'} p-5`}>
                  {isUrgent && (
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-rose-500 px-3 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                      Sắp hết hạn
                    </div>
                  )}
                  <p className="pr-16 font-black text-slate-950">{reward.title}</p>
                  <p className={`mt-2 font-black ${isUrgent ? 'text-rose-600' : 'text-brand-700'}`}>{reward.code}</p>
                  <p className={`mt-2 text-xs font-semibold ${isUrgent ? 'text-rose-500' : 'text-slate-500'}`}>
                    {daysLeft > 0 ? `Hết hạn trong ${daysLeft} ngày nữa.` : 'Đã hết hạn.'}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có voucher nào trong kho.</p>
          )}
        </div>
      </section>
    );
  };

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
    <section className="grid gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">Hỗ trợ & Khiếu nại</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Chúng tôi luôn sẵn sàng lắng nghe và giải quyết vấn đề của bạn liên quan đến dịch vụ, thanh toán hay trải nghiệm lưu trú.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-700">Đơn đặt phòng liên quan</span>
            <div className="relative">
              <select
                value={supportForm.bookingCode}
                onChange={(event) => setSupportForm((current) => ({ ...current, bookingCode: event.target.value }))}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-sky-50"
              >
                <option value="">Không gắn với đơn cụ thể</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>{booking.id} · {booking.hotel_name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-700">Chủ đề cần hỗ trợ</span>
            <div className="relative">
              <select
                value={supportForm.category}
                onChange={(event) => setSupportForm((current) => ({ ...current, category: event.target.value }))}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-sky-50"
              >
                <option value="booking">Đặt phòng & Tình trạng phòng</option>
                <option value="payment">Thanh toán & Hóa đơn</option>
                <option value="refund">Hoàn tiền & Hủy đơn</option>
                <option value="service">Dịch vụ & Tiện ích khách sạn</option>
                <option value="account">Tài khoản & Điểm thưởng</option>
                <option value="other">Ý kiến đóng góp khác</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-black text-slate-700">Tiêu đề tóm tắt</span>
            <input
              value={supportForm.title}
              placeholder="Ví dụ: Cần hỗ trợ xuất hóa đơn VAT"
              onChange={(event) => setSupportForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-sky-50"
            />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-black text-slate-700">Chi tiết vấn đề</span>
            <textarea
              rows={4}
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải..."
              value={supportForm.content}
              onChange={(event) => setSupportForm((current) => ({ ...current, content: event.target.value }))}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-sky-50"
            />
          </label>
        </div>
        <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={handleSubmitSupport}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-6 font-black text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            Gửi yêu cầu hỗ trợ
          </button>
        </div>
        {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-black text-emerald-700">{message}</p> : null}
      </div>

      <div>
        <h3 className="text-lg font-black tracking-tight text-slate-950">Yêu cầu đã gửi</h3>
        <p className="mt-1 text-sm text-slate-500">Theo dõi tiến độ xử lý các vấn đề bạn đã phản ánh.</p>
        <div className="mt-5 grid gap-4">
          {supportTickets.length ? (
            supportTickets.map((ticket) => {
              const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
              return (
                <article key={ticket.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-mono text-xs font-black text-slate-500">#{ticket.code}</span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-black text-slate-950">{ticket.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{ticket.content}</p>
                    {ticket.adminReply ? (
                      <div className="mt-4 rounded-xl bg-sky-50 p-4">
                        <div className="flex items-center gap-2">
                          <svg className="h-5 w-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-black uppercase tracking-widest text-brand-700">Phản hồi từ Admin</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{ticket.adminReply}</p>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-bold text-slate-500">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderTasks = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black text-slate-950">Nhiệm vụ nhận điểm</h2>
      <p className="mt-1 text-sm text-slate-500">Hoàn thành các nhiệm vụ dưới đây để tích lũy điểm thưởng và quy đổi quà tặng.</p>
      <div className="mt-5 grid gap-3">
        {rewardTasks.map((task) => (
          <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex-1 min-w-[200px]">
              <p className="font-black text-slate-950">{task.title}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-bold text-brand-700">+{task.points} điểm</span>
                {task.id === 'save_3_rooms' && !task.completed && (
                  <span className="text-xs font-semibold text-slate-500">Tiến độ: {favoriteRooms.length}/3</span>
                )}
              </div>
            </div>
            {task.completed ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">Đã hoàn thành</span>
            ) : (
              <Link 
                to={task.id === 'write_review' ? '/my-bookings' : task.id === 'save_3_rooms' || task.id === 'first_booking' || task.id === 'online_payment' ? '/rooms' : '/'} 
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-brand-600 shadow-sm"
              >
                Làm ngay
              </Link>
            )}
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
              <div className="rounded-2xl bg-sky-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-600">Hạng {membership}</p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="font-black text-brand-700">{user?.full_name?.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <p className="mt-3 text-3xl font-black tracking-tight text-brand-700">{points} <span className="text-lg font-bold text-slate-500">điểm</span></p>
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60">
                    <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${nextTierInfo.progress}%` }}></div>
                  </div>
                  <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-brand-700/80">{nextTierInfo.text}</p>
                </div>
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
