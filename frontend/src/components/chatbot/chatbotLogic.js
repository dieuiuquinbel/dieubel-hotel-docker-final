// Ch?c n?ng: D? li?u v? logic tr? l?i thu?n cho chatbot h? tr? ??t ph?ng.
import { layDanhSachPhong } from '../../services/phongApi';

export const AVATAR_SRC = "/chat-avatar.png";

export const GOI_Y_NHANH = [
  {
    label: "Đà Nẵng dưới 1 triệu",
    message: "Có phòng Đà Nẵng dưới 1 triệu không?",
  },
  { label: "Phú Quốc 2 người", message: "Tôi muốn đi Phú Quốc 2 người" },
  { label: "Cọc 10%", message: "Cọc giữ phòng bao nhiêu?" },
  { label: "Hủy phòng", message: "Hủy đặt chỗ có mất phí không?" },
  { label: "Giờ check-in", message: "Mấy giờ được nhận phòng?" },
  { label: "Có bữa sáng?", message: "Phòng có bao gồm bữa sáng không?" },
  { label: "Thanh toán", message: "Thanh toán bằng cách nào?" },
];

const DIA_DIEM = [
  {
    label: "Đà Nẵng",
    query: "Da Nang",
    aliases: ["đà nẵng", "da nang", "danang"],
  },
  { label: "Phú Quốc", query: "Phu Quoc", aliases: ["phú quốc", "phu quoc"] },
  { label: "Hà Nội", query: "Ha Noi", aliases: ["hà nội", "ha noi", "hanoi"] },
  { label: "Nha Trang", query: "Nha Trang", aliases: ["nha trang"] },
  { label: "Hội An", query: "Hoi An", aliases: ["hội an", "hoi an"] },
];
const CHAO = ["xin chào", "xin chao", "chào", "chao", "hello", "hi", "hey"];
const CAM_ON = ["cảm ơn", "cam on", "thanks", "thank you"];
const TU_KHOA_KHACH_SAN = [
  "phòng",
  "phong",
  "khách sạn",
  "khach san",
  "resort",
  "homestay",
  "villa",
  "đặt phòng",
  "dat phong",
  "đặt chỗ",
  "dat cho",
  "giữ phòng",
  "giu phong",
  "nhận phòng",
  "nhan phong",
  "trả phòng",
  "tra phong",
  "check-in",
  "checkin",
  "check-out",
  "checkout",
  "lễ tân",
  "le tan",
  "bữa sáng",
  "bua sang",
  "wifi",
  "hồ bơi",
  "ho boi",
  "đỗ xe",
  "do xe",
  "voucher",
  "giá",
  "gia",
  "cọc",
  "coc",
  "hủy",
  "huy",
  "hoàn tiền",
  "hoan tien",
  "thanh toán",
  "thanh toan",
  "vietqr",
];

const LOI_CHAO_CUNG_DAU = [
  "Bổn cung đã an tọa trong nội điện. Khanh muốn tìm phòng, hỏi giá, cọc giữ chỗ hay tra voucher thì cứ bẩm rõ.",
  "Miễn lễ. Việc đặt phòng cứ để bổn cung xét tấu, chỉ cần nói điểm đến, ngân sách và số khách.",
  "Ngự tiền đã mở, kẻ hữu duyên cứ hỏi. Bổn cung chuyên lo phòng ốc, giá cả, voucher và chuyện nhận phòng.",
];

const LOI_CAM_ON_CUNG_DAU = [
  "Miễn tạ ơn. Khi nào cần tìm chốn nghỉ chân, cứ truyền bổn cung một tiếng.",
  "Chút việc nhỏ trong hậu cung đặt phòng thôi. Khanh cứ yên tâm chuẩn bị hành lý.",
  "Không cần đa lễ. Có biến trong đơn đặt chỗ thì quay lại bẩm bổn cung.",
];

const TU_CHOI_NGOAI_PHAM_VI = [
  "Việc này nằm ngoài sổ sách khách điếm, bổn cung không dám phán bừa. Khanh hỏi về phòng, giá, voucher, cọc, hủy đơn hoặc giờ nhận phòng thì bổn cung xét ngay.",
  "Tấu chương này không thuộc phạm vi khách sạn, bổn cung xin khép rèm không luận. Nếu cần tìm phòng hay hỏi chính sách đặt chỗ, cứ bẩm lại cho rõ.",
  "Chuyện ngoài cung phòng ốc, bổn cung không tiện ban chỉ. Khanh đổi sang hỏi điểm đến, ngân sách, tiện nghi hoặc thanh toán, bổn cung sẽ tra giúp.",
];

function chonCauTraLoi(items, seed = "") {
  if (!items.length) return "";
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return items[total % items.length];
}

