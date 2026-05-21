function DatPhongCuaToiQrMinhHoa({ token }) {
  return (
    <div className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-3">
      <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-1">
        {Array.from({ length: 25 }).map((_, index) => (
          <span
            key={`${token}-${index}`}
            className={`rounded-[2px] ${
              (token.charCodeAt(index % token.length) + index) % 3 === 0 ? 'bg-slate-950' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default DatPhongCuaToiQrMinhHoa;
