import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";

function generateDiceRain(result) {
  let count = 0;
  let emoji = "🎲";

  if (result === 20) {
    count = 30 + Math.floor(Math.random() * 10);
    emoji = "🔥";
  } else if (result === 1) {
    count = 1;
    emoji = "🎲";
  } else {
    count = 5 + result * 1.5; // exemple : 10 → ~20 dés
    emoji = "🎲";
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
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [rain, setRain] = useState([]);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const { userRank } = useUser();

  const isAdmin = userRank === "Admin";

  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/dice/`);
    socketRef.current = ws;

    ws.onopen = () => console.log("🟢 WebSocket connecté !");
    ws.onclose = () => console.log("🔴 WebSocket déconnecté.");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "dice_result") {
        setRolling(true);
        audioRef.current?.play();
        setRain(generateDiceRain(data.value));
        setTimeout(() => {
          setRolling(false);
          setResult(data.value);
          setRain([]); // nettoie après animation
        }, 1500);
      }
    };

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleRollDice = () => {
    if (isAdmin && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "roll" }));
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4 mt-10 text-white overflow-hidden h-screen">
      <h1 className="text-4xl font-bold mb-4 z-10">🎲</h1>

      {isAdmin && (
        <button
          onClick={handleRollDice}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 transition text-white rounded shadow z-10"
        >
          Lancer le dé
        </button>
      )}

      {/* Résultat */}
      <div className="relative h-40 mt-6 flex items-center justify-center z-10">
        <AnimatePresence>
          {!rolling && result !== null && (
            <motion.div
              key="result"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-7xl font-extrabold ${
                result === 20 ? "text-green-400 drop-shadow-xl" :
                result === 1 ? "text-red-500" : "text-white"
              }`}
            >
              {result}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pluie de dés */}
      <div className="absolute inset-0 pointer-events-none">
        {rain.map(({ id, left, size, delay, emoji }) => (
          <motion.div
            key={id}
            initial={{ y: -100 }}
            animate={{ y: "100vh", opacity: [1, 0.9, 0] }}
            transition={{ duration: 2, delay }}
            style={{
              position: "absolute",
              left: `${left}%`,
              fontSize: `${size}px`,
              top: 0,
              zIndex: 0,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Son */}
      <audio ref={audioRef} src="/dice-roll.mp3" preload="auto" />
    </div>
  );
}
