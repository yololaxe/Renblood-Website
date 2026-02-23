// src/pages/Armee.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import data from "../../data/Armee";
import { FaShieldAlt, FaDragon, FaMagic, FaHourglassHalf, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function Armee() {
  const [selectedRank, setSelectedRank] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const typeMapping = {
    Humains: "Armée des humains",
    Créatures: "Armée des créatures",
    Mystique: "Armée Mystique",
  };

  const icons = {
    Humains: <FaShieldAlt />,
    Créatures: <FaDragon />,
    Mystique: <FaMagic />,
  };

  const colors = {
    Humains: "text-blue-400 border-blue-500/30 bg-blue-900/20",
    Créatures: "text-green-400 border-green-500/30 bg-green-900/20",
    Mystique: "text-purple-400 border-purple-500/30 bg-purple-900/20",
  };

  const handleClick = (index, type) => {
    setSelectedRank(index);
    setSelectedType(type);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* Hero Header */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-16 px-4 mb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 mb-4 relative z-10"
        >
          Forces Militaires
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
          La hiérarchie des défenseurs du royaume, des simples soldats aux commandants légendaires.
        </p>
      </div>

      {/* Grid des Rangs */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {["Humains", "Créatures", "Mystique"].map((type) => (
          <div key={type} className="space-y-4">
            <div className={`flex items-center gap-3 text-xl font-bold uppercase tracking-wider pb-4 border-b border-gray-700 ${colors[type].split(" ")[0]}`}>
              {icons[type]} {type}
            </div>
            
            <div className="space-y-3">
              {data[typeMapping[type]].map((rankName, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 5 }}
                  onClick={() => handleClick(i, type)}
                  className={`
                    cursor-pointer p-4 rounded-lg border transition-all flex justify-between items-center
                    ${colors[type]} hover:bg-opacity-40
                  `}
                >
                  <span className="font-bold text-white">{rankName || "—"}</span>
                  <span className="text-xs opacity-70 font-mono">Année {data["Année"]?.[i]}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedRank !== null && selectedType && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRank(null)}
          >
            <motion.div
              className="bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-600 overflow-hidden relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className={`p-6 text-center border-b border-gray-700 ${colors[selectedType].replace("bg-opacity-20", "bg-opacity-50")}`}>
                <button
                  onClick={() => setSelectedRank(null)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                >
                  <FaTimes size={20} />
                </button>
                <div className="text-4xl mb-2 text-white opacity-80">{icons[selectedType]}</div>
                <h2 className="text-2xl font-bold text-white">
                  {data[typeMapping[selectedType]]?.[selectedRank] || "Inconnu"}
                </h2>
                <p className="text-sm text-white/70 uppercase tracking-widest mt-1">{selectedType}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex items-start gap-3">
                  <FaInfoCircle className="text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {data[`Description (${selectedType})`]?.[selectedRank] || "Pas de description disponible."}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-yellow-500 font-bold bg-yellow-900/20 py-3 rounded-lg border border-yellow-500/30">
                  <FaHourglassHalf />
                  <span>Expérience requise : {data["Année"]?.[selectedRank] || "?"} ans</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
