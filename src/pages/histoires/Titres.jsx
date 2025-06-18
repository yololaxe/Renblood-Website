// src/pages/Titres.jsx
import React from "react";
import { motion } from "framer-motion";
import titresRoyaume from "../../data/Titre";

export default function Titres() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Titre animé en dégradé */}
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-center
                     bg-clip-text text-transparent
                     bg-gradient-to-r from-green-300 to-blue-400"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          🏅 Titres du Royaume
        </motion.h1>

        {/* Descriptif */}
        <motion.p
          className="text-center text-gray-300 text-lg max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Découvrez les différents titres sociaux et leurs conditions d'accès dans le royaume.
        </motion.p>

        {/* Tableau responsif */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                  Titre
                </th>
                <th className="w-1/2 px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                  Description
                </th>
                <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                  Conditions
                </th>
              </tr>
            </thead>
            <tbody>
              {titresRoyaume.map((item, idx) => (
                <motion.tr
                  key={idx}
                  className={`border-b border-gray-700 transition-colors
                             hover:bg-gray-700 ${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-800"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <td className="px-6 py-4 font-medium">{item.titre}</td>
                  <td className="px-6 py-4 text-gray-200">{item.description}</td>
                  <td className="px-6 py-4">{item.requis}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
