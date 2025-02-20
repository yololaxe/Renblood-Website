import { useEffect, useState } from "react";
import { getPlayers } from "../data/api";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ✅ Import du contexte

function Players() {
  const [players, setPlayers] = useState([]);
  const { userRank } = useUser(); // ✅ Récupérer userRank depuis le contexte
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
        <button 
          className="mb-6 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition"
          onClick={() => navigate("/players-admin")}
        >
          ⚙️ Gérer les Joueurs
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <div key={player.id} className="bg-gray-800 p-6 rounded-xl shadow-lg text-left">
            <h2 className="text-2xl font-bold text-blue-400">{player.pseudo_minecraft}</h2>
            <p className="text-gray-400 italic">{player.description || "Aucune description"}</p>

            <div className="mt-4">
              <p><strong>🎖️ Rang :</strong> {player.rank}</p>
              <p><strong>💰 Argent :</strong> {player.money} Gold</p>
              <p><strong>🛠️ Compétence :</strong> {player.skill}</p>
              <p><strong>✨ Divin :</strong> {player.divin ? "Oui" : "Non"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Players;
