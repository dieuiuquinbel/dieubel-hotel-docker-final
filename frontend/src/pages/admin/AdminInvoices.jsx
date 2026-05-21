// Admin hoa don: doc danh sach hoa don va tai file HTML hoa don tu backend.
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
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
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoice_code}.html`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function AdminInvoices() {
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'invoices'],
    queryFn: layHoaDonAdminApi,
    staleTime: 60 * 1000,
  });

  const filteredInvoices = useMemo(() => {
    const keyword = activeQuery.trim().toLowerCase();
    if (!keyword) return data;

    return data.filter((invoice) =>
      [invoice.invoice_code, invoice.booking_code, invoice.full_name, invoice.email, invoice.total_amount]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [activeQuery, data]);

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveQuery(invoiceQuery);
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Hóa đơn</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Tra cứu hóa đơn</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Danh sách hóa đơn sinh từ các đơn đặt phòng. Admin có thể tải file HTML hóa đơn để kiểm tra hoặc gửi lại cho khách.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex w-full self-start rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <input
              value={invoiceQuery}
              onChange={(event) => setInvoiceQuery(event.target.value)}
              placeholder="Mã hóa đơn, khách, email..."
              className="min-w-0 flex-1 rounded-xl border border-transparent bg-white px-4 py-3 text-sm font-bold outline-none focus:border-brand-500"
            />
            <button type="submit" className="shrink-0 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800">
              Tìm hóa đơn
            </button>
          </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h3 className="text-base font-black text-slate-950">Danh sách hóa đơn</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {activeQuery ? `Kết quả cho "${activeQuery}"` : `${data.length} hóa đơn trong hệ thống`}
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex w-full gap-2 sm:w-auto">
            <input
              value={invoiceQuery}
              onChange={(event) => setInvoiceQuery(event.target.value)}
              placeholder="Tìm hóa đơn..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold outline-none focus:border-brand-500 sm:w-64"
            />
            <button type="submit" className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700">
              Tìm hóa đơn
            </button>
          </form>
        </div>
        {isLoading ? <div className="p-5 text-sm font-bold text-slate-500">Đang tải hóa đơn...</div> : null}
        {isError ? <div className="p-5 text-sm font-bold text-rose-700">Không tải được hóa đơn.</div> : null}
        {!isLoading && !isError ? (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((invoice) => (
              <article key={invoice.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_1fr_160px_120px]">
                <div>
                  <p className="text-sm font-black text-slate-950">{invoice.invoice_code}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{invoice.booking_code}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{invoice.full_name}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{invoice.email}</p>
                </div>
                <p className="text-sm font-black text-brand-700">{dinhDangTien(invoice.total_amount)}</p>
                <button
                  type="button"
                  onClick={() => taiHoaDonAdmin(invoice)}
                  className="h-fit rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                >
                  Tải
                </button>
              </article>
            ))}
            {!filteredInvoices.length ? (
              <div className="px-5 py-8 text-center text-sm font-bold text-slate-500">
                Không tìm thấy hóa đơn phù hợp.
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default AdminInvoices;
