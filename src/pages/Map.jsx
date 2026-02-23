// src/pages/Map.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import comtes from "../data/comtes";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearchPlus, FaSearchMinus, FaCompress, FaMapMarkedAlt } from "react-icons/fa";

function Map() {
  const [selectedVille, setSelectedVille] = useState(null);
  const [isMinecraft, setIsMinecraft] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Dimensions originales de l'image
  const ORIGINAL_WIDTH = 1154;
  const ORIGINAL_HEIGHT = 1608;

  // Gestion du Zoom
  const handleZoom = (delta) => {
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 4));
  };

  // Gestion du Pan (Drag)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Toggle Mode Minecraft
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() === "m") {
        setIsMinecraft((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const mapSrc = isMinecraft ? "/map/carte-minecraft.png" : "/map/carte-renblood.png";

  // Légende
  const cityTypes = useMemo(() => {
    const all = Object.values(comtes).flat().map((v) => v.type);
    return Array.from(new Set(all));
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex flex-col">
      
      {/* --- HEADER FLOTTANT --- */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-gray-700 shadow-xl flex items-center gap-4 pointer-events-auto"
        >
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FaMapMarkedAlt className="text-yellow-500" /> Carte du Royaume
          </h1>
          <div className="h-6 w-px bg-gray-600" />
          <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer hover:text-white transition">
            <input
              type="checkbox"
              checked={isMinecraft}
              onChange={(e) => setIsMinecraft(e.target.checked)}
              className="form-checkbox h-4 w-4 text-yellow-500 rounded border-gray-600 bg-gray-700 focus:ring-yellow-500"
            />
            <span>Mode Minecraft (M)</span>
          </label>
        </motion.div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-2">
        <button onClick={() => handleZoom(0.2)} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white transition">
          <FaSearchPlus />
        </button>
        <button onClick={handleReset} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white transition">
          <FaCompress />
        </button>
        <button onClick={() => handleZoom(-0.2)} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white transition">
          <FaSearchMinus />
        </button>
      </div>

      {/* --- LEGENDE --- */}
      <div className="absolute left-8 bottom-8 z-30 bg-gray-900/90 backdrop-blur-md p-4 rounded-xl border border-gray-700 shadow-2xl max-w-xs">
        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider border-b border-gray-700 pb-2">Légende</h3>
        <ul className="space-y-2">
          {cityTypes.map((type) => (
            <li key={type} className="flex items-center text-gray-300 text-xs">
              <img
                src={`/kit/${type.toLowerCase().replace(/ /g, "-")}.png`}
                alt={type}
                className="w-6 h-6 mr-3 object-contain"
              />
              <span>{type}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* --- MAP CONTAINER --- */}
      <div 
        ref={containerRef}
        className="w-full h-full cursor-move flex items-center justify-center bg-[#1a1d24]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div
          style={{
            x: position.x,
            y: position.y,
            scale: scale,
          }}
          className="relative origin-center"
        >
          <img
            ref={mapRef}
            src={mapSrc}
            alt="Carte"
            className="max-w-none shadow-2xl"
            onLoad={() => setImageLoaded(true)}
            draggable={false}
          />

          {/* MARKERS */}
          {imageLoaded && Object.values(comtes).flat().map((ville, idx) => {
            if (!ville.Coords) return null;
            // Position relative sur l'image originale
            const left = ville.Coords[0];
            const top = ville.Coords[1];
            const icon = `/kit/${ville.type.toLowerCase().replace(/ /g, "-")}.png`;

            return (
              <motion.div
                key={idx}
                className="absolute cursor-pointer group transform -translate-x-1/2 -translate-y-1/2"
                style={{ left, top }}
                onClick={(e) => { e.stopPropagation(); setSelectedVille(ville); }}
                whileHover={{ scale: 1.2 }}
              >
                <img
                  src={icon}
                  alt={ville.type}
                  className="w-10 h-10 drop-shadow-lg"
                  draggable={false}
                />
                {/* Tooltip au survol */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {ville.ville}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* --- MODALE DETAILS --- */}
      <AnimatePresence>
        {selectedVille && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedVille(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-600 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Header Modale */}
              <div className="relative h-32 bg-gray-700">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800" />
                <img 
                  src={`/kit/${selectedVille.type.toLowerCase().replace(/ /g, "-")}.png`} 
                  alt="Icon" 
                  className="absolute bottom-4 left-6 w-16 h-16 drop-shadow-xl z-10"
                />
                <button
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                  onClick={() => setSelectedVille(null)}
                >
                  ✖
                </button>
              </div>

              <div className="p-6 pt-2">
                <h2 className="text-3xl font-bold text-white mb-1">{selectedVille.ville}</h2>
                <span className="inline-block bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded mb-4 border border-yellow-500/30">
                  {selectedVille.type}
                </span>

                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-500">Dirigeant</span>
                    <span className="font-semibold text-white">{selectedVille.chef || "Aucun"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-500">Population</span>
                    <span className="font-semibold text-white">{selectedVille.habitant}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-500">Garnison</span>
                    <span className="font-semibold text-white">{selectedVille.soldat}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-500">Environnement</span>
                    <span className="font-semibold text-white">{selectedVille.environnement}</span>
                  </div>
                  {selectedVille.guilde && (
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                      <span className="text-gray-500">Guilde</span>
                      <span className="font-semibold text-purple-400">{selectedVille.guilde}</span>
                    </div>
                  )}
                </div>

                {selectedVille.conseil && (
                  <div className="mt-6 bg-gray-700/30 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Conseil Municipal</h3>
                    <ul className="space-y-2 text-sm">
                      {Object.entries(selectedVille.conseil).map(([role, value], i) => (
                        <li key={i} className="flex justify-between">
                          <span className="text-gray-500">{role}</span>
                          <span className="text-white font-medium text-right">
                            {Array.isArray(value) ? value.filter(v => v).join(", ") || "-" : value || "-"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Map;
