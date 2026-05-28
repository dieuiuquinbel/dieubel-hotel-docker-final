// Chức năng: Trang đăng nhập, đăng ký và xác minh OTP.
// Trang xac thuc: dang nhap, dang ky tai khoan va xac minh OTP email.
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { dangNhapTaiKhoan, dangKyTaiKhoan, guiLaiOtpEmail, xacMinhOtpEmail } from '../../services/xacThucApi';
import useKhoXacThuc from '../../store/khoXacThuc';
import useKhoThongBao from '../../store/khoThongBao';
import { laQuanTriVien } from '../../utils/phanQuyen';

const ANH_XAC_THUC =
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=85';

const FORM_DANG_NHAP_BAN_DAU = {
  identifier: '',
  password: '',
};

const FORM_DANG_KY_BAN_DAU = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const XAC_MINH_BAN_DAU = {
  email: '',
  otp: '',
};

function docThongBaoLoi(error, defaultMessage) {
  if (!error?.response) {
    return 'Không kết nối được backend. Hãy chạy backend bằng `npm run dev` trong thư mục backend rồi thử lại.';
  }

  return error?.response?.data?.message || defaultMessage;
}

function TruongBieuMau({ label, className = '', ...inputProps }) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        {...inputProps}
        className="field-shell px-4 py-4 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

