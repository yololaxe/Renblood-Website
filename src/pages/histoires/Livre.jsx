// src/pages/Livre.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import livre1Img from "../../../public/livres/livre1.png";
import livre2Img from "../../../public/livres/livre2.png";

export default function Livre() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const livres = [
    {
      id: 1,
      titre: "Chroniques de Renblood",
      description: "L'Information du Royaume de Renblood (0 - 321)",
      image: livre1Img,
    },
    {
      id: 2,
      titre: "Voies de la Connaissance",
      description: "Mythes et récits des premiers peuples",
      image: livre2Img,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-12 text-gray-200">
      {/* Page title */}
      <header className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-400">
          📚 Bibliothèque de Renblood
        </h1>
        <p className="mt-4 text-lg">
          Parcourez nos ouvrages et plongez dans l’histoire du royaume.
        </p>
      </header>

      {/* Livre selection */}
      <section className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
        {livres.map((livre) => (
          <motion.div
            key={livre.id}
            onClick={() => setSelected(livre.id)}
            className={`cursor-pointer rounded-2xl overflow-hidden shadow-xl transition-transform ${
              selected === livre.id
                ? "ring-4 ring-green-400 scale-105"
                : "hover:scale-105"
            }`}
            whileHover={{ scale: selected === livre.id ? 1.05 : 1.03 }}
          >
            <div className="relative">
              <img
                src={livre.image}
                alt={livre.titre}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
                <h2 className="text-2xl font-bold text-white">
                  {livre.titre}
                </h2>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Details panel */}
      {selected && (
        <motion.section
          className="max-w-2xl mx-auto mt-12 bg-gray-800 rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {(() => {
            const book = livres.find((l) => l.id === selected);
            return (
              <>
                <h3 className="text-3xl font-extrabold text-white mb-4">
                  {book.titre}
                </h3>
                <p className="text-gray-300 mb-6">{book.description}</p>
                <motion.button
                  onClick={() =>
                    navigate(`/histoires/livres/${book.id}/chapitre/1`)
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-semibold shadow-lg transition"
                >
                  📖 Ouvrir Chapitre 1
                </motion.button>
              </>
            );
          })()}
        </motion.section>
      )}
    </div>
  );
}
