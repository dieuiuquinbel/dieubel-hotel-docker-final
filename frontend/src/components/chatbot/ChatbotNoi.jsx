import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { layDanhSachPhong } from "../../services/phongApi";

const AVATAR_SRC = "/chat-avatar.png";

const GOI_Y_NHANH = [
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

function dinhDangTien(value) {
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

async function taoPhanHoi(noiDung) {
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

function AvatarChatbot({ compact = false, online = false }) {
  const [imageError, setImageError] = useState(false);

  return (
    <span className="relative shrink-0">
      <span
        className={`grid place-items-center overflow-hidden rounded-full border-2 border-white bg-brand-600 text-white shadow-md shadow-slate-900/20 ${
          compact ? "h-10 w-10 text-xs" : "h-16 w-16 text-sm"
        }`}
      >
        {!imageError ? (
          <img
            src={AVATAR_SRC}
            alt="Trợ lý Trâm"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-black">T</span>
        )}
      </span>
      {online ? (
        <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
      ) : null}
    </span>
  );
}

function BongBongTinNhan({ children, type = "bot" }) {
  const isUser = type === "user";

  return (
    <div
      className={`chat-message-in flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "rounded-br-md bg-brand-600 text-white"
            : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="chat-message-in flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
        <span>Trâm đang kiểm tra</span>
        <span className="chat-typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}

function DanhSachPhongGoiY({ rooms = [] }) {
  if (!rooms.length) return null;

  return (
    <div className="chat-message-in ml-2 grid max-w-[86%] gap-2">
      {rooms.map((room) => (
        <Link
          key={room.id}
          to={`/rooms/${room.id}`}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
        >
          <p className="line-clamp-1 text-sm font-black text-slate-950">
            {room.hotelName}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-slate-500">
            {room.roomName}
          </p>
          <p className="mt-2 text-sm font-black text-brand-700">
            {dinhDangTien(room.price)} / đêm
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-700">
            Ưu đãi: {room.perks}
          </p>
        </Link>
      ))}
    </div>
  );
}

function ChatbotNoi() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Bổn cung Trâm đang giữ sổ phòng. Khanh cần tìm nơi nghỉ theo điểm đến, ngân sách, số khách, voucher hay chính sách đặt chỗ thì cứ bẩm.",
    },
  ]);

  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, messages, isThinking]);

  const guiTinNhan = async (noiDung) => {
    const message = noiDung.trim();
    if (!message || isThinking) return;

    const time = Date.now();
    setMessages((current) => [
      ...current,
      { id: time, type: "user", text: message },
    ]);
    setDraft("");
    setIsOpen(true);
    setIsThinking(true);

    const reply = await taoPhanHoi(message);
    setMessages((current) => [
      ...current,
      {
        id: time + 1,
        type: "bot",
        text: reply.text,
        action: reply.action,
        rooms: reply.rooms,
      },
    ]);
    setIsThinking(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    guiTinNhan(draft);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <section className="chat-panel-in mb-4 w-[calc(100vw-2rem)] max-w-[460px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:w-[460px]">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
            <AvatarChatbot compact online />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-950">
                Trợ lý Trâm
              </p>
              <p className="truncate text-xs font-semibold text-slate-500">
                Tư vấn phòng, giá và voucher
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng khung chat"
              className="grid h-9 w-9 place-items-center rounded-full text-xl font-light text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              ×
            </button>
          </div>

          <div
            ref={scrollRef}
            className="max-h-[52vh] min-h-[320px] space-y-3 overflow-y-auto px-4 py-4 sm:max-h-[520px]"
          >
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <BongBongTinNhan type={message.type}>
                  {message.text}
                </BongBongTinNhan>
                {message.action ? (
                  <div className="chat-message-in flex justify-start">
                    <Link
                      to={message.action.to}
                      onClick={() => setIsOpen(false)}
                      className="ml-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-700 transition hover:border-brand-400 hover:bg-brand-100"
                    >
                      {message.action.label}
                    </Link>
                  </div>
                ) : null}
                {message.rooms ? (
                  <DanhSachPhongGoiY rooms={message.rooms} />
                ) : null}
              </div>
            ))}
            {isThinking ? <TypingDots /> : null}
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {GOI_Y_NHANH.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => guiTinNhan(item.message)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Nhập câu hỏi..."
                className="min-h-11 flex-1 rounded-full border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={isThinking}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-200"
                aria-label="Gửi câu hỏi"
              >
                →
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="chat-launcher group flex items-center gap-3 rounded-full border border-slate-200 bg-white p-2 pr-4 shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-brand-600/20 focus:outline-none focus:ring-4 focus:ring-sky-100"
        aria-label="Mở trợ lý đặt phòng Trâm"
      >
        <AvatarChatbot online />
        <span className="grid text-left leading-tight">
          <span className="text-sm font-black text-slate-950">
            Hỗ trợ đặt phòng
          </span>
          <span className="text-xs font-bold text-brand-700">
            Chat với Trâm
          </span>
          <span className="text-[11px] font-bold text-emerald-600">
            Đang online
          </span>
        </span>
      </button>
    </div>
  );
}

export default ChatbotNoi;
