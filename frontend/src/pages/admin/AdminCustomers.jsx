// Chức năng: Trang admin quản lý khách hàng.
// Trang quản lý khách hàng của admin.
// File này điều phối ba phần: tạo khách trực tiếp, danh sách khách và panel chi tiết.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomerCreateForm from '../../components/admin/customers/CustomerCreateForm';
import CustomerDetailPanel from '../../components/admin/customers/CustomerDetailPanel';
import CustomerList from '../../components/admin/customers/CustomerList';
import {
  capNhatKhachHangAdminApi,
  capNhatTrangThaiKhachHangAdminApi,
  layChiTietKhachHangAdminApi,
  layDanhSachKhachHangAdminApi,
  taoKhachHangAdminApi,
  xoaKhachHangAdminApi,
} from '../../services/quanTriApi';

const EMPTY_FORM = {
  full_name: '',
  username: '',
  email: '',
  phone: '',
  status: 'active',
};

const EMPTY_CREATE_FORM = {
  full_name: '',
  username: '',
  password: '',
  email: '',
  phone: '',
  status: 'active',
};

function docThongBaoLoi(...errors) {
  return (
    errors.find((error) => error?.response?.data?.message)?.response?.data?.message
    || 'Không xử lý được yêu cầu.'
  );
}

function AdminCustomers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState('');
  const debounceTimerRef = useRef(null);

  // Debounce search 300ms
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  useEffect(() => {
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, []);

  const customersQuery = useQuery({
    queryKey: ['admin', 'customers', debouncedSearch, status],
    queryFn: () => layDanhSachKhachHangAdminApi({ search: debouncedSearch, status, role: 'customer' }),
    staleTime: 30 * 1000,
  });

  const customers = useMemo(() => customersQuery.data || [], [customersQuery.data]);
  const activeCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedId) || customers[0] || null,
    [customers, selectedId],
  );

  const detailQuery = useQuery({
    queryKey: ['admin', 'customers', activeCustomer?.id, 'detail'],
    queryFn: () => layChiTietKhachHangAdminApi(activeCustomer.id),
    enabled: Boolean(activeCustomer?.id),
  });

  useEffect(() => {
    if (!activeCustomer) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      full_name: activeCustomer.full_name || '',
      username: activeCustomer.username || '',
      email: activeCustomer.email || '',
      phone: activeCustomer.phone || '',
      status: activeCustomer.status || 'active',
    });
  }, [activeCustomer]);

  const refreshCustomers = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
  };

  const createMutation = useMutation({
    mutationFn: () => taoKhachHangAdminApi(createForm),
    onSuccess: (result) => {
      setNotice('Đã tạo tài khoản khách hàng.');
      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreateForm(false);
      setSelectedId(result?.customer?.id || null);
      refreshCustomers();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => capNhatKhachHangAdminApi(activeCustomer.id, form),
    onSuccess: () => {
      setNotice('Đã cập nhật thông tin khách hàng.');
      refreshCustomers();
    },
  });

  const statusMutation = useMutation({
    mutationFn: (nextStatus) => capNhatTrangThaiKhachHangAdminApi(activeCustomer.id, nextStatus),
    onSuccess: (_, nextStatus) => {
      setNotice(nextStatus === 'inactive' ? 'Đã khóa tài khoản khách hàng.' : 'Đã mở lại tài khoản khách hàng.');
      refreshCustomers();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => xoaKhachHangAdminApi(activeCustomer.id),
    onSuccess: (result) => {
      setNotice(result.message || 'Đã xử lý tài khoản khách hàng.');
      setSelectedId(null);
      refreshCustomers();
    },
  });

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateCreateForm = (field, value) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    if (!activeCustomer) return;
    updateMutation.mutate();
  };

  const handleCreate = (event) => {
    event.preventDefault();
    createMutation.mutate();
  };

  const handleDelete = () => {
    if (!activeCustomer) return;

    if (window.confirm('Tài khoản chưa có đơn sẽ bị xóa khỏi MySQL. Tài khoản đã có đơn sẽ bị khóa để giữ lịch sử đặt phòng. Tiếp tục?')) {
      deleteMutation.mutate();
    }
  };

  const actionError = docThongBaoLoi(
    createMutation.error,
    updateMutation.error,
    statusMutation.error,
    deleteMutation.error,
  );

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Dữ liệu</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Quản lý khách hàng</h1>
        </div>
      </section>

      <CustomerCreateForm
        open={showCreateForm}
        form={createForm}
        onToggle={() => setShowCreateForm((current) => !current)}
        onChange={updateCreateForm}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      {/* Search + Filter */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 10.89 3.476l4.817 4.817a1 1 0 0 1-1.414 1.414l-4.816-4.816A6 6 0 0 1 2 8z" clipRule="evenodd" />
            </svg>
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Tìm tên, username, email hoặc SĐT"
              className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm font-semibold outline-none transition focus:border-sky-400"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-400"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>
        </div>
      </section>

      {/* Notices */}
      {notice ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-600">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-emerald-700">{notice}</p>
        </div>
      ) : null}

      {customersQuery.isError ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-600">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-rose-700">Không tải được danh sách khách hàng.</p>
        </div>
      ) : null}

      {(createMutation.error || updateMutation.error || statusMutation.error || deleteMutation.error) ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-600">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-black text-rose-700">{actionError}</p>
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <CustomerList
          customers={customers}
          activeCustomerId={activeCustomer?.id}
          isLoading={customersQuery.isLoading}
          onSelect={setSelectedId}
        />

        <CustomerDetailPanel
          customer={activeCustomer}
          detail={detailQuery.data}
          isLoadingDetail={detailQuery.isFetching}
          form={form}
          onChange={updateForm}
          onSubmit={handleUpdate}
          onToggleStatus={() => statusMutation.mutate(activeCustomer.status === 'active' ? 'inactive' : 'active')}
          onDelete={handleDelete}
          isSaving={updateMutation.isPending}
          isTogglingStatus={statusMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      </section>
    </div>
  );
}

export default AdminCustomers;
