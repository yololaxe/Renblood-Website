// src/pages/Map.jsx
import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import comtes from "../data/comtes";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearchPlus, FaSearchMinus, FaCompress, FaMapMarkedAlt, FaSearch, FaLocationArrow, FaQuestionCircle } from "react-icons/fa";

const ORIGINAL_WIDTH = 1154;
const ORIGINAL_HEIGHT = 1608;
const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

function Map() {
  const [selectedVille, setSelectedVille] = useState(null);
  const [isMinecraft, setIsMinecraft] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef({ pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const cities = useMemo(
    () => Object.entries(comtes).flatMap(([county, countyCities]) =>
      countyCities.map(city => ({ ...city, county }))
    ),
    []
  );

  const clampScale = (value) => Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);

  const zoomAtPoint = useCallback((nextScale, point = { x: 0, y: 0 }) => {
    setScale(currentScale => {
      const clampedScale = clampScale(nextScale);
      setPosition(currentPosition => ({
        x: point.x - ((point.x - currentPosition.x) * clampedScale) / currentScale,
        y: point.y - ((point.y - currentPosition.y) * clampedScale) / currentScale,
      }));
      return clampedScale;
    });
  }, []);

  const handleZoom = (factor) => zoomAtPoint(scale * factor);

  const handleWheel = (event) => {
    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAtPoint(scale * (event.deltaY < 0 ? 1.15 : 1 / 1.15), {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    });
  };

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
    setPosition({
      x: dragRef.current.originX + event.clientX - dragRef.current.startX,
      y: dragRef.current.originY + event.clientY - dragRef.current.startY,
    });
  };

  const handlePointerUp = (event) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    setIsDragging(false);
    dragRef.current.pointerId = null;
  };

  const fitMapToScreen = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setScale(clampScale(Math.min(rect.width / ORIGINAL_WIDTH, rect.height / ORIGINAL_HEIGHT) * 0.92));
    setPosition({ x: 0, y: 0 });
  }, []);

  const focusCity = (city) => {
    if (!city.Coords) return;
    const nextScale = Math.max(scale, 1.2);
    setScale(nextScale);
    setPosition({
      x: -(city.Coords[0] - ORIGINAL_WIDTH / 2) * nextScale,
      y: -(city.Coords[1] - ORIGINAL_HEIGHT / 2) * nextScale,
    });
    setSearchQuery("");
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("fr");
    if (!query) return [];
    return cities
      .filter(city => `${city.ville} ${city.county} ${city.type}`.toLocaleLowerCase("fr").includes(query))
      .slice(0, 8);
  }, [cities, searchQuery]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement) {
        if (e.key === "Escape") setSearchQuery("");
        return;
      }
      if (e.key.toLowerCase() === "m") {
        setIsMinecraft((prev) => !prev);
      } else if (e.key === "+" || e.key === "=") {
        handleZoom(1.2);
      } else if (e.key === "-") {
        handleZoom(1 / 1.2);
      } else if (e.key === "0") {
        fitMapToScreen();
      } else if (e.key === "Escape") {
        setSelectedVille(null);
        setShowHelp(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fitMapToScreen, scale]);

  useEffect(() => {
    if (!imageLoaded) return;
    fitMapToScreen();
    window.addEventListener("resize", fitMapToScreen);
    return () => window.removeEventListener("resize", fitMapToScreen);
  }, [fitMapToScreen, imageLoaded]);

  const mapSrc = isMinecraft ? "/map/carte-minecraft.png" : "/map/carte-renblood.png";

  // Légende
  const cityTypes = useMemo(() => {
    const all = cities.map((v) => v.type);
    return Array.from(new Set(all));
  }, [cities]);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex flex-col">
      
      {/* --- HEADER FLOTTANT --- */}
      <div className="absolute top-20 left-1/2 z-30 w-[min(42rem,calc(100%-2rem))] -translate-x-1/2 pointer-events-none">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center gap-3 rounded-2xl border border-gray-700 bg-gray-900/80 px-4 py-2 shadow-xl backdrop-blur-md pointer-events-auto sm:gap-4 sm:rounded-full sm:px-6"
        >
          <h1 className="flex items-center gap-2 font-bold text-white sm:text-xl">
            <FaMapMarkedAlt className="text-yellow-500" /> Carte du Royaume
          </h1>
          <div className="hidden h-6 w-px bg-gray-600 sm:block" />
          <label className="flex cursor-pointer items-center space-x-2 text-xs text-gray-300 transition hover:text-white sm:text-sm">
            <input
              type="checkbox"
              checked={isMinecraft}
              onChange={(e) => setIsMinecraft(e.target.checked)}
              className="form-checkbox h-4 w-4 text-yellow-500 rounded border-gray-600 bg-gray-700 focus:ring-yellow-500"
            />
            <span className="hidden sm:inline">Mode Minecraft (M)</span>
            <span className="sm:hidden">Minecraft</span>
          </label>
        </motion.div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-2">
        <button title="Zoomer (+)" onClick={() => handleZoom(1.2)} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white transition">
          <FaSearchPlus />
        </button>
        <button title="Ajuster à l'écran (0)" onClick={fitMapToScreen} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white transition">
          <FaCompress />
        </button>
        <button title="Dézoomer (-)" onClick={() => handleZoom(1 / 1.2)} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white transition">
          <FaSearchMinus />
        </button>
        <button title="Afficher l'aide" onClick={() => setShowHelp(current => !current)} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white transition">
          <FaQuestionCircle />
        </button>
      </div>

      {/* --- RECHERCHE --- */}
      <div className="absolute top-36 left-1/2 z-30 w-[min(24rem,calc(100%-2rem))] -translate-x-1/2">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Chercher une ville, un comté..."
            className="w-full rounded-full border border-gray-600 bg-gray-900/90 py-3 pl-11 pr-4 text-sm text-white shadow-xl backdrop-blur-md outline-none focus:border-yellow-500"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-xl border border-gray-700 bg-gray-900/95 shadow-2xl backdrop-blur-md">
            {searchResults.map(city => (
              <button
                key={`${city.county}-${city.ville}`}
                onClick={() => focusCity(city)}
                className="flex w-full items-center justify-between border-b border-gray-800 px-4 py-3 text-left last:border-0 hover:bg-gray-800"
              >
                <span>
                  <span className="block font-semibold text-white">{city.ville}</span>
                  <span className="block text-xs text-gray-400">{city.county} · {city.type}</span>
                </span>
                <FaLocationArrow className="text-yellow-500" />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-8 right-24 z-30 rounded-xl border border-gray-700 bg-gray-900/95 p-4 text-xs text-gray-300 shadow-2xl backdrop-blur-md"
          >
            <p className="mb-2 font-bold text-white">Navigation</p>
            <p>Glisser : déplacer la carte</p>
            <p>Molette : zoomer sous le curseur</p>
            <p><kbd>+</kbd> / <kbd>-</kbd> : zoomer / dézoomer</p>
            <p><kbd>0</kbd> : ajuster à l'écran</p>
            <p><kbd>M</kbd> : mode Minecraft</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LEGENDE --- */}
      <div className="absolute left-8 bottom-8 z-30 hidden max-w-xs rounded-xl border border-gray-700 bg-gray-900/90 p-4 shadow-2xl backdrop-blur-md lg:block">
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
        className={`w-full h-full flex items-center justify-center bg-[#1a1d24] select-none touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
            onLoad={() => {
              setImageLoaded(true);
              fitMapToScreen();
            }}
            draggable={false}
          />

          {/* MARKERS */}
          {imageLoaded && cities.map((ville) => {
            if (!ville.Coords) return null;
            // Position relative sur l'image originale
            const left = ville.Coords[0];
            const top = ville.Coords[1];
            const icon = `/kit/${ville.type.toLowerCase().replace(/ /g, "-")}.png`;

            return (
              <motion.div
                key={`${ville.county}-${ville.ville}`}
                className="absolute cursor-pointer group transform -translate-x-1/2 -translate-y-1/2"
                style={{ left, top }}
                onPointerDown={(e) => e.stopPropagation()}
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
