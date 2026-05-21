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
  { label: 'Facebook', href: 'https://www.facebook.com/dieuiuquin27.10/', mark: 'f', className: 'bg-[#1877f2]' },
  { label: 'YouTube', href: 'https://www.youtube.com/@DieuDieu27.10', mark: '▶', className: 'bg-[#ff0000]' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@dieuuchiha27.10?lang=vi-VN', mark: '♪', className: 'bg-slate-950' },
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

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {DIEM_TIN_CAY.map((point) => (
            <div key={point} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
              {point}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.25fr_0.78fr_0.95fr_0.78fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="premium-logo">DB</div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-950">DieuBel</p>
                <p className="text-sm font-semibold text-slate-500">Căn hộ, khách sạn, resort</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              DieuBel hỗ trợ tìm chỗ ở, đặt phòng nhanh, gửi xác nhận qua email và lưu hóa đơn cho quản trị viên.
            </p>
            <div className="mt-5 grid gap-2 text-sm text-slate-600">
              <p>
                <span className="font-black text-slate-950">Hotline:</span> 0345 583 772
              </p>
              <p>
                <span className="font-black text-slate-950">Email:</span> quinquin04052005@gmail.com
              </p>
              <p>
                <span className="font-black text-slate-950">Địa chỉ:</span> ĐH Kiến trúc Hà Nội, Văn Quán, Hà Đông, Hà Nội
              </p>
              <p>
                <span className="font-black text-slate-950">Khu vực hỗ trợ:</span> Việt Nam
              </p>
              <p>
                <span className="font-black text-slate-950">Thời gian:</span> 08:00 - 22:00 hằng ngày
              </p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {LIEN_KET_MANG_XA_HOI.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-black text-white transition hover:-translate-y-0.5 ${item.className}`}
                >
                  {item.mark}
                </a>
              ))}
            </div>
          </div>

          {COT_CHAN_TRANG.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-black text-slate-950">{column.title}</h3>
              <div className="mt-4 grid gap-2">
                {column.links.map((link) => (
                  <LienKetChanTrang key={typeof link === 'string' ? link : link.label} item={link} />
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-black text-slate-950">Xác minh dịch vụ</h3>
            <img src={HUY_HIEU_XAC_THUC} alt="Đã thông báo Bộ Công Thương" className="mt-4 h-auto w-56 rounded-xl border border-slate-200 bg-white" />
            <p className="mt-3 text-sm leading-6 text-slate-500">Thông tin pháp lý và tiêu chuẩn dịch vụ được trình bày công khai.</p>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-5 text-xs font-semibold text-slate-500 sm:px-6">
          <p>© 2026 DieuBel. Website đặt phòng khách sạn demo.</p>
          <p>Thanh toán tại khách sạn, email xác nhận tự động và hóa đơn lưu trong hệ thống.</p>
        </div>
      </section>
    </footer>
  );
}

export default ChanTrang;
