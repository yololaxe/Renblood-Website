import React, { useEffect, useState, useRef } from "react";

export default function DicePage({ user }) {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const socketRef = useRef(null);
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/dice/`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 WebSocket connecté !");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "dice_result") {
        setRolling(true);
        setTimeout(() => {
          setRolling(false);
          setResult(data.value);
        }, 2000);
      }
    };

    ws.onclose = () => {
      console.log("🔴 WebSocket déconnecté.");
    };

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleRollDice = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "roll" }));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10 text-white">
      <h1 className="text-4xl font-bold mb-4">🎲 Dé 20</h1>
      {(
        <button
          onClick={handleRollDice}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 transition text-white rounded shadow"
        >
          Lancer le dé
        </button>
      )}
      <div className="text-6xl mt-6 animate-bounce h-20">
        {rolling ? "🎲..." : result !== null ? `Résultat : ${result}` : "En attente..."}
      </div>
    </div>
  );
}
