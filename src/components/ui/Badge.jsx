export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-slate-800 text-slate-200 border-slate-600",
    success: "bg-emerald-900/60 text-emerald-200 border-emerald-500/40",
    warning: "bg-amber-900/60 text-amber-200 border-amber-500/40",
    info: "bg-cyan-900/60 text-cyan-200 border-cyan-500/40",
    danger: "bg-rose-900/60 text-rose-200 border-rose-500/40",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