function boDauTiengViet(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function dinhDangTien(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function timDiaDiem(text) {
  const normalized = boDauTiengViet(text.toLowerCase());
  return DIA_DIEM.find((place) =>
    place.aliases.some((alias) =>
      normalized.includes(boDauTiengViet(alias.toLowerCase())),
    ),
  );
}

function timNganSach(text) {
  const normalized = boDauTiengViet(text.toLowerCase()).replace(/,/g, ".");
  const trieuMatch = normalized.match(
    /(?:duoi|khoang|tam|toi da|<=|<)?\s*(\d+(?:\.\d+)?)\s*(?:trieu|tr)/,
  );
  const nghinMatch = normalized.match(
    /(?:duoi|khoang|tam|toi da|<=|<)?\s*(\d{3,})\s*(?:k|nghin|ngan)?/,
  );

  if (trieuMatch) return Math.round(Number(trieuMatch[1]) * 1000000);
  if (nghinMatch) {
    const raw = Number(nghinMatch[1]);
    return raw < 10000 ? raw * 1000 : raw;
  }

  return null;
}

function timSoKhach(text) {
  const normalized = boDauTiengViet(text.toLowerCase());
  const match = normalized.match(/(\d+)\s*(?:nguoi|khach|ban|thanh vien)/);
  return match ? Number(match[1]) : null;
}

function coTu(text, words) {
  const normalized = boDauTiengViet(text.toLowerCase());
  return words.some((word) =>
    normalized.includes(boDauTiengViet(word.toLowerCase())),
  );
}

function coLoiChao(text) {
  const normalized = boDauTiengViet(text.toLowerCase());
  return CHAO.some((word) => {
    const keyword = boDauTiengViet(word.toLowerCase());
    const pattern = new RegExp(`(^|\\s|[.,!?])${keyword}(\\s|[.,!?]|$)`);
    return pattern.test(normalized);
  });
}

function taoLinkPhong(place, budget, guests) {
  const params = new URLSearchParams();
  if (place?.query) params.set("city", place.query);
  if (budget) params.set("maxPrice", String(budget));
  if (guests) params.set("guests", String(guests));
  params.set("availableOnly", "true");
  params.set("sort", "price_asc");
  return `/rooms?${params.toString()}`;
}

function taoQueryPhong(place, budget, guests) {
  const params = new URLSearchParams();
  if (place?.query) params.set("city", place.query);
  if (budget) params.set("maxPrice", String(budget));
  if (guests) params.set("guests", String(guests));
  params.set("availableOnly", "true");
  params.set("sort", "price_asc");
  params.set("limit", "5");
  return params.toString();
}

function tomTatTienNghi(room) {
  const perks = [];
  if (room.breakfast_included) perks.push("bữa sáng");
  if (room.free_cancellation) perks.push("hủy miễn phí");
  if (Array.isArray(room.amenities)) {
    if (room.amenities.includes("wifi")) perks.push("wifi");
    if (room.amenities.includes("parking")) perks.push("đỗ xe");
    if (room.amenities.includes("pool")) perks.push("hồ bơi");
  }
  return perks.slice(0, 3).join(", ") || "tiện nghi cơ bản";
}

export async function taoPhanHoi(noiDung) {
  const text = noiDung.trim().toLowerCase();
  const place = timDiaDiem(text);
  const budget = timNganSach(text);
  const guests = timSoKhach(text);
  const hoiPhong = coTu(text, TU_KHOA_KHACH_SAN) || place || budget || guests;

  if (coLoiChao(text)) {
    return {
      text: chonCauTraLoi(LOI_CHAO_CUNG_DAU, text),
    };
  }

  if (coTu(text, CAM_ON)) {
    return {
      text: chonCauTraLoi(LOI_CAM_ON_CUNG_DAU, text),
    };
  }

  if (coTu(text, ["cọc", "coc", "đặt cọc", "giu phong", "giữ phòng"])) {
    return {
      text: "Theo lệ trong cung đặt phòng, khanh có thể cọc 10% để giữ chỗ trước. Muốn chắc như kim bài thì thanh toán toàn bộ bằng VietQR. Sau khi thanh toán, đơn sẽ có QR nhận phòng để trình lễ tân lúc check-in.",
      action: { label: "Xem đơn đặt chỗ", to: "/my-bookings" },
    };
  }

  if (
    coTu(text, ["hủy", "huy", "hoàn tiền", "hoan tien", "không đi", "khong di"])
  ) {
    return {
      text: "Nếu thánh chỉ đặt phòng vẫn còn ở trạng thái giữ chỗ, khanh có thể hủy trong trang Đặt chỗ của tôi. Nếu đã thanh toán, nên gửi hỗ trợ để nội vụ kiểm tra và hoàn tiền theo chính sách.",
      action: { label: "Gửi hỗ trợ", to: "/me" },
    };
  }

  if (coTu(text, ["check-in", "checkin", "nhận phòng", "nhan phong"])) {
    return {
      text: "Thông lệ là nhận phòng từ 14:00. Nếu khanh muốn vào sớm, hãy ghi chú khi đặt hoặc liên hệ lễ tân để xem phòng đã sẵn sàng chưa.",
      action: { label: "Xem phòng trống", to: "/rooms" },
    };
  }

  if (coTu(text, ["check-out", "checkout", "trả phòng", "tra phong"])) {
    return {
      text: "Giờ trả phòng thường là trước 12:00. Muốn lui giá thêm canh giờ thì khanh nên báo lễ tân sớm, vì còn tùy phòng và chính sách từng khách sạn.",
      action: { label: "Xem đặt chỗ", to: "/my-bookings" },
    };
  }

  if (coTu(text, ["bữa sáng", "bua sang", "ăn sáng", "an sang"])) {
    return {
      text: "Bữa sáng có hay không còn tùy từng hạng phòng. Khi bổn cung liệt kê phòng, khanh xem dòng ưu đãi; phòng nào có bữa sáng sẽ được ghi rõ trong sổ.",
      action: { label: "Tìm phòng có ưu đãi", to: "/rooms" },
    };
  }

  if (coTu(text, ["wifi", "hồ bơi", "ho boi", "đỗ xe", "do xe", "tiện nghi", "tien nghi"])) {
    return {
      text: "Tiện nghi mỗi cung phòng mỗi khác. Khanh mở danh sách phòng để lọc wifi, bãi đỗ xe, hồ bơi và các ưu đãi đi kèm trước khi chốt đơn.",
      action: { label: "Mở danh sách phòng", to: "/rooms" },
    };
  }

  if (coTu(text, ["thanh toán", "thanh toan", "vietqr", "qr", "chuyển khoản", "chuyen khoan"])) {
    return {
      text: "Khanh có thể thanh toán bằng VietQR. Hệ thống sẽ tạo mã sau khi chốt phòng; thanh toán xong thì đơn có QR nhận phòng để trình lễ tân.",
      action: { label: "Xem đặt chỗ", to: "/my-bookings" },
    };
  }

  if (
    coTu(text, [
      "voucher",
      "mã giảm",
      "ma giam",
      "ưu đãi",
      "uu dai",
      "giảm giá",
      "giam gia",
    ])
  ) {
    return {
      text: 'Voucher phải được dâng lên trước khi tạo QR thanh toán. Nếu mã hợp lệ, ngân khố sẽ tự trừ tiền và cập nhật tổng cuối cùng. Khanh có thể hỏi kiểu "phòng Đà Nẵng dưới 1 triệu" để bổn cung vừa tìm phòng vừa tính ngân sách.',
      action: { label: "Mở tài khoản/voucher", to: "/me" },
    };
  }

  if (place || budget || guests || hoiPhong) {
    const parts = [];
    if (place) parts.push(`ở ${place.label}`);
    if (budget) parts.push(`ngân sách khoảng ${dinhDangTien(budget)}/đêm`);
    if (guests) parts.push(`${guests} khách`);
    const scope = parts.length ? parts.join(", ") : "phù hợp";

    if (place || budget || guests) {
      try {
        const payload = await layDanhSachPhong(
          taoQueryPhong(place, budget, guests),
        );
        const rooms = Array.isArray(payload?.data) ? payload.data : [];
        const totalItems = Number(
          payload?.pagination?.totalItems || rooms.length || 0,
        );
        const roomLabel = totalItems === 1 ? "1 phòng" : `${totalItems} phòng`;

        if (!totalItems) {
          return {
            text: `Bổn cung đã lật sổ mà chưa thấy phòng nào ${scope}. Khanh thử tăng ngân sách, đổi điểm đến hoặc bớt điều kiện để hậu cung phòng ốc có thêm lựa chọn.`,
            action: {
              label: "Mở bộ lọc phòng",
              to: taoLinkPhong(place, budget, guests),
            },
          };
        }

        return {
          text: `Bổn cung tra được ${roomLabel} ${scope}. Một vài phòng có bữa sáng, hủy miễn phí hoặc tiện nghi nổi bật. Khanh bấm xem ngay để so giá và áp voucher nếu đơn đủ điều kiện.`,
          action: {
            label: `Xem ${roomLabel} phù hợp`,
            to: taoLinkPhong(place, budget, guests),
          },
          rooms: rooms.slice(0, 3).map((room) => ({
            id: room.id,
            hotelName: room.hotel_name,
            roomName: room.room_name,
            price: room.price_per_night,
            perks: tomTatTienNghi(room),
          })),
        };
      } catch {
        return {
          text: "Sổ phòng tạm thời chưa truyền về ngự tiền. Khanh vẫn có thể mở danh sách phòng để tự lọc theo điểm đến, giá và số khách.",
          action: {
            label: "Mở danh sách phòng",
            to: taoLinkPhong(place, budget, guests),
          },
        };
      }
    }

    return {
      text: 'Bổn cung cần thêm điểm đến, ngân sách hoặc số khách để xét phòng sát hơn. Khanh có thể hỏi: "Đà Nẵng dưới 1 triệu", "Phú Quốc 2 người", hoặc "khách sạn rẻ nhất".',
      action: { label: "Tìm chỗ ở", to: "/rooms" },
    };
  }

  return {
    text: chonCauTraLoi(TU_CHOI_NGOAI_PHAM_VI, text),
  };
}
