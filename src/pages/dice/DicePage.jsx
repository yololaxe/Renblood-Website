// src/pages/dice/DicePage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { getPlayers, getPlayerData } from "../../services/api";
import { rollDice } from "../../services/api";

// génère les particules “pluie de dés”
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
  const { userRank, token } = useUser();   // on récupère aussi le token
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

  // — Admin : charge la liste de joueurs
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const list = await getPlayers("Admin");
      setPlayers(Array.isArray(list) ? list : []);
    })();
  }, [isAdmin]);

  // — Admin : charge les données du joueur sélectionné
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

  // — playRoll : animation + son + pluie
  const playRoll = useCallback((rollValue) => {
    setRolling(true);
    audioRef.current?.play();
    setRain(generateDiceRain(rollValue));
    setTimeout(() => {
      setRolling(false);
      setResult(rollValue);
      setRain([]);
    }, 1500);
  }, []);

  // — WebSocket Channels (utilise VITE_WS_URL)
  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/dice/`);
    wsRef.current = ws;

    // ws.onopen    = () => console.log("🟢 WS Channels connecté");
    // ws.onclose   = () => console.log("🔴 WS Channels déconnecté");
    ws.onmessage = (event) => {
      console.log("← WS reçoit :", event.data);
      const d = JSON.parse(event.data);
      if (d.type === "dice_result") {
        playRoll(d.value);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [playRoll]);


  // — calcule le modificateur courant
  const currentMod =
    isAdmin && selectedPlayerData && selectedAttr
      ? (selectedPlayerData[selectedAttr] || 0)
      : 0;

  // — Lance le dé
  const handleRoll = async () => {
     try {
       // on alerte dans la console exactement ce qu'on envoie
       console.log("→ HTTP POST /dice/roll/", { min: minValue, max: maxValue, mod: currentMod });
       const res = await rollDice(token, { min: minValue, max: maxValue, mod: currentMod });
       console.log("← HTTP répond :", res);
       // le serveur broadcastera sur Channels, votre WS captera et jouera l'animation
       const base = Math.floor(Math.random()*(maxValue-minValue+1))+minValue;
       playRoll(base + currentMod);
     } catch (err) {
       console.error("Erreur appel rollDice:", err);
       // en fallback, on peut toujours jouer local :

     }
   };

  // — Presets min/max
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
    <div className={`bg-gray-900 h-screen ${
        isAdmin
          ? "grid grid-cols-[18rem_1fr_18rem]"
          : "flex flex-col justify-center"
      } overflow-hidden`}>
      {/* — Panneau gauche (Admin) */}
      {isAdmin && (
        <aside className="bg-gray-800 p-6 overflow-auto">
          <h2 className="text-2xl font-bold text-white mb-4">🎮 Joueurs</h2>
          {!selectedPlayer ? (
            <ul className="space-y-2">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="text-white p-2 rounded hover:bg-gray-700 cursor-pointer transition"
                  onClick={() => setSelectedPlayer(p)}
                >
                  {p.pseudo_minecraft}
                </li>
              ))}
            </ul>
          ) : (
            <>
              <button
                className="text-sm text-gray-400 underline mb-4"
                onClick={() => {
                  setSelectedPlayer(null);
                  setSelectedPlayerData(null);
                }}
              >
                ← Retour
              </button>
              <h3 className="text-xl font-semibold text-white mb-4">
                {selectedPlayer.pseudo_minecraft}
              </h3>
              <div className="space-y-3">
                {attrs.map((a) => (
                  <button
                    key={a.key}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedAttr === a.key
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedAttr(a.key)}
                  >
                    {a.label}: {selectedPlayerData?.[a.key] ?? "..."}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      )}

      {/* — Centre : zone de lancement */}
      <main className="relative flex flex-col items-center justify-center px-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-400 mb-8 z-10">
          🎲 Lancer de Dé
        </h1>

        <div className="mb-6 flex items-center space-x-6 text-lg text-gray-200 z-10">
          <span>Modificateur: +{currentMod}</span>
          <span>Min: {minValue}</span>
          <span>Max: {maxValue}</span>
        </div>

        {isAdmin && (
          <button
            onClick={handleRoll}
            className="mb-8 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition transform hover:-translate-y-1 z-10"
          >
            Lancer
          </button>
        )}

        <div className="relative w-40 h-40 flex items-center justify-center z-10">
          <AnimatePresence>
            {!rolling && result !== null && (
              <motion.div
                key="result"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={`text-8xl font-extrabold ${
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

        {/* pluie de dés */}
        <div className="absolute inset-0 pointer-events-none">
          {rain.map(({ id, left, size, delay, emoji }) => (
            <motion.div
              key={id}
              initial={{ y: -60 }}
              animate={{ y: "110vh", opacity: [1, 0.6, 0] }}
              transition={{ duration: 1.8, delay }}
              style={{ position: "absolute", left: `${left}%`, fontSize: `${size}px` }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/*<audio ref={audioRef} src="/dice-roll.mp3" preload="auto" />*/}
      </main>

      {/* — Panneau droit (Admin) */}
      {isAdmin && (
        <aside className="bg-gray-800 p-6 overflow-auto">
          <h2 className="text-2xl font-bold text-white mb-4">⚙️ Contrôles</h2>
          <div className="flex space-x-3 mb-6">
            <button
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              onClick={() => applyPreset("percent")}
            >
              1–100
            </button>
            <button
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              onClick={() => applyPreset("d20")}
            >
              D20
            </button>
            <button
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              onClick={() => applyPreset("d6")}
            >
              D6
            </button>
          </div>
          <div className="space-y-4">
            {["Min", "Max"].map((label) => {
              const setter = label === "Min" ? setMinValue : setMaxValue;
              const value = label === "Min" ? minValue : maxValue;
              const dec = () => setter((v) => Math.max(1, v - 1));
              const inc = () =>
                setter((v) =>
                  label === "Min" ? Math.min(v + 1, maxValue) : v + 1
                );
              return (
                <div key={label} className="flex items-center space-x-2">
                  <span className="text-white w-12">{label} :</span>
                  <button
                    onClick={dec}
                    className="px-2 py-1 bg-gray-700 text-white rounded-l hover:bg-gray-600 transition"
                  >
                    −
                  </button>
                  <div className="px-4 py-1 bg-gray-900 text-white">{value}</div>
                  <button
                    onClick={inc}
                    className="px-2 py-1 bg-gray-700 text-white rounded-r hover:bg-gray-600 transition"
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
}
