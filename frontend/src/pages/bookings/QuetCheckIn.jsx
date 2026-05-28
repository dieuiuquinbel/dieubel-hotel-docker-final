import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function QuetCheckIn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Mã QR check-in không hợp lệ hoặc thiếu thông tin token.');
      setLoading(false);
      return;
    }

    const thucHienCheckIn = async () => {
      try {
        setLoading(true);
        // Gọi thẳng API public-checkin proxy qua Vite dev server
        const response = await axios.post('/api/bookings/public-checkin', { token });
        setSuccessData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình nhận phòng. Vui lòng kiểm tra lại mạng LAN hoặc liên hệ kỹ thuật.');
      } finally {
        setLoading(false);
      }
    };

    // Đợi 1 giây để tạo hiệu ứng giả lập xử lý chuyên nghiệp
    const timer = setTimeout(() => {
      thucHienCheckIn();
    }, 1200);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-8 text-white">
      {/* Background gradients for premium glassmorphism feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute -right-1/4 -bottom-1/4 h-96 w-96 rounded-full bg-sky-500 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-md">
        {/* Header decoration */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-black uppercase tracking-widest text-emerald-400">STAYNEST HOTEL</h1>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mt-1">Hệ thống quét nhận phòng tự động</p>
        </div>

        {/* Dynamic State Layouts */}
        {loading ? (
          <div className="flex flex-col items-center py-12 text-center">
            {/* Spinning Loader */}
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute h-full w-full rounded-full border-4 border-slate-800" />
              <div className="absolute h-full w-full rounded-full border-4 border-t-emerald-500 animate-spin" />
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-400 animate-pulse fill-none stroke-current" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 006-.371m0 0c1.12 0 2.233-.038 3.334-.114M9 5.25V3m3.334 2.25C13.2 2.25 14.802 1 16.5 1c2.4 0 4.1 2.25 3 4.875" />
              </svg>
            </div>
            <p className="mt-8 text-sm font-bold text-slate-300 animate-pulse">
              Đang xác thực thông tin thẻ lên phòng...
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Vui lòng giữ kết nối LAN ổn định
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-6 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-black text-rose-400">Check-in Thất Bại</h2>
            <div className="mt-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 p-4">
              <p className="text-sm font-bold leading-relaxed text-slate-300">
                {error}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-8 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-3.5 text-xs font-black tracking-widest text-white uppercase transition-all"
            >
              Về trang chủ
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Success Animation */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-slate-950 animate-bounce">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-black text-emerald-400 uppercase tracking-wide">Nhận Phòng Thành Công!</h2>
              <p className="mt-1 text-xs text-slate-400 font-bold">Chào mừng quý khách đến với StayNest Hotel</p>
            </div>

            {/* Room Card details */}
            <div className="mt-6 space-y-4 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Mã đặt phòng</span>
                <span className="text-sm font-black tracking-wider text-emerald-400">{successData.bookingCode}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Khách hàng</span>
                <span className="text-sm font-black text-white">{successData.guestName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Phòng</span>
                <span className="text-sm font-black text-emerald-400">{successData.roomName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Chi nhánh</span>
                <span className="text-sm font-black text-slate-300">{successData.hotelName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nhận phòng</span>
                  <span className="text-xs font-black text-white">{successData.checkIn}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trả phòng</span>
                  <span className="text-xs font-black text-white">{successData.checkOut}</span>
                </div>
              </div>
            </div>

            {/* Decorative Ticket Footer */}
            <div className="mt-6 flex flex-col items-center justify-center border-t border-dashed border-white/10 pt-4 text-center">
              <div className="h-6 w-full flex items-center justify-between text-slate-600 px-8 text-xs font-mono select-none">
                <span>* * * * * *</span>
                <span>BOARDING CARD</span>
                <span>* * * * * *</span>
              </div>
              <p className="mt-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Vui lòng liên hệ quầy lễ tân để lấy thẻ khóa từ thông minh
              </p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 text-xs font-black tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/20"
            >
              Hoàn tất nhận phòng
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
