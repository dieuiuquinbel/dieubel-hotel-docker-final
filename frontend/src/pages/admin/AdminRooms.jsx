// Chức năng: Trang admin quản lý danh sách và tạo phòng.
// Màn quản lý phòng cho admin.
// File này điều phối danh sách phòng, bộ lọc và form tạo phòng; phần UI lớn đã được tách ra component riêng.
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { layDanhSachPhong, taoPhongAdminApi } from '../../services/phongApi';
import RoomCreatePane from '../../components/admin/rooms/RoomCreatePane';
import RoomListPane from '../../components/admin/rooms/RoomListPane';
import { EMPTY_ROOM } from '../../components/admin/rooms/roomConstants';
import { locPhong } from '../../components/admin/rooms/roomHelpers';

export default function AdminRooms() {
  const queryClient = useQueryClient();
  const [activePane, setActivePane] = useState('list');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [view, setView] = useState('table');
  const [form, setForm] = useState(EMPTY_ROOM);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [coverPreview, setCoverPreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [notice, setNotice] = useState('');

  const roomsQuery = useQuery({
    queryKey: ['admin', 'rooms'],
    queryFn: () => layDanhSachPhong('limit=100&sort=newest'),
    staleTime: 60 * 1000,
  });

  const rooms = useMemo(() => roomsQuery.data?.data || [], [roomsQuery.data?.data]);
  const filteredRooms = useMemo(
    () => locPhong({ rooms, query, status, type }),
    [query, rooms, status, type],
  );

  const createMutation = useMutation({
    mutationFn: (payload) => taoPhongAdminApi(payload),
    onSuccess: (room) => {
      setNotice(`Đã thêm phòng ${room.room_name}.`);
      handleReset();
      setActivePane('list');
      queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  useEffect(() => {
    if (!galleryFiles.length) {
      setGalleryPreviews([]);
      return undefined;
    }

    const previews = galleryFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setGalleryPreviews(previews);

    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [galleryFiles]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleAmenity = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const handleReset = () => {
    setForm(EMPTY_ROOM);
    setCoverFile(null);
    setGalleryFiles([]);
    setCoverPreview('');
    setGalleryPreviews([]);
  };

  const submitRoom = (event) => {
    event.preventDefault();
    setNotice('');

    const payload = new FormData();
    payload.append('hotel_name', form.hotel_name);
    payload.append('room_name', form.room_name);
    payload.append('city', form.city);
    payload.append('address', form.address);
    payload.append('room_type', form.room_type);
    payload.append('description', form.description);
    payload.append('price_per_night', String(Number(form.price_per_night)));
    payload.append('max_guests', String(Number(form.max_guests)));
    payload.append('inventory_count', String(Number(form.inventory_count)));
    payload.append('breakfast_included', String(form.breakfast_included));
    payload.append('free_cancellation', String(form.free_cancellation));
    payload.append('is_active', String(form.is_active));
    form.amenities.forEach((item) => payload.append('amenities', item));

    if (coverFile) payload.append('cover_image', coverFile);
    galleryFiles.forEach((file) => payload.append('gallery_images', file));

    createMutation.mutate(payload);
  };

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5">
      <section>
        <h1 className="text-2xl font-black text-slate-950">Quản lý phòng</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Theo dõi kho phòng và thêm phòng mới vào hệ thống.</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActivePane('list')}
            className={`rounded-lg px-4 py-3 text-left transition ${activePane === 'list' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
          >
            <span className="block text-sm font-black">Danh sách phòng</span>
            <span className="block text-xs font-semibold opacity-70">Tra cứu, lọc, xem kho</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePane('create')}
            className={`rounded-lg px-4 py-3 text-left transition ${activePane === 'create' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
          >
            <span className="block text-sm font-black">Thêm phòng</span>
            <span className="block text-xs font-semibold opacity-70">Tải ảnh, mô tả, giá, tiện nghi</span>
          </button>
        </div>
      </section>

      {notice ? <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{notice}</div> : null}
      {createMutation.isError ? (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
          {createMutation.error?.response?.data?.message || 'Không thêm được phòng.'}
        </div>
      ) : null}

      {activePane === 'list' ? (
        <RoomListPane
          rooms={rooms}
          filteredRooms={filteredRooms}
          query={query}
          setQuery={setQuery}
          type={type}
          setType={setType}
          status={status}
          setStatus={setStatus}
          view={view}
          setView={setView}
          isLoading={roomsQuery.isLoading}
          isError={roomsQuery.isError}
        />
      ) : null}

      {activePane === 'create' ? (
        <RoomCreatePane
          form={form}
          updateForm={updateForm}
          toggleAmenity={toggleAmenity}
          submitRoom={submitRoom}
          createMutation={createMutation}
          coverPreview={coverPreview}
          galleryPreviews={galleryPreviews}
          setCoverFile={setCoverFile}
          setGalleryFiles={setGalleryFiles}
          handleReset={handleReset}
        />
      ) : null}
    </div>
  );
}
