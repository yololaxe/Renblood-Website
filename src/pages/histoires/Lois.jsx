// src/pages/Lois.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import lois from "../../data/lois";
import { FaBalanceScale, FaGavel, FaBook } from "react-icons/fa";

export default function Lois() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* Hero Header */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-16 px-4 mb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-500 to-red-700 mb-4 relative z-10"
        >
          Code Pénal & Lois
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
          Nul n'est censé ignorer la loi. Voici les règles qui régissent l'ordre et la justice en Renblood.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
        {lois.map((loi, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`
                relative flex flex-col
                bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg
                ${isOpen ? "md:col-span-2 lg:col-span-3 row-span-2 ring-2 ring-red-500/50" : "hover:border-red-500/30"}
              `}
            >
              {/* En-tête cliquable */}
              <button
                onClick={() => toggle(i)}
                className={`
                  w-full flex justify-between items-center px-6 py-5 transition-colors
                  ${isOpen ? "bg-gray-750" : "bg-gray-800 hover:bg-gray-750"}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isOpen ? "bg-red-900/30 text-red-400" : "bg-gray-700 text-gray-400"}`}>
                    <FaBalanceScale size={20} />
                  </div>
                  <span className={`text-xl font-bold ${isOpen ? "text-white" : "text-gray-300"}`}>{loi.titre}</span>
                </div>
                <span className={`text-2xl font-bold transition-transform duration-300 ${isOpen ? "rotate-45 text-red-400" : "text-gray-500"}`}>
                  +
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
                    className="bg-gray-800/50 border-t border-gray-700"
                  >
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {loi.articles.map((art, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-900/50 p-5 rounded-lg border border-gray-700/50 hover:border-red-500/20 transition"
                        >
                          <h3 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2">
                            <FaGavel className="text-sm" /> {art.titre}
                          </h3>
                          <ul className="text-gray-400 space-y-2 text-sm leading-relaxed">
                            {art.contenu.map((para, j) => (
                              <li key={j} className="flex gap-2">
                                <span className="text-red-500/50">•</span>
                                {para}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
