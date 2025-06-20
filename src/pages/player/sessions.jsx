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
  const [myFuture, setMyFuture] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1) Charger global + sessions, construire la barre « around »
  useEffect(() => {
    (async () => {
      const g = await getYearAndSeason();
      setGlobal(g);

      const sessions = await getAllSessions();
      const combo = Array.from({ length: 5 }, (_, i) => shiftSeason(g.year, g.season, i - 2));
      const arr = combo.map(({ year, season }) => {
        const found = sessions.find((s) => s.year === year && s.season === season);
        return found ? { ...found, exists: true } : { year, season, exists: false };
      });
      setAround(arr);

      // pré-sélection de la session courante si existante
      const current = arr.find((x) => x.exists && x.year === g.year && x.season === g.season);
      if (current) setSelectedId(current.id);

      setLoading(false);
    })();
  }, []);

  // 2) Dès que selectedId change, on rafraîchit résumé & future
  useEffect(() => {
    if (!selectedId) return setSummary(null) || setMyFuture(null);

    (async () => {
      const s = await getSessionById(selectedId);
      setSummary(s);
      const f = await getMyFuture(selectedId, userId);
      setMyFuture(f);
    })();
  }, [selectedId, userId]);

  if (loading || !global) {
    return <p className="text-center text-gray-400 mt-20">Chargement…</p>;
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
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* — Barre de navigation des sessions — */}
      <nav className="flex space-x-3 overflow-x-auto pb-2 border-b border-gray-700 scrollbar-thin scrollbar-thumb-gray-600">
        {around.map((item, i) => (
          <button
            key={i}
            disabled={!item.exists}
            onClick={() => item.exists && setSelectedId(item.id)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-lg whitespace-nowrap font-medium
              transition ${item.exists
                ? selectedId === item.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"}
            `}
          >
            {SEASON_LABELS[item.season]} {item.year}
            {!item.exists && (
              <span className="block text-[10px] text-gray-400">bientôt</span>
            )}
          </button>
        ))}
      </nav>

      {/* — Résumé de la session — */}
      {selectedId && summary ? (
        <motion.div
          className="bg-gray-800 rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Colonne 1 : détails généraux */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">
              {SEASON_LABELS[summary.season]} {summary.year}
            </h1>
            <p className="text-gray-300">
              Date réelle :{" "}
              <strong className="text-gray-100">
                {summary.session_date
                  ? new Date(summary.session_date).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Non définie"}
              </strong>
            </p>
            <div>
              <h2 className="text-lg text-white mb-2">Joueurs inscrits</h2>
              <ul className="max-h-40 overflow-auto list-disc list-inside text-gray-200 space-y-1">
                {summary.players.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Colonne 2 : mon statut & futures */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg text-white">Mon statut</h2>
              <p className="text-gray-200">
                {isRegistered
                  ? "✅ Vous êtes inscrit"
                  : "❌ Vous n’êtes pas inscrit"}
              </p>
            </div>

            {canModifyFuture && isRegistered && (
              <div className="space-y-4">
                <h2 className="text-lg text-white">Mon Future</h2>

                {hasFuture ? (
                  <div className="space-y-2">
                    <p className="text-gray-200">
                      Votre proposition :{" "}
                      <strong className="text-green-300">
                        {FUTURE_LABELS[myFuture.type] || myFuture.type}
                      </strong>
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/futures/edit/${myFuture.id}`)}
                        className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded text-gray-900 font-medium transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={handleRemoveFuture}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white font-medium transition"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      navigate(`/futures/create?session=${selectedId}`)
                    }
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-medium transition"
                  >
                    Ajouter une future
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <p className="text-center text-gray-400">
          Sélectionnez une session pour en voir le détail.
        </p>
      )}
    </div>
  );
}
