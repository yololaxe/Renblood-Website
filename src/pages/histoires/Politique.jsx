// src/pages/Politique.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import politique from "../../data/politique";
import { FaChessRook, FaCrown, FaCoins, FaHourglassHalf, FaScroll, FaMapMarkerAlt } from "react-icons/fa";

export default function Politiques() {
  const data = Array.isArray(politique.data) ? politique.data : [];
  const lieuxDisponibles = [
    ...new Set(data.flatMap((r) => (Array.isArray(r.lieu) ? r.lieu : []))),
  ];
  const [lieuSelectionne, setLieuSelectionne] = useState(lieuxDisponibles[0] || "");
  const rolesFiltres = data.filter((r) =>
    Array.isArray(r.lieu) && r.lieu.includes(lieuSelectionne)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* Hero Header */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-16 px-4 mb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-700 mb-4 relative z-10"
        >
          Système Politique
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
          Découvrez les rouages du pouvoir, les titres et les responsabilités qui régissent chaque région.
        </p>
      </div>

      {/* Filtres Lieux */}
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="flex flex-wrap justify-center gap-3">
          {lieuxDisponibles.map((lieu) => (
            <button
              key={lieu}
              onClick={() => setLieuSelectionne(lieu)}
              className={`
                px-5 py-2 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2
                ${lieuSelectionne === lieu
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700"
                }
              `}
            >
              <FaMapMarkerAlt /> {lieu}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des Rôles (Cartes) */}
      <div className="max-w-6xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={lieuSelectionne}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {rolesFiltres.length > 0 ? (
              rolesFiltres.map((role, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden hover:border-blue-500/50 transition-all group"
                >
                  {/* Header Carte */}
                  <div className="bg-gray-900/50 p-5 border-b border-gray-700 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        <FaChessRook className="text-blue-500" /> {role.titre}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1 italic">{role.role || "Aucun rôle défini"}</p>
                    </div>
                    {role.revenu && (
                      <div className="bg-yellow-900/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30 flex items-center gap-1">
                        <FaCoins /> {role.revenu}
                      </div>
                    )}
                  </div>

                  {/* Corps Carte */}
                  <div className="p-5 space-y-4 text-sm">
                    
                    {/* Privilèges */}
                    {role.privileges?.length > 0 && (
                      <div>
                        <h3 className="text-blue-300 font-bold mb-2 flex items-center gap-2"><FaCrown /> Privilèges</h3>
                        <ul className="grid grid-cols-1 gap-1">
                          {role.privileges.map((p, j) => (
                            <li key={j} className="flex items-start gap-2 text-gray-300">
                              <span className="text-blue-500 mt-1">•</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Requis */}
                    {role.requis?.length > 0 && (
                      <div>
                        <h3 className="text-red-300 font-bold mb-2 flex items-center gap-2"><FaScroll /> Prérequis</h3>
                        <ul className="grid grid-cols-1 gap-1">
                          {role.requis.map((r, j) => (
                            <li key={j} className="flex items-start gap-2 text-gray-300">
                              <span className="text-red-500 mt-1">•</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-gray-700 flex justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1"><FaHourglassHalf /> Durée : {role.temps || "Illimité"}</span>
                      <span>Arrivée : {role.arrivee || "Nomination"}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-500">
                Aucun rôle politique trouvé pour ce lieu.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
