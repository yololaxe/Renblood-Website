// src/pages/reporting/MoneyReport.jsx
import React, { useState, useEffect } from "react";
import { getAllSessionMoney } from "../../../services/api.js";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  Tooltip,
  Legend
);

export default function MoneyReport() {
  const [rawData, setRawData] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [sessionCount, setSessionCount] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllSessionMoney();
        setRawData(data);
        const uniq = Array.from(
          new Map(data.map((d) => [d.player_id, d])).values()
        );
        setPlayers(
          uniq.map((d) => ({
            id: d.player_id,
            pseudo: d.player_pseudo
          }))
        );
        if (uniq.length) {
          setSelectedPlayer(uniq[0].player_id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // toutes les sessions triées chronologiquement pour le joueur
  const filtered = rawData
    .filter((d) => d.player_id === selectedPlayer)
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date));

  // ne garder que les dernières sessionCount sessions
  const limited = filtered.slice(-sessionCount);

  const chartData = {
    labels: limited.map((d) => d.session_date),
    datasets: [
      {
        label:
          players.find((p) => p.id === selectedPlayer)?.pseudo ?? "Joueur",
        data: limited.map((d) => d.money),
        backgroundColor: "rgba(63, 136, 226, 0.7)",
        borderColor: "rgba(63, 136, 226, 1)",
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    scales: {
      x: {
        type: "time",
        time: { unit: "day" },
        title: {
          display: true,
          text: "Date de session"
        }
      },
      y: {
        title: {
          display: true,
          text: "Money"
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: "top"
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `💰 ${ctx.parsed.y}`
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Évolution de la money par joueur
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          {/* Sélecteur de joueur */}
          <div className="mb-4 md:mb-0">
            <label className="block mb-1 font-medium">Joueur</label>
            <select
              value={selectedPlayer || ""}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-48 bg-gray-700 text-white p-2 rounded-lg shadow-inner"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.pseudo}
                </option>
              ))}
            </select>
          </div>

          {/* Sélecteur du nombre de sessions */}
          <div className="w-full md:w-1/2">
            <label className="block mb-1 font-medium">
              Nombre de sessions à afficher&nbsp;:{" "}
              <span className="text-blue-300">{sessionCount}</span>
            </label>
            <input
              type="range"
              min="1"
              max={filtered.length || 1}
              value={sessionCount}
              onChange={(e) => setSessionCount(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Graphique */}
        {limited.length > 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-xl text-gray-900">
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-center text-gray-400">
            Aucune donnée disponible pour ce joueur.
          </p>
        )}
      </div>
    </div>
  );
}
