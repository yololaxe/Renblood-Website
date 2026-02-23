// src/pages/admin/SessionPlayersFuturesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSessionById,
  getSessionPlayersWithFutures,
  getPlayerData,
} from "../../services/api";
import { MoneyDisplay } from "../../components/MoneyDisplay";
import { FaCalendarAlt, FaClock, FaUsers, FaClipboardList, FaSearch, FaFilter, FaArrowLeft, FaUserCircle } from "react-icons/fa";

const SEASON_LABELS = { 1: "Printemps", 2: "Été", 3: "Automne", 4: "Hiver" };
const FUTURE_LABELS = {
  exploration:     "Exploration",
  construction:    "Construction",
  caisse_royale:   "La caisse royale !",
  rejoindre_armee: "Rejoindre l’armée",
  tenir_magasin:   "Tenir le magasin",
  travailler:      "Travailler",
  espionner:       "Espionner",
  sentrainer:      "S’entraîner",
};

export default function SessionPlayersFuturesPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    (async () => {
      try {
        const sess = await getSessionById(sessionId);
        setSession(sess);

        const list = await getSessionPlayersWithFutures(sessionId);
        const detailed = await Promise.all(
          list.map(async ({ player, future }) => {
            const details = await getPlayerData(player.id);
            return {
              id:         player.id,
              pseudo:     player.pseudo_minecraft || "-",
              name:       player.name,
              surname:    player.surname,
              rank:       player.rank,
              discord_id: player.discord_id,
              discord_avatar: player.discord_avatar,
              money:      details?.money ?? 0,
              future,
            };
          })
        );
        setRows(detailed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchesSearch = 
        row.pseudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = 
        filterType === "ALL" || 
        (filterType === "HAS_FUTURE" && row.future) ||
        (filterType === "NO_FUTURE" && !row.future) ||
        (row.future && row.future.type === filterType);

      return matchesSearch && matchesFilter;
    });
  }, [rows, searchTerm, filterType]);

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Non définie";

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-10 px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate("/admin-dashboard")}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <FaArrowLeft /> Retour au Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                <FaClipboardList className="text-blue-500" /> 
                {SEASON_LABELS[session.season]} {session.year}
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <FaClock /> {fmtDate(session.session_date)}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600 text-center">
                <span className="block text-2xl font-bold text-white">{session.players_count}</span>
                <span className="text-xs text-gray-400 uppercase">Inscrits</span>
              </div>
              <div className="bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600 text-center">
                <span className="block text-2xl font-bold text-yellow-400">{session.futures_count}</span>
                <span className="text-xs text-gray-400 uppercase">Futures</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FILTRES --- */}
      <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <FaFilter className="text-gray-500" />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous</option>
            <option value="HAS_FUTURE">Avec Future</option>
            <option value="NO_FUTURE">Sans Future</option>
            <optgroup label="Type d'action">
              {Object.entries(FUTURE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* --- GRILLE --- */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredRows.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-gray-800 rounded-xl border shadow-lg overflow-hidden flex flex-col ${p.future ? "border-blue-500/30" : "border-gray-700 opacity-70"}`}
            >
              {/* Header Carte */}
              <div className="p-4 bg-gray-900/50 border-b border-gray-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-600">
                  {p.discord_avatar ? (
                    <img src={`https://cdn.discordapp.com/avatars/${p.discord_id}/${p.discord_avatar}.png`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle size={24} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{p.pseudo}</h3>
                  <p className="text-xs text-gray-400">{p.rank}</p>
                </div>
                <div className="ml-auto">
                  <MoneyDisplay value={p.money} />
                </div>
              </div>

              {/* Corps Carte */}
              <div className="p-4 flex-1 flex flex-col">
                {p.future ? (
                  <>
                    <div className="mb-3">
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Action</span>
                      <span className="inline-block bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold border border-blue-800/30">
                        {FUTURE_LABELS[p.future.type] || p.future.type}
                      </span>
                    </div>
                    {p.future.answer && (
                      <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-700/50">
                        <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Détails</span>
                        <p className="text-sm text-gray-300 italic">"{p.future.answer}"</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 italic py-4">
                    Aucune action planifiée
                  </div>
                )}
              </div>

              {/* Footer Actions (Placeholder pour futures actions admin) */}
              {/* <div className="p-3 bg-gray-900/30 border-t border-gray-700 flex justify-end gap-2">
                <button className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white transition">Détails</button>
              </div> */}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {filteredRows.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Aucun joueur trouvé.</p>
      )}
    </div>
  );
}
