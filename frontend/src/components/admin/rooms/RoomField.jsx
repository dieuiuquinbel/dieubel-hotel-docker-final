// Ô form chuẩn cho màn tạo/sửa phòng.
export default function RoomField({ label, children, className = '' }) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="text-sm font-black text-slate-700">{label}</span>
      {children}
    </label>
  );
}
