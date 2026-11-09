// src/pages/dice/DicePage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { getPlayers, getPlayerData } from "../../services/api";
import { FaDiceD20, FaDiceD6, FaPercentage, FaUser, FaCog, FaHistory, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

// Génère les particules “pluie de dés”
function generateDiceRain(result) {
  let count = 0,
      emoji = "🎲";

  if (result === 20) {
    count = 30 + Math.floor(Math.random() * 10);
    emoji = "🔥";
  } else if (result === 1) {
    count = 1;
  } else {
    count = Math.floor(5 + result * 1.5);
  }

  return Array.from({ length: count }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    left: Math.random() * 100,
    size: 30 + Math.random() * 30,
    delay: Math.random() * 0.5,
    emoji
  }));
}

export default function DicePage() {
  const { userRank } = useUser();
  const isAdmin = userRank === "Admin";

  // — admin : liste de joueurs & sélection
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [selectedAttr, setSelectedAttr] = useState(null);

  // — dé : min / max
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(20);

  // — animation / résultat
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [rain, setRain] = useState([]);
  const [history, setHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  const wsRef    = useRef(null);
  const audioRef = useRef(null);

  const attrs = [
    { key: "dodge",       label: "Esquive" },
    { key: "discretion",  label: "Discrétion" },
    { key: "charisma",    label: "Charisme" },
    { key: "rethoric",    label: "Rhétorique" },
    { key: "negotiation", label: "Négociation" },
    { key: "influence",   label: "Influence" }
  ];

  // — Admin : charge la liste
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const list = await getPlayers("Admin");
      setPlayers(Array.isArray(list) ? list : []);
    })();
  }, [isAdmin]);

  // — Admin : charge le choix
  useEffect(() => {
    if (!selectedPlayer) {
      setSelectedPlayerData(null);
      return;
    }
    (async () => {
      const data = await getPlayerData(selectedPlayer.id);
      setSelectedPlayerData(data);
      setSelectedAttr(null);
    })();
  }, [selectedPlayer]);

  // — playRoll : animation + son
  const playRoll = useCallback((rollValue) => {
    setRolling(true);
    if (!isMuted) audioRef.current?.play();
    setRain(generateDiceRain(rollValue));
    
    setTimeout(() => {
      setRolling(false);
      setResult(rollValue);
      setHistory(prev => [{ value: rollValue, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
      setRain([]);
    }, 1000);
  }, [isMuted]);

  // — WebSocket Channels (utilise VITE_WS_URL)
  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/dice/`);
    wsRef.current = ws;

    ws.onopen = () => console.log("🟢 WebSocket connecté !");
    ws.onclose = () => console.log("🔴 WebSocket déconnecté.");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "dice_result") {
          playRoll(data.value);
        }
      } catch {
        console.error("Message WS invalide :", event.data);
      }
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [playRoll]);

  // — calcule le modificateur courant
  const currentMod =
    isAdmin && selectedPlayerData && selectedAttr
      ? (selectedPlayerData[selectedAttr] || 0)
      : 0;

  // — Lance le dé
  const handleRoll = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "roll",
          min: minValue,
          max: maxValue,
          mod: currentMod
        })
      );
      return;
    }

    const baseRoll = Math.floor(
      Math.random() * (maxValue - minValue + 1)
    ) + minValue;
    const totalRoll = baseRoll + currentMod;
    playRoll(totalRoll);
  };

  // — presets min/max
  const applyPreset = (preset) => {
    if (preset === "percent") {
      setMinValue(1); setMaxValue(100);
    } else if (preset === "d20") {
      setMinValue(1); setMaxValue(20);
    } else if (preset === "d6") {
      setMinValue(1); setMaxValue(6);
    }
  };

  return (
    <div className={`min-h-[calc(100svh-4rem)] w-full bg-[#11110f] overflow-x-hidden overflow-y-auto flex ${isAdmin ? "flex-col md:h-[calc(100svh-4rem)] md:flex-row md:overflow-hidden" : "flex-col justify-center"}`}>
      
      {/* --- PANNEAU GAUCHE (ADMIN: JOUEURS) --- */}
      {isAdmin && (
        <aside className="max-h-48 w-full overflow-y-auto border-b border-stone-700 bg-[#11110f]/90 p-4 shadow-none backdrop-blur-md z-20 md:max-h-none md:w-72 md:overflow-visible md:border-b-0 md:border-r md:p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FaUser className="text-amber-300" /> Joueurs
          </h2>
          
          {!selectedPlayer ? (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {players.map((p) => (
                <button
                  key={p.id}
                  className="w-full text-left px-4 py-3 bg-[#1b1b17] hover:bg-stone-800 rounded-lg text-stone-200 transition border border-stone-700 hover:border-amber-600"
                  onClick={() => setSelectedPlayer(p)}
                >
                  {p.pseudo_minecraft}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <button
                className="text-sm text-stone-400 hover:text-white mb-4 flex items-center gap-1"
                onClick={() => {
                  setSelectedPlayer(null);
                  setSelectedPlayerData(null);
                }}
              >
                ← Retour liste
              </button>
              <div className="bg-[#1b1b17] p-4 rounded-sm border border-stone-600 mb-6 text-center">
                <h3 className="text-lg font-bold text-white">{selectedPlayer.pseudo_minecraft}</h3>
                <p className="text-xs text-stone-400">{selectedPlayer.rank}</p>
              </div>
              
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {attrs.map((a) => (
                  <button
                    key={a.key}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition border ${
                      selectedAttr === a.key
                        ? "bg-amber-800 text-white border-blue-400 shadow-none"
                        : "bg-[#1b1b17] text-stone-300 border-stone-700 hover:bg-stone-800"
                    }`}
                    onClick={() => setSelectedAttr(a.key)}
                  >
                    <span>{a.label}</span>
                    <span className="font-mono font-bold bg-black/30 px-2 rounded">
                      {selectedPlayerData ? selectedPlayerData[a.key] ?? 0 : "-"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* --- ZONE CENTRALE (TAPIS DE JEU) --- */}
      <main className="relative flex min-h-[65vh] flex-1 flex-col justify-center perspective-1000 md:min-h-0">
        {/* Overlay sombre pour lisibilité */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Titre */}
        <h1 className="z-10 mb-8 px-4 text-center text-4xl font-black tracking-wider text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] sm:text-5xl md:mb-12 md:text-7xl editorial-title" style={{ fontFamily: "'Cinzel', serif" }}>
          Lancer de Dé
        </h1>

        {/* Zone de résultat (Dé 3D simulé) */}
        <div className="relative mb-8 flex h-48 w-48 items-center justify-center z-10 sm:mb-12 sm:h-56 sm:w-56 md:h-64 md:w-64">
          <AnimatePresence mode="wait">
            {rolling ? (
              <motion.div
                key="rolling"
                animate={{ rotateX: [0, 360, 720], rotateY: [0, 360, 720], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="text-9xl"
              >
                🎲
              </motion.div>
            ) : result !== null ? (
              <motion.div
                key="result"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative"
              >
                {/* Dé SVG stylisé */}
                <div className={`w-48 h-48 rounded-3xl flex items-center justify-center shadow-none border-4 ${
                  result === maxValue ? "bg-green-600 border-green-400" : 
                  result === minValue ? "bg-red-600 border-red-400" : 
                  "bg-[#1b1b17] border-stone-600"
                }`}>
                  <span className="text-8xl font-bold text-white drop-shadow-md">{result}</span>
                </div>
                
                {/* Badge Modificateur */}
                {currentMod !== 0 && (
                  <div className="absolute -top-4 -right-4 bg-amber-800 text-white px-3 py-1 rounded-full font-bold shadow-none border-2 border-blue-400">
                    {currentMod > 0 ? "+" : ""}{currentMod}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-white/20 text-8xl">
                <FaDiceD20 />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Bouton Lancer (Admin Only) */}
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRoll}
            disabled={rolling}
            className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-xl font-bold text-white sm:px-12 sm:text-2xl shadow-[0_0_20px_rgba(99,102,241,0.6)] border-2 border-indigo-400 z-10 hover:shadow-[0_0_40px_rgba(99,102,241,0.8)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rolling ? "..." : "LANCER"}
          </motion.button>
        )}

        {/* Pluie de dés */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {rain.map(({ id, left, size, delay, emoji }) => (
            <motion.div
              key={id}
              initial={{ y: -100, rotate: 0 }}
              animate={{ y: "120vh", rotate: 360 }}
              transition={{ duration: 2, delay, ease: "linear" }}
              style={{ position: "absolute", left: `${left}%`, fontSize: `${size}px` }}
              className="opacity-70"
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/* Contrôle Son */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-6 right-6 z-20 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition backdrop-blur-sm"
        >
          {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>

        <audio ref={audioRef} src="/dice-roll.mp3" preload="auto" />
      </main>

      {/* --- PANNEAU DROITE (ADMIN: CONFIG & HISTORIQUE) --- */}
      {isAdmin && (
        <aside className="h-96 w-full overflow-y-auto border-t border-stone-700 bg-[#11110f]/90 p-4 shadow-none backdrop-blur-md z-20 md:h-auto md:w-80 md:overflow-visible md:border-l md:border-t-0 md:p-6">
          
          {/* Config */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCog className="text-amber-300" /> Configuration
            </h2>
            
            {/* Presets */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button onClick={() => applyPreset("percent")} className="flex flex-col justify-center p-2 bg-[#1b1b17] hover:bg-stone-800 rounded-lg border border-stone-600 transition">
                <FaPercentage className="text-green-400 mb-1" />
                <span className="text-xs text-stone-300">1-100</span>
              </button>
              <button onClick={() => applyPreset("d20")} className="flex flex-col justify-center p-2 bg-[#1b1b17] hover:bg-stone-800 rounded-lg border border-stone-600 transition">
                <FaDiceD20 className="text-purple-400 mb-1" />
                <span className="text-xs text-stone-300">D20</span>
              </button>
              <button onClick={() => applyPreset("d6")} className="flex flex-col justify-center p-2 bg-[#1b1b17] hover:bg-stone-800 rounded-lg border border-stone-600 transition">
                <FaDiceD6 className="text-red-400 mb-1" />
                <span className="text-xs text-stone-300">D6</span>
              </button>
            </div>

            {/* Sliders Min/Max */}
            <div className="space-y-4 bg-[#1b1b17] p-4 rounded-sm border border-stone-700">
              <div>
                <div className="flex justify-between text-sm text-stone-400 mb-1">
                  <span>Min</span>
                  <span className="text-white font-bold">{minValue}</span>
                </div>
                <input 
                  type="range" min="1" max="100" value={minValue} 
                  onChange={(e) => setMinValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-stone-400 mb-1">
                  <span>Max</span>
                  <span className="text-white font-bold">{maxValue}</span>
                </div>
                <input 
                  type="range" min="1" max="100" value={maxValue} 
                  onChange={(e) => setMaxValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Historique */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaHistory className="text-stone-400" /> Historique
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <p className="text-stone-500 text-sm italic text-center mt-4">Aucun lancer récent.</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#1b1b17] p-3 rounded-lg border border-stone-700">
                    <span className="text-xs text-stone-500">{h.time}</span>
                    <span className="text-lg font-bold text-white">{h.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </aside>
      )}
    </div>
  );
}
