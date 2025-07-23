// src/pages/Map.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import comtes from "../data/comtes";
import { motion, AnimatePresence } from "framer-motion";
import "tailwindcss/tailwind.css";

function Map() {
  const [selectedVille, setSelectedVille] = useState(null);
  const [isMinecraft, setIsMinecraft] = useState(false);
  const mapRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 1154, height: 1608 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageWidth = 1154;
  const imageHeight = 1608;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() === "m") {
        setIsMinecraft((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const updateSize = () => {
    if (mapRef.current) {
      setMapSize({
        width: mapRef.current.clientWidth,
        height: mapRef.current.clientHeight,
      });
    }
  };
  useEffect(() => {
    window.addEventListener("resize", updateSize);
    if (imageLoaded) updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [imageLoaded]);

  const handleClick = (ville) => setSelectedVille(ville);

  const renderConseil = (conseil) => {
    if (!conseil) return null;
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-center border-b border-gray-600 pb-1 mb-2">
          🧩 Conseil municipal
        </h3>
        <ul className="text-sm text-gray-300 space-y-1">
          {Object.entries(conseil).map(([role, value], i) => (
            <li key={i}>
              <strong>{role} :</strong>{" "}
              {Array.isArray(value)
                ? value.filter((v) => v).join(", ") || "-"
                : value || "-"}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const mapSrc = isMinecraft
    ? "/map/carte-minecraft.png"
    : "/map/carte-renblood.png";

  // légende des types de villes
  const cityTypes = useMemo(() => {
    const all = Object.values(comtes).flat().map((v) => v.type);
    return Array.from(new Set(all));
  }, []);

  return (
    <div className="relative flex items-center justify-center bg-gray-900 min-h-screen overflow-hidden">
      {/* Toggle “Mode Minecraft” */}
      <motion.div
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 backdrop-blur-sm p-3 rounded-lg shadow-lg z-20"
      >
        <label className="flex items-center space-x-2 text-white">
          <input
            type="checkbox"
            checked={isMinecraft}
            onChange={(e) => setIsMinecraft(e.target.checked)}
            className="w-5 h-5"
          />
          <span>
            Mode Minecraft <kbd className="px-1 bg-gray-700 rounded">M</kbd>
          </span>
        </label>
      </motion.div>

      {/* Légende agrandie, sans animation */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-60 backdrop-blur-sm p-4 rounded-lg shadow-lg z-20 w-60">
        <h3 className="text-white font-semibold text-lg mb-3 text-center">Légende</h3>
        <ul className="space-y-3">
          {cityTypes.map((type) => {
            const iconSrc = `/kit/${type
              .toLowerCase()
              .replace(/ /g, "-")}.png`;
            return (
              <li key={type} className="flex items-center text-white text-base">
                <img
                  src={iconSrc}
                  alt={type}
                  className="w-8 h-8 mr-3 flex-shrink-0"
                />
                <span>{type}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="map-container relative mx-auto w-full max-w-5xl px-4">
        <img
          ref={mapRef}
          src={mapSrc}
          alt="Carte de Renblood"
          className="w-full"
          loading="lazy"
          onLoad={() => {
            setImageLoaded(true);
            updateSize();
          }}
        />

        {imageLoaded &&
          Object.values(comtes).flat().map((ville, idx) => {
            if (!ville.Coords) return null;
            const x = (ville.Coords[0] / imageWidth) * mapSize.width;
            const y = (ville.Coords[1] / imageHeight) * mapSize.height;
            const icon = `/kit/${ville.type
              .toLowerCase()
              .replace(/ /g, "-")}.png`;
            return (
              <motion.div
                key={idx}
                className="absolute cursor-pointer group"
                style={{ left: x, top: y }}
                onClick={() => handleClick(ville)}
              >
                <img
                  src={icon}
                  alt={ville.type}
                  loading="lazy"
                  className="city-icon w-[5vw] max-w-[40px] h-auto transition-transform hover:scale-125"
                />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-white text-xs sm:text-sm bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {ville.ville}
                </div>
              </motion.div>
            );
          })}
      </div>

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
              <h2 className="text-xl sm:text-2xl font-bold text-center">
                {selectedVille.ville}
              </h2>
              <p className="mt-2 text-gray-300">
                🏰 <strong>Type :</strong> {selectedVille.type}
              </p>
              <p className="mt-1 text-gray-300">
                ⚔️ <strong>Chef :</strong> {selectedVille.chef || "Non défini"}
              </p>
              <p className="mt-1 text-gray-300">
                🌍 <strong>Environnement :</strong> {selectedVille.environnement}
              </p>
              <p className="mt-1 text-gray-300">
                📊 <strong>Habitants :</strong> {selectedVille.habitant}
              </p>
              <p className="mt-1 text-gray-300">
                🛡️ <strong>Soldats :</strong> {selectedVille.soldat}
              </p>
              {selectedVille.guilde && (
                <p className="mt-1 text-gray-300">
                  🏛️ <strong>Guilde :</strong> {selectedVille.guilde}
                </p>
              )}
              <p className="mt-1 text-gray-300">
                🤝 <strong>Intercommunalité :</strong> {selectedVille.intercomunalite}
              </p>
              <p className="mt-1 text-gray-300">
                ⭐ <strong>Caractéristique :</strong> {selectedVille.caracteristique}
              </p>
              {renderConseil(selectedVille.conseil)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Map;
