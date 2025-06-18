// src/pages/Armee.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import data from "../../data/Armee";

export default function Armee() {
  const [selectedRank, setSelectedRank] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const typeMapping = {
    Humains: "Armée des humains",
    Créatures: "Armée des créatures",
    Mystique: "Armée Mystique",
  };

  const handleClick = (index, type) => {
    setSelectedRank(index);
    setSelectedType(type);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* TITRE */}
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-center mb-6
                   bg-clip-text text-transparent
                   bg-gradient-to-r from-green-300 to-blue-400"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        ⚔️ Hiérarchie Militaire
      </motion.h1>
      <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
        Découvrez les différents rangs des armées du royaume, leurs années
        d'expérience et leur rôle.
      </p>

      {/* TABLE CONTAINER */}
      <div className="overflow-x-auto rounded-lg border border-gray-700 mb-8">
        <table className="min-w-full table-auto">
          <thead className="sticky top-0 bg-gray-800">
            <tr>
              {["Humains", "Créatures", "Mystique"].map((label) => (
                <th
                  key={label}
                  className="px-4 py-3 text-center font-semibold border-b border-gray-700"
                >
                  Armée des {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data["Armée des humains"].map((rank, i) => (
              <tr
                key={i}
                className={`
                  ${selectedRank === i ? "bg-gray-800" : "hover:bg-gray-800"}
                  transition-colors cursor-pointer
                `}
              >
                {["Humains", "Créatures", "Mystique"].map((type) => {
                  const arrKey = typeMapping[type];
                  return (
                    <td
                      key={type}
                      onClick={() => handleClick(i, type)}
                      className="px-4 py-3 border border-gray-700 text-center"
                    >
                      {data[arrKey]?.[i] || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedRank !== null && selectedType && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRank(null)}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full border-2 border-yellow-500 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedRank(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                ✖
              </button>
              <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4">
                {data[typeMapping[selectedType]]?.[selectedRank] || "Inconnu"}
              </h2>
              <p className="text-gray-300 mb-4 text-center">
                📜{" "}
                {
                  data[`Description (${selectedType})`]?.[selectedRank] ||
                  "Pas de description."
                }
              </p>
              <p className="text-center text-lg font-semibold text-yellow-400">
                ⏳ Année : {data["Année"]?.[selectedRank] || "Inconnue"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