function ThongBao({ tone = 'error', children }) {
  const toneClass =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : tone === 'info'
        ? 'border-sky-100 bg-sky-50 text-slate-700'
        : 'border-rose-200 bg-rose-50 text-rose-700';

  return <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${toneClass}`}>{children}</div>;
}

function DangNhapDangKy() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useKhoXacThuc((state) => state.token);
  const user = useKhoXacThuc((state) => state.user);
  const setSession = useKhoXacThuc((state) => state.setSession);
  const hienThongBao = useKhoThongBao((state) => state.hienThongBao);

  const [loginForm, setLoginForm] = useState(FORM_DANG_NHAP_BAN_DAU);
  const [registerForm, setRegisterForm] = useState(FORM_DANG_KY_BAN_DAU);
  const [verification, setVerification] = useState(XAC_MINH_BAN_DAU);

  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirectPath = searchParams.get('redirect') || '/';
  const isVerifying = Boolean(verification.email);

  const loginMutation = useMutation({ mutationFn: dangNhapTaiKhoan });
  const registerMutation = useMutation({ mutationFn: dangKyTaiKhoan });
  const verifyMutation = useMutation({ mutationFn: xacMinhOtpEmail });
  const resendMutation = useMutation({ mutationFn: guiLaiOtpEmail });

  const resolveRedirectPath = (sessionUser) => {
    if (laQuanTriVien(sessionUser)) return '/admin/overview';
    return redirectPath;
  };

  if (token && user) return <Navigate to={resolveRedirectPath(user)} replace />;

  const switchMode = (nextMode) => {
    const next = new URLSearchParams(searchParams);
    next.set('mode', nextMode);
    setSearchParams(next, { replace: true });
    setVerification(XAC_MINH_BAN_DAU);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const updateLoginForm = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
  };

  const updateRegisterForm = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    try {
      const session = await loginMutation.mutateAsync(loginForm);
      setSession(session);
      hienThongBao('Đăng nhập thành công!', 'success');
      navigate(resolveRedirectPath(session.user), { replace: true });
    } catch (error) {
      hienThongBao(docThongBaoLoi(error, 'Không thể đăng nhập. Vui lòng kiểm tra thông tin.'), 'error');
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    if (registerForm.password.length < 6) {
      hienThongBao('Mật khẩu cần ít nhất 6 ký tự.', 'error');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      hienThongBao('Mật khẩu xác nhận chưa khớp.', 'error');
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        fullName: registerForm.fullName,
        username: registerForm.username,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
      });
      setVerification({ email: result.email, otp: '' });
      hienThongBao('Đăng ký thành công! Mã OTP đã được gửi đến email của bạn.', 'success');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (error) {
      hienThongBao(docThongBaoLoi(error, 'Không thể tạo tài khoản. Vui lòng thử lại.'), 'error');
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();

    try {
      const session = await verifyMutation.mutateAsync({
        email: verification.email,
        otp: verification.otp,
      });
      setSession(session);
      hienThongBao('Xác minh tài khoản và đăng nhập thành công!', 'success');
      navigate(resolveRedirectPath(session.user), { replace: true });
    } catch (error) {
      hienThongBao(docThongBaoLoi(error, 'Không thể xác minh OTP. Vui lòng thử lại.'), 'error');
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendMutation.mutateAsync({ email: verification.email });
      hienThongBao('Đã gửi lại mã OTP mới qua email!', 'success');
    } catch (error) {
      hienThongBao(docThongBaoLoi(error, 'Không thể gửi lại mã OTP.'), 'error');
    }
  };

  const heroTitle = isVerifying
    ? 'Nhập mã OTP để hoàn tất xác minh.'
    : mode === 'login'
      ? 'Đăng nhập để tiếp tục đặt phòng.'
      : 'Tạo tài khoản để đặt phòng nhanh hơn.';

  return (
    <main className="auth-page-bg flex-1">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="surface-card grid min-h-[620px] overflow-hidden lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative min-h-[420px] bg-slate-950 text-white lg:min-h-[620px]">
            <img src={ANH_XAC_THUC} alt="Không gian nghỉ dưỡng" className="absolute inset-0 h-full w-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/10" />
            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
              <Link
                to="/"
                className="inline-flex w-fit rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur transition hover:bg-white/25"
              >
                Về trang chủ
              </Link>
              <div>
                <p className="text-sm font-bold text-sky-100">StayNest account</p>
                <h1 className="mt-4 max-w-md text-4xl font-black leading-tight tracking-tight">{heroTitle}</h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-sky-50">
                  Tài khoản đã xác minh email sẽ nhận được OTP, thông báo đặt phòng và hóa đơn từ StayNest.
                </p>
              </div>
            </div>
          </aside>

          <section className="overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="eyebrow">Tài khoản</span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                  {isVerifying ? 'Xác minh email' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {isVerifying
                    ? `Mã OTP đã được gửi tới ${verification.email}.`
                    : mode === 'login'
                      ? 'Có thể đăng nhập bằng email hoặc tên tài khoản.'
                      : 'Sau khi tạo tài khoản, bạn cần nhập OTP để xác minh email.'}
                </p>
              </div>

              {!isVerifying ? (
                <div className="grid grid-cols-2 rounded-full border border-sky-100 bg-sky-50 p-1 text-sm font-bold">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`rounded-full px-4 py-2 transition ${
                      mode === 'login' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-brand-700'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`rounded-full px-4 py-2 transition ${
                      mode === 'register' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-brand-700'
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>
              ) : null}
            </div>

            <div className="auth-form-stage">
              {isVerifying ? (
                <form onSubmit={handleVerifySubmit} className="auth-form-panel mt-8 grid gap-5">
                  <ThongBao tone="info">OTP có hiệu lực trong 10 phút. Kiểm tra cả hộp thư spam nếu chưa thấy email.</ThongBao>
                  <TruongBieuMau
                    label="Mã OTP"
                    type="text"
                    inputMode="numeric"
                    value={verification.otp}
                    onChange={(event) => setVerification((current) => ({ ...current, otp: event.target.value }))}
                    required
                    placeholder="Nhập 6 số"
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={verifyMutation.isPending}
                      className="rounded-xl bg-brand-600 px-5 py-4 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {verifyMutation.isPending ? 'Đang xác minh...' : 'Xác minh và đăng nhập'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendMutation.isPending}
                      className="rounded-xl border border-sky-200 bg-white px-5 py-4 text-sm font-bold text-brand-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {resendMutation.isPending ? 'Đang gửi...' : 'Gửi lại mã'}
                    </button>
                  </div>
                </form>
              ) : mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="auth-form-panel mt-8 grid gap-5">
                  <TruongBieuMau
                    label="Email hoặc tên tài khoản"
                    type="text"
                    name="identifier"
                    value={loginForm.identifier}
                    onChange={(event) => updateLoginForm('identifier', event.target.value)}
                    required
                    placeholder="ban@example.com hoặc nguyenvana"
                  />
                  <TruongBieuMau
                    label="Mật khẩu"
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={(event) => updateLoginForm('password', event.target.value)}
                    required
                    placeholder="Nhập mật khẩu"
                  />

                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="rounded-xl bg-brand-600 px-5 py-4 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="auth-form-panel mt-8 grid gap-5 md:grid-cols-2">
                  <TruongBieuMau
                    label="Họ và tên"
                    type="text"
                    name="fullName"
                    value={registerForm.fullName}
                    onChange={(event) => updateRegisterForm('fullName', event.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    className="md:col-span-2"
                  />
                  <TruongBieuMau
                    label="Tên tài khoản"
                    type="text"
                    name="username"
                    value={registerForm.username}
                    onChange={(event) => updateRegisterForm('username', event.target.value)}
                    required
                    placeholder="nguyenvana"
                    className="md:col-span-2"
                  />
                  <TruongBieuMau
                    label="Email"
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={(event) => updateRegisterForm('email', event.target.value)}
                    required
                    placeholder="ban@example.com"
                  />
                  <TruongBieuMau
                    label="Số điện thoại"
                    type="tel"
                    name="phone"
                    value={registerForm.phone}
                    onChange={(event) => updateRegisterForm('phone', event.target.value)}
                    placeholder="090..."
                  />
                  <TruongBieuMau
                    label="Mật khẩu"
                    type="password"
                    name="password"
                    value={registerForm.password}
                    onChange={(event) => updateRegisterForm('password', event.target.value)}
                    required
                    placeholder="Ít nhất 6 ký tự"
                  />
                  <TruongBieuMau
                    label="Xác nhận mật khẩu"
                    type="password"
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={(event) => updateRegisterForm('confirmPassword', event.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu"
                  />

                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="rounded-xl bg-brand-600 px-5 py-4 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 md:col-span-2"
                  >
                    {registerMutation.isPending ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default DangNhapDangKy;
