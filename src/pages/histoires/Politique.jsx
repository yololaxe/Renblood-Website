import RealmHeader from "../../components/RealmHeader";
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
    <div className="min-h-screen bg-[#11110f] text-stone-200 pb-20">
      
      {/* Hero Header */}
      <RealmHeader eyebrow="Le royaume / Pouvoirs" title="Système Politique" description="Découvrez les rouages du pouvoir, les titres et les responsabilités qui régissent chaque région." />

      {/* Filtres Lieux */}
      <div className="max-w-[1520px] mx-auto px-6 mb-10">
        <div className="flex flex-wrap justify-center gap-3">
          {lieuxDisponibles.map((lieu) => (
            <button
              key={lieu}
              onClick={() => setLieuSelectionne(lieu)}
              className={`
                px-5 py-2 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2
                ${lieuSelectionne === lieu
                  ? "bg-amber-800 text-white shadow-none shadow-blue-500/30"
                  : "bg-[#1b1b17] text-stone-400 hover:bg-stone-800 hover:text-white border border-stone-700"
                }
              `}
            >
              <FaMapMarkerAlt /> {lieu}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des Rôles (Cartes) */}
      <div className="max-w-[1520px] mx-auto px-6">
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
                  className="bg-[#1b1b17] rounded-sm border border-stone-700 shadow-none overflow-hidden hover:border-amber-600/50 transition-all group"
                >
                  {/* Header Carte */}
                  <div className="bg-[#11110f]/50 p-5 border-b border-stone-700 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                        <FaChessRook className="text-blue-500" /> {role.titre}
                      </h2>
                      <p className="text-sm text-stone-400 mt-1 italic">{role.role || "Aucun rôle défini"}</p>
                    </div>
                    {role.revenu && (
                      <div className="bg-yellow-900/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30 flex items-center gap-1">
                        <FaCoins /> {role.revenu}
                      </div>
                    )}
                  </div>

                  {/* Corps Carte */}
                  <div className="p-5 space-y-4 text-sm">
                    
                    {/* Privilèges */}
                    {role.privileges?.length > 0 && (
                      <div>
                        <h3 className="text-amber-200 font-bold mb-2 flex items-center gap-2"><FaCrown /> Privilèges</h3>
                        <ul className="grid grid-cols-1 gap-1">
                          {role.privileges.map((p, j) => (
                            <li key={j} className="flex items-start gap-2 text-stone-300">
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
                            <li key={j} className="flex items-start gap-2 text-stone-300">
                              <span className="text-red-500 mt-1">•</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-stone-700 flex justify-between text-xs text-stone-500">
                      <span className="flex items-center gap-1"><FaHourglassHalf /> Durée : {role.temps || "Illimité"}</span>
                      <span>Arrivée : {role.arrivee || "Nomination"}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-stone-500">
                Aucun rôle politique trouvé pour ce lieu.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
