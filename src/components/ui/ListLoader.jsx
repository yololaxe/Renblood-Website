export default function ListLoader({ count = 4, label = "Chargement..." }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`${label}-${index}`}
          className="animate-pulse rounded-2xl border border-slate-700 bg-slate-800/80 p-4"
        >
          <div className="mb-3 h-28 rounded-xl bg-slate-700/80" />
          <div className="mb-2 h-4 w-2/3 rounded bg-slate-700/80" />
          <div className="h-3 w-1/2 rounded bg-slate-700/70" />
        </div>
      ))}
    </div>
  );
}
