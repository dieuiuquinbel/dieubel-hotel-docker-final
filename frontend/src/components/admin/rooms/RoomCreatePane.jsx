// Form tạo phòng mới.
// Tách riêng để màn quản lý phòng không phải ôm toàn bộ JSX của form.
import RoomField from './RoomField';
import { AMENITIES, ROOM_TYPES } from './roomConstants';

export default function RoomCreatePane({
  form,
  updateForm,
  toggleAmenity,
  submitRoom,
  createMutation,
  coverPreview,
  galleryPreviews,
  setCoverFile,
  setGalleryFiles,
  handleReset,
}) {
  return (
    <form onSubmit={submitRoom} className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black text-slate-950">Thông tin cơ bản</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <RoomField label="Tên khách sạn"><input required value={form.hotel_name} onChange={(event) => updateForm('hotel_name', event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" /></RoomField>
          <RoomField label="Tên phòng"><input required value={form.room_name} onChange={(event) => updateForm('room_name', event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" /></RoomField>
          <RoomField label="Thành phố / khu vực"><input required value={form.city} onChange={(event) => updateForm('city', event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" /></RoomField>
          <RoomField label="Địa chỉ"><input required value={form.address} onChange={(event) => updateForm('address', event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" /></RoomField>
          <RoomField label="Loại phòng"><select value={form.room_type} onChange={(event) => updateForm('room_type', event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500">{Object.entries(ROOM_TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></RoomField>
          <RoomField label="Trạng thái hiển thị"><select value={String(form.is_active)} onChange={(event) => updateForm('is_active', event.target.value === 'true')} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500"><option value="true">Đang bán</option><option value="false">Ẩn khỏi khách</option></select></RoomField>
          <RoomField label="Mô tả phòng" className="lg:col-span-2"><textarea required rows={5} value={form.description} onChange={(event) => updateForm('description', event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" /></RoomField>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black text-slate-950">Ảnh phòng</h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4">
            <RoomField label="Ảnh đại diện từ máy">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-white"
              />
            </RoomField>
            <RoomField label="Gallery ảnh từ máy">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setGalleryFiles(Array.from(event.target.files || []).slice(0, 7))}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-white"
              />
            </RoomField>
            <p className="text-xs font-bold text-slate-500">Tối đa 1 ảnh đại diện và 7 ảnh gallery, mỗi file tối đa 8MB.</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            {coverPreview ? (
              <img src={coverPreview} alt="" className="h-56 w-full rounded-md object-cover" />
            ) : (
              <div className="grid h-56 place-items-center rounded-md border border-dashed border-slate-300 text-sm font-bold text-slate-400">
                Preview ảnh đại diện
              </div>
            )}
          </div>
        </div>

        {galleryPreviews.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {galleryPreviews.map((item) => (
              <div key={`${item.name}-${item.url}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img src={item.url} alt={item.name} className="h-32 w-full object-cover" />
                <div className="px-3 py-2 text-xs font-bold text-slate-500">{item.name}</div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black text-slate-950">Giá, kho và sức chứa</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <RoomField label="Giá mỗi đêm"><input required type="number" min="1" value={form.price_per_night} onChange={(event) => updateForm('price_per_night', event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" /></RoomField>
          <RoomField label="Số khách tối đa"><input required type="number" min="1" value={form.max_guests} onChange={(event) => updateForm('max_guests', event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" /></RoomField>
          <RoomField label="Số phòng trong kho"><input required type="number" min="0" value={form.inventory_count} onChange={(event) => updateForm('inventory_count', event.target.value)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500" /></RoomField>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black text-slate-950">Tiện nghi và chính sách</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AMENITIES.map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={form.amenities.includes(key)} onChange={() => toggleAmenity(key)} className="h-4 w-4" />
              {label}
            </label>
          ))}
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.breakfast_included} onChange={(event) => updateForm('breakfast_included', event.target.checked)} className="h-4 w-4" />Bao gồm bữa sáng</label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.free_cancellation} onChange={(event) => updateForm('free_cancellation', event.target.checked)} className="h-4 w-4" />Hủy miễn phí</label>
        </div>
      </section>

      <section className="flex flex-wrap justify-end gap-2 rounded-lg border border-slate-200 bg-white p-4">
        <button type="button" onClick={handleReset} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700">
          Xóa form
        </button>
        <button type="submit" disabled={createMutation.isPending} className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:bg-slate-300">
          {createMutation.isPending ? 'Đang lưu...' : 'Lưu phòng mới'}
        </button>
      </section>
    </form>
  );
}
