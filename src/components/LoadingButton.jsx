export default function LoadingButton({ loading, disabled, children, loadingLabel = "Traitement...", className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
