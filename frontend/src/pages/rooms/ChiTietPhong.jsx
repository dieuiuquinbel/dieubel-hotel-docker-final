// Chức năng: Trang chi tiết phòng và thao tác đặt phòng.
// Trang chi tiet phong: hien thi gallery, tien nghi, danh gia va nut dat phong.
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { layPhongTheoId, layDanhGiaPhongApi } from "../../services/phongApi";
import useKhoXacThuc from "../../store/khoXacThuc";
import { dinhDangTien } from "../../utils/dinhDang";
import { taoDuongDanDatPhong, taoDuongDanDangNhapChuyenHuong } from "../../utils/duongDan";
import { layThongTinTinhTrangPhong } from "../../utils/tinhTrangPhong";
import { resolveMediaUrl } from "../../utils/media";
import {
  docPhongYeuThich,
  luuPhongDaXem,
  daoTrangThaiPhongYeuThich,
} from "../../utils/lichSuXemPhong";

const NHAN_LOAI_PHONG = {
  standard: "Tiêu chuẩn",
  superior: "Superior",
  deluxe: "Deluxe",
  suite: "Suite",
  family: "Gia đình",
};

const NHAN_TIEN_NGHI = {
  wifi: "Wi-Fi",
  air_conditioner: "Điều hòa",
  breakfast: "Bữa sáng",
  pool: "Hồ bơi",
  parking: "Bãi đỗ xe",
  balcony: "Ban công",
};

function dinhDangTienNghi(amenity) {
  return NHAN_TIEN_NGHI[amenity] || amenity.replaceAll("_", " ");
}

const iconTienNghi = {
  wifi: <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>,
  air_conditioner: <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"></path></svg>,
  pool: <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>,
  breakfast: <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-4a2 2 0 00-2-2h-4a2 2 0 00-2 2v4"></path></svg>,
  parking: <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>,
  balcony: <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
};

const FAKE_REVIEWS = [
  { id: 1, user: "Nguyễn Văn A", date: "Tháng 4 năm 2026", rating: 5, comment: "Phòng rất sạch sẽ, view đẹp tuyệt vời. Nhân viên cực kỳ thân thiện và hỗ trợ nhiệt tình. Chắc chắn sẽ quay lại!" },
  { id: 2, user: "Trần Thị B", date: "Tháng 3 năm 2026", rating: 5, comment: "Trải nghiệm lưu trú trên cả tuyệt vời. Tiện nghi đầy đủ, bữa sáng ngon miệng. Vị trí thuận lợi để đi chuyển đến các điểm du lịch." },
  { id: 3, user: "Lê Hoàng C", date: "Tháng 2 năm 2026", rating: 4.5, comment: "Giá cả hợp lý so với chất lượng. Hồ bơi rộng và sạch. Tuy nhiên lúc check-in hơi đông nên phải đợi một chút." },
  { id: 4, user: "Phạm Minh D", date: "Tháng 1 năm 2026", rating: 5, comment: "Gia đình tôi đã có một kỳ nghỉ rất vui vẻ ở đây. Giường ngủ cực kỳ thoải mái. Sẽ giới thiệu cho bạn bè." },
];

const NGAY_TRA_PHONG_MAC_DINH = new Date(Date.now() + 86400000).toISOString().split('T')[0];

