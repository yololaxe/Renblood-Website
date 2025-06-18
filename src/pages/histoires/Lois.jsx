// src/pages/Lois.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import lois from "../../data/lois";

export default function Lois() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-7xl mx-auto">
        {/* Titre principal */}
        <h1
          className="text-4xl md:text-5xl font-extrabold text-center mb-10
                     bg-clip-text text-transparent
                     bg-gradient-to-r from-green-300 to-blue-400"
        >
          ⚖️ Lois du Royaume
        </h1>

        {/* Grille responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
          {lois.map((loi, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                layout
                className={`
                  relative flex flex-col
                  border border-gray-600 rounded-xl overflow-hidden shadow-lg
                  w-full
                  ${isOpen ? "sm:col-span-2 lg:col-span-3" : "col-span-1"}
                `}
              >
                {/* En-tête cliquable */}
                <button
                  onClick={() => toggle(i)}
                  className={`
                    w-full flex justify-between items-center
                    ${isOpen ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"}
                    px-6 py-4 transition
                  `}
                >
                  <span className="text-xl font-semibold">{loi.titre}</span>
                  <span className="text-2xl font-bold">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* Contenu accordéon */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-800 px-6 pt-0 pb-6 overflow-y-auto max-h-[60vh]"
                    >
                      {loi.articles.map((art, idx) => (
                        <div
                          key={idx}
                          className="mb-6 last:mb-0 border-b border-gray-700 pb-4"
                        >
                          <h3 className="text-lg font-bold text-gray-200 mb-2">
                            {art.titre}
                          </h3>
                          <ul className="text-gray-400 list-disc list-inside space-y-1">
                            {art.contenu.map((para, j) => (
                              <li key={j}>{para}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
