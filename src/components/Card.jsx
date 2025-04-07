// components/Card.jsx
import { motion, AnimatePresence } from "framer-motion";

function Card({ isOpen, onClose, couleur = "#D20000", children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-md z-50"
          onClick={onClose}
          style={{ backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            key="card"
            className="bg-gray-800 p-6 rounded-lg shadow-lg relative max-w-md w-full border-2"
            style={{ borderColor: couleur }}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full transition-transform hover:scale-110"
            >
              ✖
            </button>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Card;
