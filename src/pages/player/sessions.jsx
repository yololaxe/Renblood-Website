import RealmHeader from "../../components/RealmHeader";
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
import { FaCalendarAlt, FaClock, FaUsers, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaLock } from "react-icons/fa";

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
      <div className="flex items-center justify-center min-h-screen bg-stone-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const canModifyFuture = global.future_modif_add_state;
  const isRegistered = summary?.players?.some((p) => p.id === userId);
  const hasFuture = Boolean(myFuture);

  const handleRemoveFuture = async () => {
    if (!confirm("Voulez-vous vraiment supprimer votre proposition ?")) return;
    await deleteFuture(myFuture.id);
    const s = await getSessionById(selectedId);
    setSummary(s);
    setMyFuture(null);
  };

  return (
    <div className="realm-page">
      
      <RealmHeader eyebrow="La chronique / Sessions" title="La suite de votre histoire" description="Retrouvez les saisons du royaume, les rendez-vous à venir et les actions qui préparent votre prochain chapitre." image="/accueil/screen2.png" />

      {/* --- TIMELINE --- */}
      <div className="realm-content mb-6">
        <div className="realm-timeline" aria-label="Choisir une saison">
          {around.map((item,i) => <button key={`${item.year}-${item.season}`} disabled={!item.exists} aria-pressed={selectedId === item.id && item.exists} onClick={() => setSelectedId(item.id)} className="realm-season"><span>{SEASON_LABELS[item.season]}</span><strong>{item.year}</strong><small>{!item.exists ? "Non programmée" : item.year === global.year && item.season === global.season ? "Saison actuelle" : "Voir la session"}</small></button>)}
        </div>
      </div>

      {/* --- CONTENU SESSION --- */}
      <div className="realm-content">
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
                <div className="realm-panel bg-[#191916] rounded-sm p-6 border border-stone-700 shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <FaCalendarAlt className="text-amber-300" /> 
                      {SEASON_LABELS[summary.season]} {summary.year}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isRegistered ? "bg-green-900/30 text-green-400 border-green-600" : "bg-red-900/30 text-red-400 border-red-600"}`}>
                      {isRegistered ? "Inscrit" : "Non inscrit"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-stone-300 mb-6 bg-stone-950/50 p-4 rounded-lg border border-stone-700">
                    <FaClock className="text-amber-300" />
                    <div>
                      <span className="block text-xs text-stone-500 uppercase font-bold">Date réelle</span>
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
                    <h3 className="text-sm font-bold text-stone-400 uppercase mb-3 flex items-center gap-2">
                      <FaUsers /> Joueurs Inscrits ({summary.players.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {summary.players.length > 0 ? (
                        summary.players.map((p) => (
                          <span key={p.id} className="bg-stone-800 text-stone-200 px-3 py-1 rounded-full text-sm border border-stone-600">
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-500 italic">Aucun joueur inscrit pour le moment.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLONNE DROITE : ACTIONS (FUTURES) */}
              <div className="space-y-6">
                <div className="realm-panel bg-[#191916] rounded-sm p-6 border border-stone-700 shadow-none h-full flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-stone-700 pb-2">
                    Mes Actions Futures
                  </h3>

                  {canModifyFuture && isRegistered ? (
                    <div className="flex-1 flex flex-col justify-center">
                      {myFuture === undefined ? (
                        <div className="animate-pulse h-20 bg-stone-800 rounded-lg" />
                      ) : hasFuture ? (
                        <div className="bg-stone-800/50 p-4 rounded-sm border border-stone-600">
                          <p className="text-sm text-stone-400 mb-1">Action planifiée :</p>
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
                          <p className="text-stone-400 mb-4">Vous n'avez pas encore défini d'action pour cette session.</p>
                          <button
                            onClick={() => navigate(`/futures/create?session=${selectedId}`)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-800 hover:bg-amber-700 text-white rounded-sm font-bold shadow-none transition transform hover:scale-105"
                          >
                            <FaPlus /> Créer une action
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-stone-500 py-10">
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
              <p className="text-stone-500 text-lg">Sélectionnez une session ci-dessus pour voir les détails.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
