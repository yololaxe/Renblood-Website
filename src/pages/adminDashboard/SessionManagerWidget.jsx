import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getYearAndSeason,
  getCurrentSession,
  createSession,
  addPlayerToSession,
  removePlayerFromSession,
  getPlayers,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import Tooltip from "../../components/tooltip";

const SEASON_LABELS = {
  1: "Printemps",
  2: "Été",
  3: "Automne",
  4: "Hiver",
};

export default function SessionManagerWidget() {
  const [loading, setLoading] = useState(true);
  const [global, setGlobal] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const navigate = useNavigate();

  // Function to load globals and session
  const loadData = async () => {
    setLoading(true);
    try {
      const g = await getYearAndSeason();
      setGlobal(g);
      const s = await getCurrentSession();
      setSession(s);
    } catch (e) {
      console.error(e);
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => loadData();

  const handleCreate = async () => {
    if (!global) return;
    if (!window.confirm(
      `Créer la session ${SEASON_LABELS[global.season]} ${global.year} ?`
    )) return;
    try {
      const s = await createSession({ year: global.year, season: global.season });
      setSession(s);
    } catch {
      alert("Échec de la création");
    }
  };

  const openAddModal = async () => {
    try {
      const list = await getPlayers("Admin");
      setAllPlayers(list || []);
      setShowAddModal(true);
    } catch {
      alert("Impossible de charger la liste des joueurs");
    }
  };

  const handleAddPlayer = async (playerId) => {
    try {
      const updated = await addPlayerToSession(session.id, playerId);
      setSession(updated);
      setShowAddModal(false);
    } catch {
      alert("Impossible d’ajouter ce joueur");
    }
  };

  const openRemoveModal = () => setShowRemoveModal(true);
  const handleRemovePlayer = async (playerId) => {
    try {
      const updated = await removePlayerFromSession(session.id, playerId);
      setSession(updated);
      setShowRemoveModal(false);
    } catch {
      alert("Impossible de retirer ce joueur");
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <motion.div
      className="relative bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
        aria-label="Rafraîchir"
      >
        🔄
      </button>

      <h2 className="text-2xl font-bold text-white">🕹️ Gestion de session</h2>

      {session ? (
        <div className="space-y-2">
          <p className="text-gray-300 flex items-center">
            Session active :{' '}
            <span className="ml-1 text-green-300">
              {SEASON_LABELS[session.season]} {session.year}
            </span>
          </p>

          <p className="flex items-center">
            Joueurs inscrits :{' '}
            <Tooltip
              text={
                session.players?.length > 0
                  ? session.players.map(p => p.pseudo_minecraft || p.name).join(", ")
                  : "Aucun joueur"
              }
            >
              <strong className="ml-1 cursor-help text-blue-400 hover:text-blue-300">
                {session.players_count}
              </strong>
            </Tooltip>
          </p>

          <p className="flex items-center">
            Futures liées :{' '}
            <Tooltip
              text={
                session.futures_players?.length > 0
                  ? session.futures_players.join(", ")
                  : "Aucun future"
              }
            >
              <strong className="ml-1 cursor-help text-blue-400 hover:text-blue-300">
                {session.futures_count}
              </strong>
            </Tooltip>
          </p>

          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/admin/sessions/${session.id}`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
            >
              Voir le récap
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded text-gray-900"
            >
              Ajouter un joueur
            </button>
            <button
              onClick={openRemoveModal}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
            >
              Retirer un joueur
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-400">
            Aucune session pour{' '}
            <strong>
              {SEASON_LABELS[global.season]} {global.year}
            </strong>
          </p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
          >
            Créer la session
          </button>
        </div>
      )}

      {showRemoveModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowRemoveModal(false)}
        >
          <div
            className="bg-gray-800 text-white p-6 rounded-lg max-h-[80vh] overflow-auto w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl mb-4">Retirer un joueur</h3>
            <ul className="space-y-2">
              {session.players.length > 0 ? (
                session.players.map(p => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center hover:bg-gray-700 px-4 py-2 rounded"
                  >
                    <span>{p.pseudo_minecraft || p.name}</span>
                    <button
                      className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white"
                      onClick={() => handleRemovePlayer(p.id)}
                    >
                      －
                    </button>
                  </li>
                ))
              ) : (
                <p>Aucun joueur à retirer.</p>
              )}
            </ul>
            <button
              className="mt-4 text-sm text-gray-400 underline"
              onClick={() => setShowRemoveModal(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
