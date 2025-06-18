// src/pages/Players.jsx
import { useEffect, useState } from "react";
import { getPlayers } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { MoneyDisplay } from "../components/MoneyDisplay";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const { userRank } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPlayers() {
      const data = await getPlayers(userRank);
      if (data) setPlayers(data);
    }
    fetchPlayers();
  }, [userRank]);

  return (
    <section className="px-4 py-12 bg-gray-900 text-gray-200">
      <div className="max-w-5xl mx-auto">
        {/* Titre en gradient */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-400 mb-8 text-center">
          👥 Liste des Joueurs
        </h1>

        {/* Actions Admin */}
        {userRank === "Admin" && (
          <div className="mb-10 flex justify-center space-x-4">
            <button
              onClick={() => navigate("/players-admin")}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold shadow transition transform hover:scale-105"
            >
              ⚙️ Gérer les Joueurs
            </button>
            <button
              onClick={() => navigate("/create-player")}
              className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold shadow transition transform hover:scale-105"
            >
              ➕ Créer un Joueur
            </button>
          </div>
        )}

        {/* Grille des joueurs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {players.map((player) => (
            <div
              key={player.id}
              // onClick={() => navigate(`/players/${player.id}`)}
              className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 cursor-pointer overflow-hidden"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {player.pseudo_minecraft}
                  </h2>
                  <span className="px-2 py-1 bg-blue-500 text-sm font-medium rounded">
                    {player.rank}
                  </span>
                </div>
                <p className="text-gray-400 italic mb-4 flex-1">
                  {player.description || "Aucune description"}
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>👤 Nom :</strong> {player.name} {player.surname}
                  </p>
                  <p className="flex items-center">
                    <strong>💰 Argent : </strong>
                    <MoneyDisplay value={player.money} className="ml-2" />
                  </p>
                  <p>
                    <strong>✨ Divin :</strong> {player.divin}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
