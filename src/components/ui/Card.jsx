export default function Card({
  children,
  className = "",
  padding = "p-4",
  hover = false,
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-slate-700 bg-slate-800/80 shadow-lg shadow-slate-950/20",
        padding,
        hover ? "transition-transform duration-200 hover:-translate-y-0.5" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
