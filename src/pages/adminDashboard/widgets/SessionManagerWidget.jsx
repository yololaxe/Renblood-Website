// src/components/SessionManagerWidget.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker, { registerLocale } from "react-datepicker";
import { FaSyncAlt, FaCalendarAlt, FaUserPlus, FaUserMinus, FaClipboardList } from "react-icons/fa";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import {
  getYearAndSeason,
  getCurrentSession,
  createSession,
  addPlayerToSession,
  removePlayerFromSession,
  updateSessionDate,
  getPlayers,
} from "../../../services/api.js";
import { useNavigate } from "react-router-dom";
import Tooltip from "../../../components/Tooltip.jsx";

registerLocale("fr", fr);

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
  const [showDateEdit, setShowDateEdit] = useState(false);
  const [dateValue, setDateValue] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const g = await getYearAndSeason();
      setGlobal(g);
      const s = await getCurrentSession();
      setSession(s);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (session?.session_date) {
      setDateValue(new Date(session.session_date));
    } else {
      setDateValue(null);
    }
  }, [session]);

  const handleCreate = async () => {
    if (!global) return;
    if (!window.confirm(`Créer la session ${SEASON_LABELS[global.season]} ${global.year} ?`)) return;
    try {
      const s = await createSession({ year: global.year, season: global.season });
      setSession(s);
    } catch {
      alert("❌ Échec de la création");
    }
  };

  const openAddModal = async () => {
    try {
      const list = await getPlayers("Admin");
      setAllPlayers(list || []);
      setShowAddModal(true);
    } catch {
      alert("❌ Impossible de charger la liste");
    }
  };

  const handleAddPlayer = async (playerId) => {
    try {
      const updated = await addPlayerToSession(session.id, playerId);
      setSession(updated);
      setShowAddModal(false);
    } catch {
      alert("❌ Échec de l’ajout");
    }
  };

  const openRemoveModal = () => setShowRemoveModal(true);
  const handleRemovePlayer = async (playerId) => {
    try {
      const updated = await removePlayerFromSession(session.id, playerId);
      setSession(updated);
      setShowRemoveModal(false);
    } catch {
      alert("❌ Échec du retrait");
    }
  };

  const handleSaveDate = async () => {
    if (!dateValue) return;
    try {
      const updated = await updateSessionDate(session.id, dateValue.toISOString());
      setSession(updated);
      setShowDateEdit(false);
    } catch {
      alert("❌ Échec de la mise à jour");
    }
  };

  const formatDateFR = (iso) => {
    const dt = new Date(iso);
    return dt.toLocaleString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) return <p className="text-gray-400">Chargement…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <motion.div
      className="relative bg-gray-800 p-6 rounded-lg shadow-lg space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ▷ rafraîchir */}
      <button
        onClick={loadData}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-200"
        aria-label="Rafraîchir"
      >
        <FaSyncAlt />
      </button>

      <h2 className="flex items-center text-2xl font-semibold text-white space-x-2">
        <FaClipboardList /> <span>Gestion de session</span>
      </h2>

      {session ? (
        <>
          {/*  ▷ Saison & année */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded flex items-center space-x-3">
              <FaCalendarAlt className="text-green-300 text-xl" />
              <div>
                <p className="text-gray-300 text-sm">Session active</p>
                <p className="text-white font-medium">
                  {SEASON_LABELS[session.season]} {session.year}
                </p>
              </div>
            </div>

            {/*  ▷ Date de session */}
            <div className="bg-gray-700 p-4 rounded flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Date de session</p>
                <p className="text-white font-medium">
                  {session.session_date ? formatDateFR(session.session_date) : "Non définie"}
                </p>
              </div>
              <button
                onClick={() => setShowDateEdit(!showDateEdit)}
                className="text-gray-400 hover:text-gray-200"
                aria-label="Modifier la date"
              >
                <FaCalendarAlt />
              </button>
            </div>
          </div>

          {/*  ▷ Édition de la date */}
          <AnimatePresence>
            {showDateEdit && (
              <motion.div
                className="mt-2 p-4 bg-gray-700 rounded flex items-center space-x-3"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <DatePicker
                  selected={dateValue}
                  onChange={setDateValue}
                  showTimeSelect
                  locale="fr"
                  dateFormat="dd/MM/yyyy 'à' HH:mm"
                  className="w-full bg-gray-600 text-white p-2 rounded"
                />
                <button
                  onClick={handleSaveDate}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded"
                  aria-label="Sauvegarder la date"
                >
                  💾
                </button>
                <button
                  onClick={() => setShowDateEdit(false)}
                  className="text-gray-400 hover:text-gray-200 px-2"
                  aria-label="Annuler"
                >
                  ✖
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/*  ▷ Statistiques joueurs / futures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Tooltip text={session.players.map(p => p.pseudo_minecraft || p.name).join(", ") || "Aucun"}>
              <div className="bg-gray-700 p-4 rounded flex items-center space-x-3 cursor-help">
                <FaUserPlus className="text-blue-400 text-xl" />
                <div>
                  <p className="text-gray-300 text-sm">Joueurs inscrits</p>
                  <p className="text-white font-medium">{session.players_count}</p>
                </div>
              </div>
            </Tooltip>
            <Tooltip text={session.futures_players.join(", ") || "Aucune"}>
              <div className="bg-gray-700 p-4 rounded flex items-center space-x-3 cursor-help">
                <FaUserMinus className="text-yellow-400 text-xl" />
                <div>
                  <p className="text-gray-300 text-sm">Futures liées</p>
                  <p className="text-white font-medium">{session.futures_count}</p>
                </div>
              </div>
            </Tooltip>
          </div>

          {/*  ▷ Actions principales */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => navigate(`/admin/sessions/${session.id}/players-futures`)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white transition"
            >
              Voir le récap
            </button>
            <button
              onClick={openAddModal}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded text-gray-900 transition"
            >
              Ajouter un joueur
            </button>
            <button
              onClick={openRemoveModal}
              className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-white transition"
            >
              Retirer un joueur
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-gray-400">
            Pas de session pour{" "}
            <strong className="text-white">
              {SEASON_LABELS[global.season]} {global.year}
            </strong>
          </p>
          <button
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded text-white transition"
          >
            Créer la session
          </button>
        </div>
      )}

      {/* ───────── Modals ───────── */}
      <AnimatePresence>
        {showAddModal && (
          <Modal onClose={() => setShowAddModal(false)}>
            <h3 className="text-xl mb-4">Ajouter un joueur</h3>
            <ul className="divide-y divide-gray-600">
              {allPlayers.map((p) => (
                <li
                  key={p.id}
                  className="py-2 flex justify-between items-center hover:bg-gray-700 px-3 rounded"
                >
                  <span>{p.pseudo_minecraft || p.name}</span>
                  <button
                    onClick={() => handleAddPlayer(p.id)}
                    className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-white"
                  >
                    ＋
                  </button>
                </li>
              ))}
            </ul>
          </Modal>
        )}

        {showRemoveModal && (
          <Modal onClose={() => setShowRemoveModal(false)}>
            <h3 className="text-xl mb-4">Retirer un joueur</h3>
            <ul className="divide-y divide-gray-600">
              {session.players.length > 0 ? (
                session.players.map((p) => (
                  <li
                    key={p.id}
                    className="py-2 flex justify-between items-center hover:bg-gray-700 px-3 rounded"
                  >
                    <span>{p.pseudo_minecraft || p.name}</span>
                    <button
                      onClick={() => handleRemovePlayer(p.id)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white"
                    >
                      －
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-400">Aucun joueur à retirer.</p>
              )}
            </ul>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Petit composant Modal pour factoriser le fond et l'animation
 */
function Modal({ children, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-auto"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
