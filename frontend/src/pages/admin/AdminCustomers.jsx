// Trang quản lý khách hàng của admin.
// File này điều phối ba phần: tạo khách trực tiếp, danh sách khách và panel chi tiết.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
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
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState('');

  const customersQuery = useQuery({
    queryKey: ['admin', 'customers', search, status],
    queryFn: () => layDanhSachKhachHangAdminApi({ search, status, role: 'customer' }),
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
    <div className="grid gap-6">
      <CustomerCreateForm
        open={showCreateForm}
        form={createForm}
        onToggle={() => setShowCreateForm((current) => !current)}
        onChange={updateCreateForm}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tên, username, email hoặc số điện thoại"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-brand-500"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-brand-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>
        </div>
      </section>

      {notice ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
          {notice}
        </div>
      ) : null}

      {customersQuery.isError ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
          Không tải được danh sách khách hàng.
        </div>
      ) : null}

      {(createMutation.error || updateMutation.error || statusMutation.error || deleteMutation.error) ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
          {actionError}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <CustomerList
          customers={customers}
          activeCustomerId={activeCustomer?.id}
          isLoading={customersQuery.isLoading}
          onSelect={setSelectedId}
        />

        <CustomerDetailPanel
          customer={activeCustomer}
          detail={detailQuery.data}
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
