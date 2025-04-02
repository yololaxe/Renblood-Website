import { useEffect, useState } from "react";
import { getPlayers } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { MoneyDisplay } from "../components/MoneyDisplay";

function Players() {
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
    <div className="p-10 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">👥 Liste des Joueurs</h1>

      {/* Bouton Admin si l'utilisateur est Admin */}
      {userRank === "Admin" && (
        <div className="mb-6 flex justify-center space-x-4">
          <button 
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition"
            onClick={() => navigate("/players-admin")}
          >
            ⚙️ Gérer les Joueurs
          </button>
          <button 
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
            onClick={() => navigate("/create-player")}
          >
            ➕ Créer un Joueur
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <div key={player.id} className="bg-gray-800 p-6 rounded-xl shadow-lg text-left">
            <h2 className="text-2xl font-bold text-blue-400">{player.pseudo_minecraft}</h2>
            <p className="mt-2">
              <strong>👤 Nom :</strong> {player.name} {player.surname}
            </p>
            <p className="text-gray-400 italic mt-2">
              {player.description || "Aucune description"}
            </p>

            <div className="mt-4 space-y-2">
              <p><strong>🎖️ Rang :</strong> {player.rank}</p>
              <p><strong>💰 Argent :</strong> <MoneyDisplay value={player.money}  /> ({player.money})</p>
              <p><strong>✨ Divin :</strong> {player.divin}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Players;