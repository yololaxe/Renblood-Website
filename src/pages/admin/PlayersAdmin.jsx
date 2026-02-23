import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import PlayerEdit from "./PlayerEdit";
import PlayerTraitAction from "./PlayerTraitAction";
import PlayerLicenceManager from "./PlayerLicenceManager";
import Toast from "../../components/Toast";
import {
  handleAddTrait,
  handleRemoveTrait,
  handleAddAction,
  handleRemoveAction,
} from "./PlayerActions";
import { getPlayers } from "../../services/api";
import { FaFileContract, FaSearch, FaUserCog, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function PlayersAdmin() {
  const { userRank } = useUser();
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showLicenceManager, setShowLicenceManager] = useState(false);
  const [playerForLicence, setPlayerForLicence] = useState(null);
  const [toast, setToast] = useState({ status: null, message: "" });

  useEffect(() => {
    if (userRank !== "Admin") {
      alert("Accès refusé !");
      return;
    }
    getPlayers("Admin").then((data) => {
      if (data) {
        setPlayers(data);
        setFilteredPlayers(data);
      }
    });
  }, [userRank, updateTrigger]);

  useEffect(() => {
    const results = players.filter(p => 
      p.pseudo_minecraft.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPlayers(results);
  }, [searchTerm, players]);

  const handleSelectPlayer = (playerId) =>
    setSelectedPlayerId((prev) => (prev === playerId ? null : playerId));

  const handleCancel = () => setSelectedPlayerId(null);

  const handleUpdate = () => setUpdateTrigger((p) => p + 1);

  const showToast = (status, message) => {
    setToast({ status, message });
    setTimeout(() => setToast({ status: null, message: "" }), 3000);
  };

  const handleOpenLicenceManager = (player) => {
    setPlayerForLicence(player);
    setShowLicenceManager(true);
  };

  const handleCloseLicenceManager = () => {
    setShowLicenceManager(false);
    setPlayerForLicence(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 py-8 px-6 mb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <FaUserCog className="text-blue-500" /> Gestion des Joueurs
          </h1>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un joueur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-full py-2 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {filteredPlayers.map((player) => {
              const isSelected = selectedPlayerId === player.id;

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-gray-800 rounded-xl shadow-lg overflow-hidden border transition-all ${isSelected ? "border-blue-500 ring-2 ring-blue-500/30" : "border-gray-700 hover:border-gray-500"}`}
                >
                  {/* Header Carte (Toujours visible) */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer bg-gray-800 hover:bg-gray-750 transition-colors"
                    onClick={() => handleSelectPlayer(player.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold border border-gray-600">
                        {player.pseudo_minecraft.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{player.pseudo_minecraft}</h2>
                        <p className="text-xs text-gray-400">{player.rank} • {player.name} {player.surname}</p>
                      </div>
                    </div>
                    <span className={`text-2xl transition-transform duration-300 ${isSelected ? "rotate-45 text-blue-400" : "text-gray-500"}`}>+</span>
                  </div>

                  {/* Contenu Étendu (Mode Édition) */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-700 bg-gray-900/50 p-6"
                      >
                        <PlayerEdit
                          player={player}
                          setPlayers={setPlayers}
                          handleUpdate={handleUpdate}
                          onSaveSuccess={() => {
                            handleCancel();
                            showToast("success", "Enregistré avec succès !");
                          }}
                        />
                        
                        <div className="mt-8 pt-6 border-t border-gray-700">
                          <h3 className="text-lg font-bold text-white mb-4">Actions Avancées</h3>
                          <PlayerTraitAction
                            player={player}
                            setPlayers={setPlayers}
                            handleAddTrait={handleAddTrait}
                            handleRemoveTrait={handleRemoveTrait}
                            handleAddAction={handleAddAction}
                            handleRemoveAction={handleRemoveAction}
                          />
                          
                          <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                              onClick={() => handleOpenLicenceManager(player)}
                              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg transition"
                            >
                              <FaFileContract /> Gérer les licences
                            </button>
                            <button
                              onClick={handleCancel}
                              className="flex items-center gap-2 px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                            >
                              <FaTimes /> Fermer
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Modale Licences */}
      {showLicenceManager && playerForLicence && (
        <PlayerLicenceManager
          playerId={playerForLicence.id}
          mcId={playerForLicence.id_minecraft}
          onClose={handleCloseLicenceManager}
          showToast={(type, msg) => showToast(type === "error" ? "error" : "success", msg)}
        />
      )}

      <Toast status={toast.status} message={toast.message} />
    </div>
  );
}

export default PlayersAdmin;
