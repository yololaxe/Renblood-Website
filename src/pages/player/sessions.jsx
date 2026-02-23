// src/pages/SessionsPage.jsx
import React, { useState, useEffect } from "react";
import {
  getYearAndSeason,
  getAllSessions,
  getSessionById,
  getMyFuture,
  deleteFuture,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarAlt, FaClock, FaUsers, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const SEASON_LABELS = { 1: "Printemps", 2: "Été", 3: "Automne", 4: "Hiver" };
const FUTURE_LABELS = {
  exploration: "Exploration",
  construction: "Construction",
  caisse_royale: "Caisse Royale",
  rejoindre_armee: "Rejoindre l’armée",
  tenir_magasin: "Tenir le magasin",
  travailler: "Travailler",
  espionner: "Espionner",
  sentrainer: "S’entraîner",
};

function shiftSeason(year, season, offset) {
  const idx = season - 1 + offset;
  const y = year + Math.floor(idx / 4);
  const s = ((idx % 4) + 4) % 4 + 1;
  return { year: y, season: s };
}

export default function SessionsPage() {
  const { userId } = useUser();
  const [global, setGlobal] = useState(null);
  const [around, setAround] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [myFuture, setMyFuture] = useState();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const g = await getYearAndSeason();
      setGlobal(g);

      const sessions = await getAllSessions();
      const combo = Array.from({ length: 5 }, (_, i) =>
        shiftSeason(g.year, g.season, i - 2)
      );
      const arr = combo.map(({ year, season }) => {
        const found = sessions.find(
          (s) => s.year === year && s.season === season
        );
        return found
          ? { ...found, exists: true }
          : { year, season, exists: false };
      });
      setAround(arr);

      const current = arr.find(
        (x) => x.exists && x.year === g.year && x.season === g.season
      );
      if (current) setSelectedId(current.id);

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSummary(null);
      setMyFuture(undefined);
      return;
    }

    (async () => {
      setMyFuture(undefined);
      const s = await getSessionById(selectedId);
      setSummary(s);
      const f = await getMyFuture(selectedId, userId);
      setMyFuture(f);
    })();
  }, [selectedId, userId]);

  if (loading || !global) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const canModifyFuture = global.future_modif_add_state;
  const isRegistered = summary?.players.some((p) => p.id === userId);
  const hasFuture = Boolean(myFuture);

  const handleRemoveFuture = async () => {
    if (!confirm("Voulez-vous vraiment supprimer votre proposition ?")) return;
    await deleteFuture(myFuture.id);
    const s = await getSessionById(selectedId);
    setSummary(s);
    setMyFuture(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-12 px-4 mb-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 relative z-10"
        >
          Chroniques des Sessions
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto relative z-10">
          Consultez l'historique, inscrivez-vous aux prochaines sessions et planifiez vos actions futures.
        </p>
      </div>

      {/* --- TIMELINE --- */}
      <div className="max-w-5xl mx-auto px-4 mb-10">
        <div className="flex justify-center space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {around.map((item, i) => (
            <button
              key={i}
              disabled={!item.exists}
              onClick={() => item.exists && setSelectedId(item.id)}
              className={`
                flex flex-col items-center justify-center px-6 py-3 rounded-xl border transition-all duration-300 min-w-[140px]
                ${item.exists
                  ? selectedId === item.id
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg scale-105"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                  : "bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed opacity-50"}
              `}
            >
              <span className="text-sm font-bold uppercase tracking-wider">{SEASON_LABELS[item.season]}</span>
              <span className="text-2xl font-extrabold">{item.year}</span>
              {!item.exists && <span className="text-[10px] mt-1">Bientôt</span>}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENU SESSION --- */}
      <div className="max-w-5xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {selectedId && summary ? (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* COLONNE GAUCHE : INFO SESSION */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <FaCalendarAlt className="text-blue-400" /> 
                      {SEASON_LABELS[summary.season]} {summary.year}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isRegistered ? "bg-green-900/30 text-green-400 border-green-600" : "bg-red-900/30 text-red-400 border-red-600"}`}>
                      {isRegistered ? "Inscrit" : "Non inscrit"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-300 mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <FaClock className="text-yellow-500" />
                    <div>
                      <span className="block text-xs text-gray-500 uppercase font-bold">Date réelle</span>
                      <span className="font-mono text-lg">
                        {summary.session_date
                          ? new Date(summary.session_date).toLocaleString("fr-FR", {
                              day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })
                          : "Date à définir"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <FaUsers /> Joueurs Inscrits ({summary.players.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {summary.players.length > 0 ? (
                        summary.players.map((p) => (
                          <span key={p.id} className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm border border-gray-600">
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">Aucun joueur inscrit pour le moment.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLONNE DROITE : ACTIONS (FUTURES) */}
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg h-full flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                    Mes Actions Futures
                  </h3>

                  {canModifyFuture && isRegistered ? (
                    <div className="flex-1 flex flex-col justify-center">
                      {myFuture === undefined ? (
                        <div className="animate-pulse h-20 bg-gray-700 rounded-lg" />
                      ) : hasFuture ? (
                        <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                          <p className="text-sm text-gray-400 mb-1">Action planifiée :</p>
                          <p className="text-lg font-bold text-green-400 mb-4">
                            {FUTURE_LABELS[myFuture.type] || myFuture.type}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => navigate(`/futures/edit/${myFuture.id}`)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition text-sm"
                            >
                              <FaEdit /> Modifier
                            </button>
                            <button
                              onClick={handleRemoveFuture}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition text-sm"
                            >
                              <FaTrash /> Supprimer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-400 mb-4">Vous n'avez pas encore défini d'action pour cette session.</p>
                          <button
                            onClick={() => navigate(`/futures/create?session=${selectedId}`)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
                          >
                            <FaPlus /> Créer une action
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-10">
                      {!isRegistered ? (
                        <>
                          <FaTimesCircle className="text-4xl text-red-500 mb-2" />
                          <p>Vous devez être inscrit à la session pour planifier une action.</p>
                        </>
                      ) : (
                        <>
                          <FaLock className="text-4xl text-gray-600 mb-2" />
                          <p>Les actions futures sont fermées pour cette session.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Sélectionnez une session ci-dessus pour voir les détails.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
