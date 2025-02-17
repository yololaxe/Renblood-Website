import React, { useEffect, useState, useRef } from "react";
import comtes from "../data/comtes"; // Assurez-vous du bon chemin
import { motion, AnimatePresence } from "framer-motion";
import "tailwindcss/tailwind.css";

function Map() {
  const [selectedVille, setSelectedVille] = useState(null);
  const mapRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 1154, height: 1608 });

  const imageWidth = 1154;  // Largeur originale de la carte
  const imageHeight = 1608; // Hauteur originale de la carte

  // Mise à jour des dimensions de la carte après le chargement
  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        setMapSize({
          width: mapRef.current.clientWidth,
          height: mapRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleClick = (ville) => {
    setSelectedVille(ville);
  };

  return (
    <div className="relative flex items-center justify-center bg-gray-900 min-h-screen overflow-hidden">
      {/* Conteneur de la carte */}
      <div className="map-container relative mx-auto">
        <img
          ref={mapRef}
          src="/map/carte-renblood.png"
          alt="Carte de Renblood"
          className="w-full max-w-5xl"
        />

        {/* Placement des villes sur la carte */}
        {Object.values(comtes).flat().map((ville, index) => {
          if (!ville.Coords) return null; // Sécurité pour éviter les erreurs

          const adjustedX = (ville.Coords[0] / imageWidth) * mapSize.width;
          const adjustedY = (ville.Coords[1] / imageHeight) * mapSize.height;

          return (
            <motion.div
              key={index}
              className="absolute w-4 h-4 bg-red-500 rounded-full cursor-pointer shadow-lg hover:scale-125 transition"
              style={{
                left: `${adjustedX}px`,
                top: `${adjustedY}px`,
              }}
              onClick={() => handleClick(ville)}
            >
              <span className="hidden md:block absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-gray-800 px-2 py-1 rounded">
                {ville.ville}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Fenêtre d'information sur la ville */}
      <AnimatePresence>
        {selectedVille && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setSelectedVille(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-md w-full relative border-2 border-yellow-500"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full"
                onClick={() => setSelectedVille(null)}
              >
                ✖
              </button>
              <h2 className="text-2xl font-bold text-center">{selectedVille.ville}</h2>
              <p className="mt-2 text-gray-300">🏰 <strong>Type :</strong> {selectedVille.type}</p>
              <p className="mt-1 text-gray-300">⚔️ <strong>Chef :</strong> {selectedVille.chef || "Non défini"}</p>
              <p className="mt-1 text-gray-300">🌍 <strong>Environnement :</strong> {selectedVille.environnement}</p>
              {selectedVille.guilde && <p className="mt-1 text-gray-300">🏛️ <strong>Guilde :</strong> {selectedVille.guilde}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Map;
