import React, { useEffect, useState, useRef } from "react";
import comtes from "../data/comtes";
import { motion, AnimatePresence } from "framer-motion";
import "tailwindcss/tailwind.css";

function Map() {
  const [selectedVille, setSelectedVille] = useState(null);
  const mapRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 1154, height: 1608 });
  const [imageLoaded, setImageLoaded] = useState(false); // Ajout d'un état pour savoir si l'image est chargée

  const imageWidth = 1154; // Largeur originale de la carte
  const imageHeight = 1608; // Hauteur originale de la carte

  // Fonction pour mettre à jour la taille de la carte
  const updateSize = () => {
    if (mapRef.current) {
      setMapSize({
        width: mapRef.current.clientWidth,
        height: mapRef.current.clientHeight,
      });
    }
  };

  // Mise à jour des dimensions de la carte après chargement de l'image
  useEffect(() => {
    window.addEventListener("resize", updateSize);
    if (imageLoaded) updateSize(); // Mise à jour dès que l'image est chargée

    return () => window.removeEventListener("resize", updateSize);
  }, [imageLoaded]); // Exécuter l'effet uniquement après le chargement

  const handleClick = (ville) => {
    setSelectedVille(ville);
  };

  return (
    <div className="relative flex items-center justify-center bg-gray-900 min-h-screen overflow-hidden">
      {/* Conteneur de la carte */}
      <div className="map-container relative mx-auto w-full max-w-5xl px-4">
        <img
          ref={mapRef}
          src="/map/carte-renblood.png"
          alt="Carte de Renblood"
          className="w-full"
          onLoad={() => {
            setImageLoaded(true); // Indique que l'image est chargée
            updateSize(); // Met à jour les dimensions
          }}
        />

        {/* Placement des villes sur la carte */}
        {imageLoaded && // S'assurer que l'image est bien chargée avant de placer les villes
          Object.values(comtes).flat().map((ville, index) => {
            if (!ville.Coords) return null;

            const adjustedX = ((ville.Coords[0] / imageWidth) * mapSize.width) || 0;
            const adjustedY = ((ville.Coords[1] / imageHeight) * mapSize.height) || 0;

            const getIconPath = (type) => {
              const typeLower = type.toLowerCase().replace(/ /g, "-");
              return `/kit/${typeLower}.png`;
            };

            return (
              <motion.div
                key={index}
                className="absolute cursor-pointer group"
                style={{
                  left: `${adjustedX}px`,
                  top: `${adjustedY}px`,
                }}
                onClick={() => handleClick(ville)}
              >
                <img
                  src={getIconPath(ville.type)}
                  alt={ville.type}
                  className="city-icon w-[5vw] max-w-[40px] h-auto transition-transform hover:scale-125"
                />
                
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-white text-xs sm:text-sm bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {ville.ville}
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Fenêtre d'information sur la ville */}
      <AnimatePresence>
        {selectedVille && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
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
              <h2 className="text-xl sm:text-2xl font-bold text-center">{selectedVille.ville}</h2>
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
