import { useEffect, useState } from "react";
import { getPlayers, updatePlayer } from "../data/api";
import { useUser } from "../context/UserContext";
import { FaEdit, FaSave } from "react-icons/fa";

function PlayersAdmin() {
  const { userRank } = useUser();
  const [players, setPlayers] = useState([]);
  const [editing, setEditing] = useState({});
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    async function fetchPlayers() {
      if (userRank !== "Admin") {
        alert("Accès refusé !");
        return;
      }
      const data = await getPlayers("Admin");
      if (data) setPlayers(data);
    }
    fetchPlayers();
  }, [userRank]);

  const handleEdit = (playerId, field, value) => {
    setEditing((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [field]: true } }));
    setEditedData((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [field]: value } }));
  };

  const handleChange = (playerId, field, value) => {
    setEditedData((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [field]: value } }));
  };

  const handleSave = async (playerId) => {
    const response = await updatePlayer(playerId, editedData[playerId]); 
  
    if (response) {
      alert("✅ Modifications enregistrées avec succès !");
  
      // 🟢 Mise à jour immédiate de l'état players pour refléter les changements
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === playerId ? { ...player, ...editedData[playerId] } : player
        )
      );
  
      // 🟢 Réinitialisation du mode édition
      setEditing((prev) => ({ ...prev, [playerId]: {} }));
    } else {
      alert("❌ Une erreur est survenue lors de l'enregistrement.");
    }
  };

  return (
    <div className="p-10 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">⚙️ Gestion des Joueurs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((player) => (
          <div key={player.id} className="bg-gray-800 p-6 rounded-xl shadow-lg text-left">
            <h2 className="text-2xl font-bold text-blue-400">{player.pseudo_minecraft}</h2>

            <div className="mt-4 space-y-3">
              {/* 🔹 Prénom */}
              <div className="flex items-center">
                <span className="mr-2">🧑‍💼 Prénom :</span>
                {editing[player.id]?.name ? (
                  <input
                    type="text"
                    className="bg-gray-700 px-2 py-1 rounded w-full"
                    value={editedData[player.id]?.name || ""}
                    onChange={(e) => handleChange(player.id, "name", e.target.value)}
                  />
                ) : (
                  <span className="mr-2">{player.name}</span>
                )}
                <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "name", player.name)} />
              </div>

              {/* 🔹 Description */}
              <div className="flex items-center">
                <span className="mr-2">📄 Description :</span>
                {editing[player.id]?.description ? (
                  <textarea
                    className="bg-gray-700 px-2 py-1 rounded w-full"
                    value={editedData[player.id]?.description || ""}
                    onChange={(e) => handleChange(player.id, "description", e.target.value)}
                  />
                ) : (
                  <span className="mr-2">{player.description || "Aucune description"}</span>
                )}
                <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "description", player.description)} />
              </div>

              {/* 🔹 Rang */}
              <div className="flex items-center">
                <span className="mr-2">🎖️ Rang :</span>
                {editing[player.id]?.rank ? (
                  <input
                    type="text"
                    className="bg-gray-700 px-2 py-1 rounded w-full"
                    value={editedData[player.id]?.rank || ""}
                    onChange={(e) => handleChange(player.id, "rank", e.target.value)}
                  />
                ) : (
                  <span className="mr-2">{player.rank}</span>
                )}
                <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "rank", player.rank)} />
              </div>

              {/* 🔹 Argent */}
              <div className="flex items-center">
                <span className="mr-2">💰 Argent :</span>
                {editing[player.id]?.money ? (
                  <input
                    type="number"
                    className="bg-gray-700 px-2 py-1 rounded w-full"
                    value={editedData[player.id]?.money || ""}
                    onChange={(e) => handleChange(player.id, "money", e.target.value)}
                  />
                ) : (
                  <span className="mr-2">{player.money} Gold</span>
                )}
                <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "money", player.money)} />
              </div>

              {/* 🔹 Skill */}
              <div className="flex items-center">
                <span className="mr-2">⚒️ Skill :</span>
                {editing[player.id]?.skill ? (
                  <input
                    type="number"
                    className="bg-gray-700 px-2 py-1 rounded w-full"
                    value={editedData[player.id]?.skill || ""}
                    onChange={(e) => handleChange(player.id, "skill", e.target.value)}
                  />
                ) : (
                  <span className="mr-2">{player.skill}</span>
                )}
                <FaEdit className="text-gray-400 cursor-pointer" onClick={() => handleEdit(player.id, "skill", player.skill)} />
              </div>

              {/* 🎯 Bouton Enregistrer */}
              <button
                onClick={() => handleSave(player.id)}
                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-lg font-semibold transition flex items-center space-x-2"
              >
                <FaSave /> <span>Enregistrer</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayersAdmin;