function dinhDangNgayDanhGia(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `Tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
}

function ChiTietPhong() {
  const { roomId } = useParams();
  const token = useKhoXacThuc((state) => state.token);
  const [favoriteRoomIds, setFavoriteRoomIds] = useState(() =>
    new Set(docPhongYeuThich().map((item) => String(item.id))),
  );
  const favorite = favoriteRoomIds.has(String(roomId));
  const {
    data: room,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["room-detail", roomId],
    queryFn: () => layPhongTheoId(roomId),
    enabled: Boolean(roomId),
  });

  const {
    data: dbReviews = [],
  } = useQuery({
    queryKey: ["room-reviews", roomId],
    queryFn: () => layDanhGiaPhongApi(roomId),
    enabled: Boolean(roomId),
  });

  useEffect(() => {
    if (!room) return;
    luuPhongDaXem(room);
  }, [room]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="surface-card h-96 animate-pulse bg-slate-200" />
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="surface-card border-rose-200 p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-rose-600">
            Lỗi dữ liệu
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Không tải được chi tiết chỗ ở.
          </h1>
          <Link
            to="/rooms"
            className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Quay lại danh sách
          </Link>
        </div>
      </main>
    );
  }

  const availability = layThongTinTinhTrangPhong(room.inventory_count);
  const gallery = [room.image_url, ...(room.gallery || [])]
    .map((image) => resolveMediaUrl(image))
    .filter(Boolean)
    .filter((image, index, array) => array.indexOf(image) === index)
    .slice(0, 5);
  const bookingPath = token
    ? taoDuongDanDatPhong(room.id)
    : taoDuongDanDangNhapChuyenHuong(taoDuongDanDatPhong(room.id));
  const canBook = Number(room.inventory_count) > 0;
  
  const formattedRealReviews = (dbReviews || []).map((rv) => ({
    id: rv.id,
    user: rv.user,
    date: dinhDangNgayDanhGia(rv.date),
    rating: rv.rating,
    comment: rv.comment,
  }));

  const allReviews = [...formattedRealReviews, ...FAKE_REVIEWS];

  return (
    <main className="detail-page-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link
          to="/rooms"
          className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-600 hover:text-brand-700"
        >
          ← Quay lại danh sách
        </Link>

        <section className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="relative grid gap-2 md:grid-cols-[2fr_1fr]">
              <img
                src={gallery[0]}
                alt={`${room.hotel_name} ${room.room_name}`}
                className="h-[400px] w-full rounded-l-2xl object-cover cursor-pointer transition hover:brightness-95"
              />
              <div className="hidden md:grid grid-cols-2 gap-2">
                {gallery.slice(1, 5).map((image, idx) => (
                  <img
                    key={image}
                    src={image}
                    alt={room.hotel_name}
                    className={`h-[196px] w-full object-cover cursor-pointer transition hover:brightness-95 ${idx === 1 ? 'rounded-tr-2xl' : ''} ${idx === 3 || gallery.length - 2 === idx ? 'rounded-br-2xl' : ''}`}
                  />
                ))}
              </div>
              <button className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-slate-950 bg-white px-4 py-2 text-sm font-bold shadow-sm transition hover:bg-slate-100">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Hiển thị tất cả ảnh
              </button>
            </div>

            <article className="mt-6 surface-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${availability.lopHuyHieu}`}
                    >
                      {availability.label}
                    </span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      {NHAN_LOAI_PHONG[room.room_type] || room.room_type}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextFavorites = daoTrangThaiPhongYeuThich(room);
                        setFavoriteRoomIds(
                          new Set(nextFavorites.map((item) => String(item.id))),
                        );
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-extrabold transition ${
                        favorite
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-600"
                      }`}
                    >
                      {favorite ? "Bỏ yêu thích" : "Yêu thích"}
                    </button>
                  </div>
                  <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {room.hotel_name}
                  </h1>
                  <p className="mt-2 text-lg font-bold text-slate-600">
                    {room.room_name}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {room.address}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
                  <p className="text-xs font-semibold text-slate-300">
                    Đánh giá
                  </p>
                  <p className="mt-1 text-3xl font-black">
                    {Number(room.rating_avg || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-300">
                    {room.total_reviews} lượt đánh giá
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-8 border-y border-slate-200 py-6">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <span className="text-base text-slate-700">Sức chứa <strong>{room.max_guests} khách</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                  <span className="text-base text-slate-700">Tồn phòng: <strong>{room.inventory_count}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                   <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                  <span className="text-base text-slate-700">Loại: <strong>{NHAN_LOAI_PHONG[room.room_type] || room.room_type}</strong></span>
                </div>
              </div>
            </article>

            <article className="mt-6 surface-card p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
                Giới thiệu
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Thông tin chỗ ở
              </h2>
              <p className="mt-5 text-sm leading-8 text-slate-600">
                {room.description} Chỗ ở phù hợp cho khách muốn di chuyển thuận
                tiện, không gian nghỉ ngơi riêng tư và dịch vụ rõ ràng trước khi
                đặt.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
                    Tiện nghi
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {(room.amenities || []).map((amenity) => (
                      <div key={amenity} className="flex items-center gap-3 text-slate-700">
                        {iconTienNghi[amenity] || <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                        <span className="text-base">{dinhDangTienNghi(amenity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-5">
                  <p className="text-sm font-bold text-brand-700">
                    Điểm nổi bật
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                    <li>
                      Vị trí dễ di chuyển, phù hợp nghỉ dưỡng hoặc công tác.
                    </li>
                    <li>
                      Thông tin giá, tồn phòng và chính sách được hiển thị rõ.
                    </li>
                    <li>
                      Có thể lưu vào yêu thích để xem lại trong tab Lịch sử.
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            <article className="mt-6 border-t border-slate-200 pt-8 pb-12">
              <div className="flex items-center gap-2 mb-6">
                <svg className="h-6 w-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  {Number(room.rating_avg || 0).toFixed(1)} · {room.total_reviews || 0} đánh giá
                </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
                {[{ label: "Mức độ sạch sẽ", value: 4.9 }, { label: "Độ chính xác", value: 4.8 }, { label: "Giao tiếp", value: 4.9 }, { label: "Vị trí", value: 4.9 }, { label: "Nhận phòng", value: 4.8 }, { label: "Giá trị", value: 4.7 }].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${(item.value / 5) * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {allReviews.slice(0, 10).map(review => (
                  <div key={review.id}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                        {String(review.user || 'K').charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{review.user}</h4>
                        <p className="text-sm text-slate-500">{review.date}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-slate-700">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              <button className="mt-8 rounded-lg border border-slate-950 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-50">
                Hiển thị tất cả {room.total_reviews || 0} đánh giá
              </button>
            </article>
          </div>

          <aside className="surface-card p-5 lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
              Tóm tắt đặt chỗ
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              {canBook ? "Sẵn sàng đặt phòng này" : "Tạm hết phòng"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {canBook
                ? "Nếu chưa đăng nhập, hệ thống sẽ đưa bạn sang form đăng nhập rồi quay lại đúng bước đặt phòng."
                : "Bạn vẫn có thể xem thông tin, nhưng chưa thể tạo booking cho chỗ ở này."}
            </p>

            <div className="mt-6 flex flex-col">
              <p className="text-sm font-medium text-slate-500 line-through">
                {dinhDangTien(room.price_per_night * 1.3)}
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-slate-950">
                  {dinhDangTien(room.price_per_night)}
                </p>
                <span className="text-sm font-medium text-slate-500">/ đêm</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-400 overflow-hidden">
              <div className="flex border-b border-slate-400">
                <div className="flex-1 p-3 border-r border-slate-400">
                  <label className="block text-[10px] font-bold uppercase text-slate-800">Nhận phòng</label>
                  <input type="date" className="w-full text-sm font-medium outline-none text-slate-600 bg-transparent mt-1" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="flex-1 p-3">
                  <label className="block text-[10px] font-bold uppercase text-slate-800">Trả phòng</label>
                  <input type="date" className="w-full text-sm font-medium outline-none text-slate-600 bg-transparent mt-1" defaultValue={NGAY_TRA_PHONG_MAC_DINH} />
                </div>
              </div>
              <div className="p-3">
                <label className="block text-[10px] font-bold uppercase text-slate-800">Khách</label>
                <select className="w-full text-sm font-medium outline-none text-slate-600 bg-transparent mt-1">
                  <option>1 khách</option>
                  <option>2 khách</option>
                  <option>3 khách</option>
                  <option>4 khách</option>
                </select>
              </div>
            </div>

            <Link
              to={canBook ? bookingPath : `/rooms/${room.id}`}
              className={`mt-4 flex w-full items-center justify-center rounded-lg px-5 py-4 text-base font-bold text-white transition ${
                canBook
                  ? "bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/30"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              {canBook
                ? token
                  ? "Đặt phòng"
                  : "Đăng nhập để đặt phòng"
                : "Hết phòng"}
            </Link>
            
            <p className="mt-3 text-center text-sm text-slate-500">Bạn vẫn chưa bị trừ tiền</p>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span className="underline">{dinhDangTien(room.price_per_night)} x 1 đêm</span>
                <span>{dinhDangTien(room.price_per_night)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span className="underline">Phí dịch vụ</span>
                <span>0 ₫</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 border-t border-slate-200 pt-3">
                <span>Tổng trước thuế</span>
                <span>{dinhDangTien(room.price_per_night)}</span>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default ChiTietPhong;
