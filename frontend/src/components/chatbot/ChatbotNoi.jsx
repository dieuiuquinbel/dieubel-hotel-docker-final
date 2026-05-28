// Chức năng: Chatbot hỗ trợ hỏi nhanh về phòng, giá và chính sách.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { AVATAR_SRC, GOI_Y_NHANH, dinhDangTien, taoPhanHoi } from './chatbotLogic';

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
  const nextMessageId = useRef(2);
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

    const userMessageId = nextMessageId.current;
    const botMessageId = userMessageId + 1;
    nextMessageId.current += 2;

    setMessages((current) => [
      ...current,
      { id: userMessageId, type: "user", text: message },
    ]);
    setDraft("");
    setIsOpen(true);
    setIsThinking(true);

    const reply = await taoPhanHoi(message);
    setMessages((current) => [
      ...current,
      {
        id: botMessageId,
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
