import { AnimatePresence, motion } from "framer-motion";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import { useEffect } from "react";

export default function Toast({ status, message, onClose, duration = 3500 }) {
  const normalizedStatus = status?.toLowerCase();
  const isSuccess = normalizedStatus === "good" || normalizedStatus === "success";
  const isError = normalizedStatus === "bad" || normalizedStatus === "error";
  const bgClass = isSuccess ? "bg-green-600" : isError ? "bg-red-600" : "bg-blue-600";
  const Icon = isSuccess ? FaCheckCircle : isError ? FaExclamationCircle : FaInfoCircle;

  useEffect(() => {
    if (!status || !onClose || duration <= 0) return undefined;
    const timeoutId = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, message, onClose, status]);

  return (
    <AnimatePresence>
      {status && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={onClose}
          className={`fixed bottom-4 right-4 z-[110] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-left text-white shadow-xl ${bgClass}`}
        >
          <Icon className="shrink-0" />
          <span>{message}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
