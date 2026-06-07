import { AnimatePresence, motion } from "framer-motion";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

export default function ConfirmDialog({
  open,
  title = "Confirmation",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => !loading && onCancel()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md rounded-2xl border border-gray-600 bg-gray-800 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4 border-b border-gray-700 p-6">
              <div className={`rounded-full p-3 ${danger ? "bg-red-900/40 text-red-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                <FaExclamationTriangle />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-300">{message}</p>
              </div>
              <button disabled={loading} onClick={onCancel} className="text-gray-400 hover:text-white disabled:opacity-50">
                <FaTimes />
              </button>
            </div>
            <div className="flex justify-end gap-3 p-4">
              <button disabled={loading} onClick={onCancel} className="px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50">
                {cancelLabel}
              </button>
              <button
                disabled={loading}
                onClick={onConfirm}
                className={`min-w-28 rounded-lg px-5 py-2 font-bold text-white disabled:cursor-wait disabled:opacity-60 ${
                  danger ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {loading ? "Traitement..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
