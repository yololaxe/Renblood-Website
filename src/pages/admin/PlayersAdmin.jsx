import { useEffect, useState, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import PlayerEdit from "./PlayerEdit";
import PlayerTraitAction from "./PlayerTraitAction";
import PlayerLicenceManager from "./PlayerLicenceManager";
import PlayerQuests from "./PlayerQuests"; // Import du nouveau composant
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
import { useSearchParams } from "react-router-dom";

function PlayersAdmin() {
  const [searchParams] = useSearchParams();
  const { userRank } = useUser();
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showLicenceManager, setShowLicenceManager] = useState(false);
  const [playerForLicence, setPlayerForLicence] = useState(null);
  const [toast, setToast] = useState({ status: null, message: "" });
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'actions' | 'quests'

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    if (userRank !== "Admin") {
      alert("Accès refusé !");
      return;
    }
    getPlayers("Admin").then((data) => {
      if (data) {
        // Dédoublonnage des joueurs basé sur l'ID
        const uniquePlayers = Array.from(new Map(data.map(item => [item.id, item])).values());
        // Filtrage de sécurité
        const validPlayers = uniquePlayers.filter(p => p.id && p.pseudo_minecraft);
        
        setPlayers(validPlayers);
        setFilteredPlayers(validPlayers);
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

  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId((prev) => (prev === playerId ? null : playerId));
    setActiveTab("details"); // Reset tab on new selection
  };

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
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold border border-gray-600 overflow-hidden">
                        {player.discord_avatar ? (
                          <img src={`https://cdn.discordapp.com/avatars/${player.discord_id}/${player.discord_avatar}.png`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          player.pseudo_minecraft.charAt(0).toUpperCase()
                        )}
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
                        className="border-t border-gray-700 bg-gray-900/50"
                      >
                        {/* Tabs Navigation */}
                        <div className="flex space-x-6 px-6 pt-4 border-b border-gray-700">
                          {['details', 'actions', 'quests'].map(tab => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`pb-2 px-2 capitalize font-medium transition-colors ${
                                activeTab === tab 
                                  ? "text-blue-400 border-b-2 border-blue-400" 
                                  : "text-gray-400 hover:text-gray-200"
                              }`}
                            >
                              {tab === 'details' ? 'Détails & Stats' : tab === 'actions' ? 'Traits & Actions' : 'Quêtes'}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                          {activeTab === 'details' && (
                            <PlayerEdit
                              player={player}
                              setPlayers={setPlayers}
                              handleUpdate={handleUpdate}
                              onSaveSuccess={() => {
                                showToast("success", "Enregistré avec succès !");
                              }}
                            />
                          )}

                          {activeTab === 'actions' && (
                            <PlayerTraitAction
                              player={player}
                              setPlayers={setPlayers}
                              handleAddTrait={handleAddTrait}
                              handleRemoveTrait={handleRemoveTrait}
                              handleAddAction={handleAddAction}
                              handleRemoveAction={handleRemoveAction}
                            />
                          )}

                          {activeTab === 'quests' && (
                            <PlayerQuests playerId={player.id} />
                          )}

                          {/* Footer commun Actions */}
                          <div className="mt-8 pt-6 border-t border-gray-700 flex flex-wrap justify-end gap-3">
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
