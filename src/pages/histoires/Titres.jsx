// src/pages/Titres.jsx
import React from "react";
import { motion } from "framer-motion";
import titresRoyaume from "../../data/Titre";
import { FaMedal, FaScroll, FaCheckCircle } from "react-icons/fa";

export default function Titres() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* Hero Header */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-16 px-4 mb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 mb-4 relative z-10"
        >
          Titres & Distinctions
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
          L'échelle sociale du royaume, des humbles serviteurs aux plus hauts dignitaires.
        </p>
      </div>

      {/* Liste des Titres */}
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {titresRoyaume.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:border-yellow-500/50 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center"
          >
            {/* Badge Titre */}
            <div className="flex-shrink-0 w-full md:w-48 bg-gray-900 rounded-lg p-4 text-center border border-gray-600">
              <FaMedal className="text-3xl text-yellow-500 mx-auto mb-2" />
              <h2 className="text-lg font-bold text-white">{item.titre}</h2>
            </div>

            {/* Contenu */}
            <div className="flex-grow space-y-3">
              <div className="flex items-start gap-3">
                <FaScroll className="text-gray-500 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
              </div>
              
              <div className="flex items-start gap-3 bg-green-900/10 p-3 rounded-lg border border-green-900/30">
                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-green-400 uppercase block mb-1">Conditions d'obtention</span>
                  <p className="text-gray-300 text-sm">{item.requis}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
