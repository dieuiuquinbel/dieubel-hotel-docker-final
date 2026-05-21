// Trang chi tiet phong: hien thi gallery, tien nghi, danh gia va nut dat phong.
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { layPhongTheoId } from "../../services/phongApi";
import useKhoXacThuc from "../../store/khoXacThuc";
import { dinhDangTien } from "../../utils/dinhDang";
import { taoDuongDanDatPhong, taoDuongDanDangNhapChuyenHuong } from "../../utils/duongDan";
import { layThongTinTinhTrangPhong } from "../../utils/tinhTrangPhong";
import { resolveMediaUrl } from "../../utils/media";
import { docDanhGiaPhong } from "../../utils/lichSuDatPhong";
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
  const localReviews = docDanhGiaPhong(room.id);

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
            <div className="surface-card overflow-hidden p-3">
              <div className="grid gap-3 md:grid-cols-[1.35fr_0.65fr]">
                <img
                  src={gallery[0]}
                  alt={`${room.hotel_name} ${room.room_name}`}
                  className="h-[420px] w-full rounded-md object-cover"
                />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                  {gallery.slice(1, 5).map((image) => (
                    <img
                      key={image}
                      src={image}
                      alt={room.hotel_name}
                      className="h-[98px] w-full rounded-md object-cover"
                    />
                  ))}
                </div>
              </div>
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

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">
                    Giá mỗi đêm
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {dinhDangTien(room.price_per_night)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Sức chứa</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {room.max_guests} khách
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Tồn phòng</p>
                  <p
                    className={`mt-2 text-2xl font-black ${availability.textClass}`}
                  >
                    {room.inventory_count} phòng
                  </p>
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
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(room.amenities || []).map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
                      >
                        {dinhDangTienNghi(amenity)}
                      </span>
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

            <article className="mt-6 surface-card p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">Đánh giá khách hàng</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Cảm nhận sau lưu trú</h2>
              <div className="mt-5 grid gap-3">
                {localReviews.length ? (
                  localReviews.map((review) => (
                    <div key={review.id} className="rounded-xl bg-slate-50 p-4">
                      <p className="font-black text-slate-950">{review.guestName || 'Khách hàng'} · {review.rating} sao</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{review.content || 'Không có nội dung.'}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có đánh giá từ khách đã trả phòng.</p>
                )}
              </div>
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

            <div className="mt-6 grid gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-500">
                    Trạng thái
                  </span>
                  <span
                    className={`text-sm font-black ${availability.textClass}`}
                  >
                    {availability.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {availability.description(room.inventory_count)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-bold text-slate-500">
                  Thanh toán dự kiến
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {dinhDangTien(room.price_per_night)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Chưa gồm dịch vụ phát sinh
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {room.free_cancellation ? (
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                  Hủy miễn phí
                </span>
              ) : null}
              {room.breakfast_included ? (
                <span className="rounded-full bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700">
                  Có bữa sáng
                </span>
              ) : null}
            </div>

            <Link
              to={canBook ? bookingPath : `/rooms/${room.id}`}
              className={`mt-7 inline-flex w-full items-center justify-center rounded-md px-5 py-4 text-sm font-black text-white transition ${
                canBook
                  ? "bg-slate-950 hover:bg-brand-700"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              {canBook
                ? token
                  ? "Tiếp tục đặt phòng"
                  : "Đăng nhập để đặt"
                : "Hết phòng"}
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default ChiTietPhong;
