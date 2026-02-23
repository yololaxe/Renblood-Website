// src/pages/Players.jsx
import { useEffect, useState } from "react";
import { getPlayers } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { MoneyDisplay } from "../components/MoneyDisplay";
import { motion } from "framer-motion";
import { FaUserCircle, FaSearch, FaFilter, FaCog, FaPlus } from "react-icons/fa";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { userRank } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      const data = await getPlayers(userRank);
      if (data) {
        setPlayers(data);
        setFilteredPlayers(data);
      }
      setLoading(false);
    }
    fetchPlayers();
  }, [userRank]);

  useEffect(() => {
    const results = players.filter(player =>
      player.pseudo_minecraft.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.name && player.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (player.surname && player.surname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPlayers(results);
  }, [searchTerm, players]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-12 px-4 mb-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            👥 Citoyens de Renblood
          </motion.h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez les habitants du royaume, leurs rangs et leurs histoires.
          </p>

          {/* Actions Admin */}
          {userRank === "Admin" && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => navigate("/players-admin")}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold shadow transition"
              >
                <FaCog /> Gérer
              </button>
              <button
                onClick={() => navigate("/create-player")}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold shadow transition"
              >
                <FaPlus /> Créer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- FILTRES --- */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* --- GRILLE --- */}
      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Aucun joueur trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg hover:shadow-xl hover:border-blue-500/50 transition-all group overflow-hidden"
              >
                {/* Header Carte */}
                <div className="p-4 bg-gray-800/50 border-b border-gray-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-600">
                    {player.discord_avatar ? (
                       <img 
                         src={`https://cdn.discordapp.com/avatars/${player.discord_id}/${player.discord_avatar}.png`} 
                         alt="Avatar" 
                         className="w-full h-full object-cover"
                       />
                    ) : (
                      <FaUserCircle size={24} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {player.pseudo_minecraft}
                    </h2>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/30">
                      {player.rank}
                    </span>
                  </div>
                </div>

                {/* Corps Carte */}
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-400 italic line-clamp-2 min-h-[2.5em]">
                    "{player.description || "Un citoyen discret..."}"
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                      <span className="block text-xs text-gray-500 uppercase">Identité</span>
                      <span className="text-gray-200">{player.name} {player.surname}</span>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                      <span className="block text-xs text-gray-500 uppercase">Divinité</span>
                      <span className="text-purple-300">{player.divin || "Aucune"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase font-bold">Fortune</span>
                    <MoneyDisplay value={player.money} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
