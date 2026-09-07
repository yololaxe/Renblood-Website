export default function LoadingState({
  message = "Chargement...",
  className = "",
  size = "md",
}) {
  const sizeClass = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  }[size] || "h-6 w-6 border-2";

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 text-gray-300 ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-cyan-400 ${sizeClass}`}
        aria-label="Chargement"
      />
      <span className="text-sm font-medium tracking-wide">{message}</span>
    </div>
  );
}
