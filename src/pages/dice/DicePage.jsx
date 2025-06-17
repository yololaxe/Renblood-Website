// src/pages/DicePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { getPlayers, getPlayerData } from "../../services/api";

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
    id: i,
    left: Math.random() * 100,
    size: 30 + Math.random() * 30,
    delay: Math.random() * 0.5,
    emoji
  }));
}

export default function DicePage() {
  const { userRank } = useUser();
  const isAdmin = userRank === "Admin";

  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [selectedAttr, setSelectedAttr] = useState(null);

  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(20);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [rain, setRain] = useState([]);

  const socketRef = useRef(null);
  const audioRef = useRef(null);

  const attrs = [
    { key: "dodge", label: "Esquive" },
    { key: "discretion", label: "Discrétion" },
    { key: "charisma", label: "Charisme" },
    { key: "rethoric", label: "Rhétorique" },
    { key: "negotiation", label: "Négociation" },
    { key: "influence", label: "Influence" }
  ];

  // Load players list
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const list = await getPlayers("Admin");
      setPlayers(Array.isArray(list) ? list : []);
    })();
  }, [isAdmin]);

  // Load selected player's data
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

  // WebSocket for non-admin
  useEffect(() => {
    if (isAdmin) return;
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/dice/`);
    socketRef.current = ws;
    ws.onopen = () => console.log("WS connecté");
    ws.onmessage = e => {
      const { type, value } = JSON.parse(e.data);
      if (type === "dice_result") playRoll(value);
    };
    ws.onclose = () => console.log("WS fermé");
    return () => ws.readyState === WebSocket.OPEN && ws.close();
  }, [isAdmin]);

  const playRoll = rollValue => {
    setRolling(true);
    audioRef.current?.play();
    setRain(generateDiceRain(rollValue));
    setTimeout(() => {
      setRolling(false);
      setResult(rollValue);
      setRain([]);
    }, 1500);
  };

  const handleRoll = () => {
    let effectiveMin = minValue;
    if (isAdmin && selectedPlayerData && selectedAttr) {
      effectiveMin = 1 + (selectedPlayerData[selectedAttr] || 0);
    }
    const roll =
      Math.floor(Math.random() * (maxValue - effectiveMin + 1)) +
      effectiveMin;
    playRoll(roll);
  };

  const applyPreset = preset => {
    if (preset === "percent") {
      setMinValue(1);
      setMaxValue(100);
    } else if (preset === "d20") {
      setMinValue(1);
      setMaxValue(20);
    } else if (preset === "d6") {
      setMinValue(1);
      setMaxValue(6);
    }
  };

  // Compute current modifier if any
  const currentMod =
    isAdmin && selectedPlayerData && selectedAttr
      ? selectedPlayerData[selectedAttr] || 0
      : 0;

  return (
    <div className="grid h-screen grid-cols-[18rem_1fr_18rem] bg-gray-900 overflow-hidden">
      {/* Left panel: players */}
      {isAdmin && (
        <aside className="bg-gray-800 p-4 overflow-auto">
          <h2 className="text-xl font-bold text-white mb-4">Joueurs</h2>
          {!selectedPlayer ? (
            <ul className="space-y-2">
              {players.map(p => (
                <li
                  key={p.id}
                  className="text-white p-2 rounded hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedPlayer(p)}
                >
                  {p.pseudo_minecraft}
                </li>
              ))}
            </ul>
          ) : (
            <>
              <button
                className="text-sm text-gray-400 underline mb-2"
                onClick={() => {
                  setSelectedPlayer(null);
                  setSelectedPlayerData(null);
                }}
              >
                ← Choisir un autre
              </button>
              <h3 className="text-lg font-semibold text-white mb-2">
                {selectedPlayer.pseudo_minecraft}
              </h3>
              <div className="space-y-2">
                {attrs.map(a => (
                  <button
                    key={a.key}
                    className={`w-full text-left px-3 py-1 rounded ${
                      selectedAttr === a.key
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedAttr(a.key)}
                  >
                    {a.label}:{" "}
                    {selectedPlayerData
                      ? selectedPlayerData[a.key] ?? 0
                      : "..."}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      )}

      {/* Center: dice + modifiers */}
      <main className="flex flex-col items-center justify-center relative">
        {/* Modifiers display above die */}
        <div className="mb-6 text-center z-10">
          <span className="text-gray-200 mr-4">
            Modificateur: +{currentMod}
          </span>
          <span className="text-gray-200 mr-4">Min: {minValue}</span>
          <span className="text-gray-200">Max: {maxValue}</span>
        </div>

        <h1 className="text-5xl font-bold text-white mb-6 z-10">🎲</h1>

        <button
          onClick={handleRoll}
          className="z-10 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded shadow mb-6"
        >
          Lancer le dé
        </button>

        <div className="relative h-32 flex items-center justify-center z-10">
          <AnimatePresence>
            {!rolling && result !== null && (
              <motion.div
                key="result"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-7xl font-extrabold ${
                  result === maxValue
                    ? "text-green-400"
                    : result === minValue
                    ? "text-red-500"
                    : "text-white"
                }`}
              >
                {result}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {rain.map(({ id, left, size, delay, emoji }) => (
            <motion.div
              key={id}
              initial={{ y: -50 }}
              animate={{ y: "100vh", opacity: [1, 0.8, 0] }}
              transition={{ duration: 2, delay }}
              style={{
                position: "absolute",
                left: `${left}%`,
                fontSize: `${size}px`
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <audio ref={audioRef} src="/dice-roll.mp3" preload="auto" />
      </main>

      {/* Right panel: controller */}
      <aside className="bg-gray-800 p-4 overflow-auto">
        <h2 className="text-xl font-bold text-white mb-4">Contrôleur de dé</h2>
        <div className="flex space-x-2 mb-4">
          <button
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            onClick={() => applyPreset("percent")}
          >
            1–100
          </button>
          <button
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            onClick={() => applyPreset("d20")}
          >
            D20
          </button>
          <button
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            onClick={() => applyPreset("d6")}
          >
            D6
          </button>
        </div>
        <div className="mb-4 flex items-center">
          <span className="text-white mr-2">Min:</span>
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded-l hover:bg-gray-600"
            onClick={() => setMinValue(v => Math.max(1, v - 1))}
          >
            −
          </button>
          <span className="px-4 py-1 bg-gray-900 text-white">{minValue}</span>
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded-r hover:bg-gray-600"
            onClick={() => setMinValue(v => Math.min(v + 1, maxValue))}
          >
            +
          </button>
        </div>
        <div className="flex items-center">
          <span className="text-white mr-2">Max:</span>
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded-l hover:bg-gray-600"
            onClick={() => setMaxValue(v => Math.max(v - 1, minValue))}
          >
            −
          </button>
          <span className="px-4 py-1 bg-gray-900 text-white">{maxValue}</span>
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded-r hover:bg-gray-600"
            onClick={() => setMaxValue(v => v + 1)}
          >
            +
          </button>
        </div>
      </aside>
    </div>
  );
}
