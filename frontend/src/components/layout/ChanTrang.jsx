// Chức năng: Footer chung cho trang khách hàng.
import { Link } from 'react-router-dom';

const LIEN_KET_PHO_BIEN = [
  'Khách sạn TP. Hồ Chí Minh',
  'Khách sạn Phú Quốc',
  'Khách sạn Hà Nội',
  'Khách sạn Đà Nẵng',
  'Khách sạn Nha Trang',
  'Khách sạn Đà Lạt',
  'Khách sạn Sa Pa',
  'Khách sạn Hội An',
  'Resort biển',
  'Căn hộ trung tâm',
  'Phòng gia đình',
  'Khách sạn có bữa sáng',
];

const COT_CHAN_TRANG = [
  {
    title: 'Thông tin công ty',
    links: ['Giới thiệu công ty', 'Tuyển dụng', 'Góp ý, khiếu nại', 'Liên hệ hợp tác'],
  },
  {
    title: 'Chính sách công ty',
    links: [
      'Chính sách chất lượng',
      'Chính sách bảo mật thông tin',
      'Chính sách đặt phòng',
      'Chính sách hủy phòng',
      'Hướng dẫn thanh toán',
    ],
  },
  {
    title: 'Dịch vụ DieuBel',
    links: ['Khách sạn biển', 'Resort nghỉ dưỡng', 'Căn hộ trung tâm', 'Phòng gia đình'],
  },
];

const LIEN_KET_MANG_XA_HOI = [
  { 
    label: 'Facebook', 
    href: 'https://www.facebook.com/dieuiuquin27.10/', 
    icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>,
    className: 'bg-[#1877f2]/10 text-[#1877f2] hover:bg-[#1877f2] hover:text-white' 
  },
  { 
    label: 'YouTube', 
    href: 'https://www.youtube.com/@DieuDieu27.10', 
    icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>,
    className: 'bg-[#ff0000]/10 text-[#ff0000] hover:bg-[#ff0000] hover:text-white' 
  },
  { 
    label: 'TikTok', 
    href: 'https://www.tiktok.com/@dieuuchiha27.10?lang=vi-VN', 
    icon: <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 448 512" aria-hidden="true"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>,
    className: 'bg-slate-950/10 text-slate-950 hover:bg-slate-950 hover:text-white' 
  },
];

const HUY_HIEU_XAC_THUC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='92' viewBox='0 0 260 92'%3E%3Crect width='260' height='92' rx='14' fill='%23e9f7ff'/%3E%3Ccircle cx='45' cy='46' r='27' fill='%230ea5e9'/%3E%3Cpath d='M32 46.5l8.5 8.5L59 34' fill='none' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='84' y='37' font-family='Arial,sans-serif' font-size='18' font-weight='800' fill='%230f172a'%3EĐÃ THÔNG BÁO%3C/text%3E%3Ctext x='84' y='61' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='%230ea5e9'%3EBỘ CÔNG THƯƠNG%3C/text%3E%3C/svg%3E";

const DIEM_TIN_CAY = [
  'Xác nhận đặt phòng qua email',
  'Hóa đơn lưu tự động cho admin',
  'Giá rõ ràng trước khi đặt',
  'Hỗ trợ khách hàng hằng ngày',
];

function LienKetChanTrang({ item }) {
  if (typeof item === 'string') {
    return (
      <button type="button" className="text-left text-sm leading-6 text-slate-600 transition hover:text-brand-700">
        {item}
      </button>
    );
  }

  return (
    <Link to={item.to} className="text-left text-sm leading-6 text-slate-600 transition hover:text-brand-700">
      {item.label}
    </Link>
  );
}

function ChanTrang() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Phổ biến với du khách Việt Nam</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Thành phố trong nước', 'Khu nghỉ mát', 'Căn hộ', 'Resort', 'Phòng gia đình'].map((tab, index) => (
              <span
                key={tab}
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  index === 0 ? 'border-brand-600 bg-sky-50 text-brand-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="mt-6 grid gap-x-8 gap-y-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            {LIEN_KET_PHO_BIEN.map((link) => (
              <button key={link} type="button" className="text-left transition hover:text-brand-700">
                {link}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {DIEM_TIN_CAY.map((point) => (
            <div key={point} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                ✓
              </span>
              <span className="text-sm font-bold text-slate-700">{point}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="pr-0 lg:pr-8">
            <div className="flex items-center gap-3">
              <div className="premium-logo">DB</div>
              <div>
                <p className="text-xl font-black tracking-tight text-slate-950">DieuBel</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Căn hộ, khách sạn</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-500">
              DieuBel hỗ trợ tìm chỗ ở, đặt phòng nhanh, gửi xác nhận qua email và lưu hóa đơn cho quản trị viên.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-medium text-slate-600">
              <p className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs">📞</span>
                0345 583 772
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs">✉️</span>
                quinquin04052005@gmail.com
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs">📍</span>
                <span className="leading-6">ĐH Kiến trúc Hà Nội, Văn Quán, Hà Đông, Hà Nội</span>
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {LIEN_KET_MANG_XA_HOI.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition hover:-translate-y-1 ${item.className}`}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {COT_CHAN_TRANG.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">{column.title}</h3>
              <div className="mt-6 grid gap-3">
                {column.links.map((link) => (
                  <LienKetChanTrang key={typeof link === 'string' ? link : link.label} item={link} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 border-t border-slate-200 px-4 py-6 text-xs font-medium text-slate-500 sm:px-6 lg:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <img src={HUY_HIEU_XAC_THUC} alt="Đã thông báo Bộ Công Thương" className="h-10 w-auto opacity-80 mix-blend-multiply transition hover:opacity-100" />
            <p>© 2026 DieuBel. Website đặt phòng khách sạn demo.</p>
          </div>
          <p className="text-center lg:text-right">Thanh toán tại khách sạn, email xác nhận tự động và hóa đơn lưu trong hệ thống.</p>
        </div>
      </section>
    </footer>
  );
}

export default ChanTrang;
