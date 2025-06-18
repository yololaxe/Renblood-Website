// src/pages/Lois.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import politique from "../../data/politique";

export default function Politiques() {
  // 1️⃣ Prépare les lieux et le filtre
  const data = Array.isArray(politique.data) ? politique.data : [];
  const lieuxDisponibles = [
    ...new Set(data.flatMap((r) => (Array.isArray(r.lieu) ? r.lieu : []))),
  ];
  const [lieuSelectionne, setLieuSelectionne] = useState(lieuxDisponibles[0] || "");
  const rolesFiltres = data.filter((r) =>
    Array.isArray(r.lieu) && r.lieu.includes(lieuSelectionne)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ─── TITRE ───────────────────────────── */}
        <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-center mb-10
                     bg-clip-text text-transparent
                     bg-gradient-to-r from-green-300 to-blue-400"
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
        >
          🏛️ Système Politique
        </motion.h1>


        {/* ─── SELECTEUR DE LIEU ────────────── */}
        <div className="flex flex-wrap justify-center gap-3">
          {lieuxDisponibles.map((lieu) => (
              <button
                  key={lieu}
                  onClick={() => setLieuSelectionne(lieu)}
                  className={`
                px-4 py-2 rounded-full font-medium transition
                ${lieuSelectionne === lieu
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }
              `}
              >
                {lieu}
              </button>
          ))}
        </div>

        {/* ─── TABLEAU ─────────────────────────── */}
        <div className="overflow-x-auto relative rounded-lg border border-gray-700">
          <table className="min-w-full table-auto">
            <thead className="sticky top-0 bg-gray-800 z-10">
            <tr>
              {["Titre", "Privilèges", "Rôle", "Arrivée", "Requis", "Revenu", "Temps"].map(
                  (h) => (
                      <th
                          key={h}
                          className="px-4 py-2 text-left font-semibold border-b border-gray-700"
                      >
                        {h}
                      </th>
                  )
              )}
            </tr>
            </thead>

            <AnimatePresence mode="wait">
              <motion.tbody
                  key={lieuSelectionne}
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -10}}
                  transition={{duration: 0.4}}
                  className="divide-y divide-gray-700"
              >
                {rolesFiltres.length > 0 ? (
                    rolesFiltres.map((role, i) => (
                        <motion.tr
                            key={i}
                            className="hover:bg-gray-700"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{duration: 0.3, delay: i * 0.05}}
                        >
                          <td className="px-4 py-3 font-medium">{role.titre}</td>
                          <td className="px-4 py-3">
                            {role.privileges?.length ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {role.privileges.map((p, j) => (
                                      <li key={j}>{p}</li>
                                  ))}
                                </ul>
                            ) : (
                                "Aucun"
                            )}
                          </td>
                          <td className="px-4 py-3">{role.role || "—"}</td>
                          <td className="px-4 py-3">{role.arrivee || "—"}</td>
                          <td className="px-4 py-3">
                            {role.requis?.length ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {role.requis.map((r, j) => (
                                      <li key={j}>{r}</li>
                                  ))}
                                </ul>
                            ) : (
                                "Aucun"
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {role.revenu || "—"}
                          </td>
                          <td className="px-4 py-3">{role.temps || "—"}</td>
                        </motion.tr>
                    ))
                ) : (
                    <tr>
                      <td
                          colSpan={7}
                          className="px-4 py-6 text-center text-gray-400"
                      >
                        Aucun rôle disponible pour ce lieu.
                      </td>
                    </tr>
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </div>
    </div>
  );
}
