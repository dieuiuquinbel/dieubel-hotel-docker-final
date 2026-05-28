// Chức năng: Hiển thị các bộ lọc phòng đang áp dụng.
function TheBoLocDangDung({ chips, onRemove, onReset }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sky-100 bg-white p-3">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip)}
          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-brand-700 transition hover:border-brand-500 hover:bg-white"
        >
          {chip.label} x
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-brand-500 hover:text-brand-700"
      >
        Làm mới
      </button>
    </div>
  );
}

export default TheBoLocDangDung;
