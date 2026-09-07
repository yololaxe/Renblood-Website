import LoadingState from "../LoadingState";

export default function EmptyState({ title = "Aucune donnée", message = "Rien à afficher pour le moment.", action = null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-12 text-center text-slate-300">
      <div className="text-lg font-semibold text-white">{title}</div>
      <p className="max-w-md text-sm text-slate-400">{message}</p>
      {action}
    </div>
  );
}
