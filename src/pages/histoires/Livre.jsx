// src/pages/Livre.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBookOpen, FaArrowRight, FaTimes } from "react-icons/fa";

// Images (assurez-vous qu'elles sont dans public/livres/)
const livres = [
  {
    id: 1,
    titre: "Chroniques de Renblood",
    description: "L'Histoire du Royaume de Renblood (0 - 321). Découvrez les origines, les guerres fondatrices et l'ascension des premières familles.",
    image: "/livres/livre1.png",
    chapters: 5
  },
  {
    id: 2,
    titre: "Voies de la Connaissance",
    description: "Mythes, légendes et savoirs anciens. Une compilation des textes sacrés et des découvertes magiques.",
    image: "/livres/livre2.png",
    chapters: 3
  },
];

export default function Livre() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* Hero Header */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-16 px-4 mb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4 relative z-10"
        >
          Bibliothèque Royale
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
          Des siècles de savoir et d'histoires sont conservés ici. Choisissez un ouvrage pour commencer votre lecture.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {livres.map((livre) => (
          <motion.div
            key={livre.id}
            layoutId={`book-${livre.id}`}
            onClick={() => setSelected(livre)}
            whileHover={{ y: -10 }}
            className="group cursor-pointer bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-yellow-500/50 transition-all duration-300"
          >
            <div className="relative h-80 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10 opacity-80" />
              <img
                src={livre.image}
                alt={livre.titre}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg group-hover:text-yellow-400 transition-colors">
                  {livre.titre}
                </h2>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {livre.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Détails */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              layoutId={`book-${selected.id}`}
              className="bg-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-600 overflow-hidden relative flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition"
              >
                <FaTimes />
              </button>

              {/* Image Cover */}
              <div className="md:w-2/5 h-64 md:h-auto relative">
                <img
                  src={selected.image}
                  alt={selected.titre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-800 md:bg-gradient-to-l" />
              </div>

              {/* Content */}
              <div className="p-8 md:w-3/5 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-white mb-4">{selected.titre}</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {selected.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
                  <span className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                    <FaBookOpen className="text-yellow-500" /> {selected.chapters} Chapitres
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/histoires/livres/${selected.id}/chapitre/1`)}
                  className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  Commencer la lecture <FaArrowRight />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
