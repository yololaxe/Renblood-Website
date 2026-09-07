export default function ErrorState({ title = "Une erreur est survenue", message = "Le chargement a échoué.", action = null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 px-6 py-12 text-center text-rose-100">
      <div className="text-lg font-semibold">{title}</div>
      <p className="max-w-md text-sm text-rose-200/80">{message}</p>
      {action}
    </div>
  );
}
