// Chức năng: Tạo ảnh QR check-in thật bằng API công khai.
export default function MyBookingsQrMock({ token }) {
  // Tự động xây dựng URL hướng tới trang check-in bằng địa chỉ hiện tại (LAN IP hoặc localhost)
  const checkinUrl = `${window.location.origin}/checkin?token=${token}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkinUrl)}`;

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl">
      <img
        src={qrImageUrl}
        alt="Check-in QR Code"
        className="h-40 w-40 object-contain transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
      <div className="mt-2 text-[10px] text-emerald-600 font-bold tracking-wider animate-pulse">
        MẠNG LAN HOẠT ĐỘNG
      </div>
    </div>
  );
}
