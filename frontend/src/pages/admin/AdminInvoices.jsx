// Trang hóa đơn admin: tra cứu hóa đơn, xem thư mục lưu và tải file HTML — phiên bản nâng cấp.
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ketNoiApi from '../../services/ketNoiApi';
import { dinhDangTien } from '../../utils/dinhDang';

async function layHoaDonAdminApi() {
  const response = await ketNoiApi.get('/admin/invoices');
  return response.data.data;
}

async function taiHoaDonAdmin(invoice) {
  const response = await ketNoiApi.get(`/admin/invoices/${invoice.id}/download`, {
    responseType: 'blob',
  });

  const duongDanLuu = response.headers['x-invoice-admin-path'] || '';
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoice_code}.html`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);

  return duongDanLuu;
}

function AdminInvoices() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [duongDanVuaLuu, setDuongDanVuaLuu] = useState('');
  const [dangTaiId, setDangTaiId] = useState(null);
  const debounceRef = useRef(null);

  // Debounce search 300ms
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'invoices'],
    queryFn: layHoaDonAdminApi,
    staleTime: 60 * 1000,
  });

  const invoices = useMemo(() => data?.invoices || [], [data?.invoices]);
  const thuMucHoaDon = data?.directory || '';

  const filteredInvoices = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    if (!keyword) return invoices;

    return invoices.filter((invoice) =>
      [invoice.invoice_code, invoice.booking_code, invoice.full_name, invoice.email, invoice.total_amount]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [debouncedSearch, invoices]);

  const handleDownload = async (invoice) => {
    try {
      setDangTaiId(invoice.id);
      const savedPath = await taiHoaDonAdmin(invoice);
      setDuongDanVuaLuu(savedPath || thuMucHoaDon);
    } finally {
      setDangTaiId(null);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Dữ liệu</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Tra cứu hóa đơn</h1>
        </div>
      </section>

      {/* Info & search */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0">
            {thuMucHoaDon ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">Thư mục lưu mặc định</p>
                <p className="mt-1 break-all text-sm font-bold text-emerald-800">{thuMucHoaDon}</p>
              </div>
            ) : null}
            {duongDanVuaLuu ? (
              <p className="mt-2 text-xs font-semibold text-slate-500">
                File vừa lưu tại: <span className="font-black text-slate-900">{duongDanVuaLuu}</span>
              </p>
            ) : null}
          </div>
          <div className="relative self-start">
            <svg viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 10.89 3.476l4.817 4.817a1 1 0 0 1-1.414 1.414l-4.816-4.816A6 6 0 0 1 2 8z" clipRule="evenodd" />
            </svg>
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Mã hóa đơn, khách, email..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm font-semibold outline-none transition focus:border-sky-400"
            />
          </div>
        </div>
      </section>

      {/* Invoice table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Table header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div>
            <h3 className="text-base font-black text-slate-950">Danh sách hóa đơn</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {debouncedSearch ? `Kết quả cho "${debouncedSearch}"` : `${invoices.length} hóa đơn trong hệ thống`}
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
            {filteredInvoices.length} kết quả
          </span>
        </div>

        {/* Column labels */}
        <div className="grid grid-cols-[1fr_1fr_140px_100px] gap-4 border-b border-slate-100 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 max-lg:hidden">
          <span>Mã hóa đơn</span>
          <span>Khách hàng</span>
          <span>Số tiền</span>
          <span>Thao tác</span>
        </div>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="grid divide-y divide-slate-100 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_140px_100px] gap-4 px-5 py-4 max-lg:grid-cols-1">
                <div className="grid gap-1">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-3 w-20 rounded bg-slate-100" />
                </div>
                <div className="grid gap-1">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-40 rounded bg-slate-100" />
                </div>
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-8 w-16 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : null}

        {/* Error */}
        {isError ? (
          <div className="flex items-center gap-2.5 px-5 py-8">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-600">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-bold text-rose-700">Không tải được danh sách hóa đơn.</p>
          </div>
        ) : null}

        {/* Data rows */}
        {!isLoading && !isError ? (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((invoice) => (
              <article
                key={invoice.id}
                className="grid items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50 lg:grid-cols-[1fr_1fr_140px_100px]"
              >
                <div>
                  <p className="font-mono text-sm font-black tracking-wide text-slate-950">{invoice.invoice_code}</p>
                  <p className="mt-0.5 font-mono text-xs font-semibold tracking-wide text-slate-400">{invoice.booking_code}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{invoice.full_name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">{invoice.email}</p>
                </div>
                <p className="text-sm font-black text-emerald-700">{dinhDangTien(invoice.total_amount)}</p>
                <button
                  type="button"
                  onClick={() => handleDownload(invoice)}
                  disabled={dangTaiId === invoice.id}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[.98]"
                >
                  {dangTaiId === invoice.id ? (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 animate-spin">
                        <path fillRule="evenodd" d="M4 2a1 1 0 0 1 1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" clipRule="evenodd" />
                      </svg>
                      Đang lưu
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M3 17a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm3.293-7.707a1 1 0 0 1 1.414 0L9 10.586V3a1 1 0 1 1 2 0v7.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
                      </svg>
                      Tải
                    </>
                  )}
                </button>
              </article>
            ))}

            {!filteredInvoices.length ? (
              <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-slate-300">
                  <path fillRule="evenodd" d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 6a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-bold text-slate-500">Không tìm thấy hóa đơn phù hợp</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default AdminInvoices;
