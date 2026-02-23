// src/components/SessionManagerWidget.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker, { registerLocale } from "react-datepicker";
import { FaSyncAlt, FaCalendarAlt, FaUserPlus, FaUserMinus, FaClipboardList, FaPlus, FaTrash, FaEye } from "react-icons/fa";
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
      const list = await getPlayers("Admin"); // TODO: Récupérer tous les joueurs, pas juste Admin
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

  if (loading) return <p className="text-gray-400 text-center py-10">Chargement…</p>;
  if (error)   return <p className="text-red-500 text-center py-10">{error}</p>;

  return (
    <div className="h-full flex flex-col gap-6 relative">
      {/* ▷ rafraîchir */}
      <button
        onClick={loadData}
        className="absolute top-0 right-0 text-gray-500 hover:text-gray-200 transition"
        aria-label="Rafraîchir"
      >
        <FaSyncAlt />
      </button>

      {session ? (
        <>
          {/*  ▷ Saison & année */}
          <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-3 rounded-lg text-white">
                <FaCalendarAlt size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Session Active</p>
                <p className="text-xl font-bold text-white">
                  {SEASON_LABELS[session.season]} {session.year}
                </p>
              </div>
            </div>
          </div>

          {/*  ▷ Date de session */}
          <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Date Prévue</p>
              <p className="text-white font-medium">
                {session.session_date ? formatDateFR(session.session_date) : "Non définie"}
              </p>
            </div>
            <button
              onClick={() => setShowDateEdit(!showDateEdit)}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition"
            >
              <FaCalendarAlt />
            </button>
          </div>

          {/*  ▷ Édition de la date */}
          <AnimatePresence>
            {showDateEdit && (
              <motion.div
                className="p-4 bg-gray-700 rounded-xl flex items-center gap-2 border border-gray-600"
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
                  className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                />
                <button onClick={handleSaveDate} className="bg-blue-600 hover:bg-blue-500 p-2 rounded text-white"><FaCheck /></button>
                <button onClick={() => setShowDateEdit(false)} className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-white"><FaTimes /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/*  ▷ Statistiques */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600 text-center">
              <p className="text-2xl font-bold text-blue-400">{session.players_count}</p>
              <p className="text-xs text-gray-400 uppercase">Inscrits</p>
            </div>
            <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600 text-center">
              <p className="text-2xl font-bold text-yellow-400">{session.futures_count}</p>
              <p className="text-xs text-gray-400 uppercase">Futures</p>
            </div>
          </div>

          {/*  ▷ Actions principales */}
          <div className="grid grid-cols-1 gap-2 mt-auto">
            <button
              onClick={() => navigate(`/admin/sessions/${session.id}/players-futures`)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-white font-bold transition"
            >
              <FaEye /> Voir le récapitulatif
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-green-400 font-bold border border-gray-600 transition"
              >
                <FaPlus /> Joueur
              </button>
              <button
                onClick={openRemoveModal}
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-red-400 font-bold border border-gray-600 transition"
              >
                <FaTrash /> Joueur
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
          <p className="text-gray-400">
            Pas de session pour <br/>
            <strong className="text-white text-lg">
              {SEASON_LABELS[global?.season]} {global?.year}
            </strong>
          </p>
          <button
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition transform hover:scale-105"
          >
            Créer la session
          </button>
        </div>
      )}

      {/* ───────── Modals ───────── */}
      <AnimatePresence>
        {showAddModal && (
          <Modal onClose={() => setShowAddModal(false)} title="Ajouter un joueur">
            <ul className="divide-y divide-gray-700 max-h-60 overflow-y-auto">
              {allPlayers.map((p) => (
                <li key={p.id} className="py-3 flex justify-between items-center hover:bg-gray-700/50 px-2 rounded transition">
                  <span className="text-gray-200">{p.pseudo_minecraft || p.name}</span>
                  <button onClick={() => handleAddPlayer(p.id)} className="bg-green-600 hover:bg-green-500 p-1.5 rounded text-white text-xs"><FaPlus /></button>
                </li>
              ))}
            </ul>
          </Modal>
        )}

        {showRemoveModal && (
          <Modal onClose={() => setShowRemoveModal(false)} title="Retirer un joueur">
            <ul className="divide-y divide-gray-700 max-h-60 overflow-y-auto">
              {session.players.length > 0 ? (
                session.players.map((p) => (
                  <li key={p.id} className="py-3 flex justify-between items-center hover:bg-gray-700/50 px-2 rounded transition">
                    <span className="text-gray-200">{p.pseudo_minecraft || p.name}</span>
                    <button onClick={() => handleRemovePlayer(p.id)} className="bg-red-600 hover:bg-red-500 p-1.5 rounded text-white text-xs"><FaTrash /></button>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun joueur à retirer.</p>
              )}
            </ul>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800 text-white rounded-xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes /></button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Icônes manquantes pour le fix
import { FaCheck, FaTimes } from "react-icons/fa";
