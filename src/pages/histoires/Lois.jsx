import RealmHeader from "../../components/RealmHeader";
// src/pages/Lois.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import lois from "../../data/lois";
import { FaBalanceScale, FaGavel, FaBook } from "react-icons/fa";

export default function Lois() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="min-h-screen bg-[#11110f] text-stone-200 pb-20">
      
      {/* Hero Header */}
      <RealmHeader eyebrow="Le royaume / Justice" title="Code Pénal & Lois" description="Nul n'est censé ignorer la loi. Voici les règles qui régissent l'ordre et la justice en Renblood." />

      {/* Grid */}
      <div className="max-w-[1520px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
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
                bg-[#1b1b17] border border-stone-700 rounded-sm overflow-hidden shadow-none
                ${isOpen ? "md:col-span-2 lg:col-span-3 row-span-2 ring-2 ring-red-500/50" : "hover:border-red-500/30"}
              `}
            >
              {/* En-tête cliquable */}
              <button
                onClick={() => toggle(i)}
                className={`
                  w-full flex justify-between items-center px-6 py-5 transition-colors
                  ${isOpen ? "bg-gray-750" : "bg-[#1b1b17] hover:bg-gray-750"}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isOpen ? "bg-red-900/30 text-red-400" : "bg-stone-800 text-stone-400"}`}>
                    <FaBalanceScale size={20} />
                  </div>
                  <span className={`text-xl font-bold ${isOpen ? "text-white" : "text-stone-300"}`}>{loi.titre}</span>
                </div>
                <span className={`text-2xl font-bold transition-transform duration-300 ${isOpen ? "rotate-45 text-red-400" : "text-stone-500"}`}>
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
                    className="bg-[#1b1b17]/50 border-t border-stone-700"
                  >
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {loi.articles.map((art, idx) => (
                        <div
                          key={idx}
                          className="bg-[#11110f]/50 p-5 rounded-lg border border-stone-700/50 hover:border-red-500/20 transition"
                        >
                          <h3 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2">
                            <FaGavel className="text-sm" /> {art.titre}
                          </h3>
                          <ul className="text-stone-400 space-y-2 text-sm leading-relaxed">
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
