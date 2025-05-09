import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import PlayerEdit from "./PlayerEdit";
import PlayerTraitAction from "./PlayerTraitAction";
import Toast from "../../components/Toast";
import {
  handleAddTrait,
  handleRemoveTrait,
  handleAddAction,
  handleRemoveAction,
} from "./PlayerActions";
import { getPlayers } from "../../services/api";

function PlayersAdmin() {
  const { userRank } = useUser();
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // État de la notification
  const [toast, setToast] = useState({ status: null, message: "" });

  useEffect(() => {
    if (userRank !== "Admin") {
      alert("Accès refusé !");
      return;
    }
    getPlayers("Admin").then((data) => data && setPlayers(data));
  }, [userRank, updateTrigger]);

  const handleSelectPlayer = (playerId) =>
    setSelectedPlayerId((prev) => (prev === playerId ? null : playerId));

  const handleCancel = () => setSelectedPlayerId(null);

  const handleUpdate = () => setUpdateTrigger((p) => p + 1);

  // Affiche un toast puis le cache au bout de 3s
  const showToast = (status, message) => {
    setToast({ status, message });
    setTimeout(() => setToast({ status: null, message: "" }), 3000);
  };

  return (
    <>
      <div className="p-10 text-white text-center">
        <h1 className="text-3xl font-bold mb-6">⚙️ Gestion des Joueurs</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map((player) => {
            const isSelected = selectedPlayerId === player.id;

            return (
              <div
                key={player.id}
                className={
                  `bg-gray-800 p-6 rounded-xl shadow-lg text-left transition-all ` +
                  (isSelected
                    ? "md:col-span-2 bg-gray-700"
                    : "hover:bg-gray-700 cursor-pointer")
                }
              >
                {/* En-tête cliquable */}
                <h2
                  className="text-2xl font-bold text-blue-400 mb-4 cursor-pointer"
                  onClick={() => handleSelectPlayer(player.id)}
                >
                  {player.pseudo_minecraft}
                </h2>

                {isSelected && (
                  <>
                    <PlayerEdit
                      player={player}
                      setPlayers={setPlayers}
                      handleUpdate={handleUpdate}
                      onSaveSuccess={() => {
                        handleCancel(); // ferme la carte
                        showToast("Good", "Enregistré avec succès !");
                      }}
                    />
                    <PlayerTraitAction
                      player={player}
                      setPlayers={setPlayers}
                      handleAddTrait={handleAddTrait}
                      handleRemoveTrait={handleRemoveTrait}
                      handleAddAction={handleAddAction}
                      handleRemoveAction={handleRemoveAction}
                    />
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={handleCancel}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      <Toast status={toast.status} message={toast.message} />
    </>
  );
}

export default PlayersAdmin;
