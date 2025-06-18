// src/pages/Guildes.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import guildesData from "../../data/guildes";

export default function Guildes() {
  const [selectedGuild, setSelectedGuild] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-400">
          🛡️ Les Guildes de Renblood
        </h1>

        {/* Guild Cards Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`}>
          {guildesData.map((g) => (
            <motion.div
              key={g.id}
              layout
              whileHover={{ scale: 1.03 }}
              onClick={() => setSelectedGuild(g)}
              className="relative bg-gray-800 rounded-xl shadow-lg cursor-pointer overflow-hidden flex flex-col items-center p-6 transition-transform"
            >
              <img
                src={`/guildes/${g.image}`}
                alt={g.name}
                className="w-32 h-32 object-cover rounded-lg mb-4"
              />
              <h2 className="text-2xl font-semibold">{g.name}</h2>
            </motion.div>
          ))}
        </div>

        {/* Backdrop + Modal */}
        <AnimatePresence>
          {selectedGuild && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-6 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGuild(null)}
            >
              <motion.div
                className="bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full p-8 relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedGuild(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl"
                >
                  ✖
                </button>

                <h2 className="text-3xl font-bold text-center mb-4">
                  {selectedGuild.name}
                </h2>

                <div className="flex justify-center mb-6">
                  <img
                    src={`/guildes/${selectedGuild.image}`}
                    alt={selectedGuild.name}
                    className="w-40 h-40 object-cover rounded-lg shadow-lg"
                  />
                </div>

                <p className="text-gray-300 mb-6 whitespace-pre-line">
                  {selectedGuild.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-left text-lg">
                  <div>
                    <strong>📍 Lieu :</strong> {selectedGuild.location}
                  </div>
                  <div>
                    <strong>💰 Fortune :</strong> {selectedGuild.fortune} Gold
                  </div>
                  <div>
                    <strong>⭐ Réputation :</strong> {selectedGuild.reputation}
                  </div>
                  <div>
                    <strong>👥 Membres :</strong> {selectedGuild.members}
                  </div>
                  <div>
                    <strong>🏛️ Bâtiments :</strong> {selectedGuild.buildings}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Roles Section */}
        <section className="mt-12 bg-gray-800 rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-6">
            🌍 Rôles et responsabilités
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guildesData.globalRoles.map((role, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-700 rounded-lg p-6"
              >
                <h4 className="text-xl font-semibold mb-2">{role.role}</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {role.actions.map((act, j) => (
                    <li key={j}>{act}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
