// src/pages/admin/PlayerEdit.jsx
import React, { useState } from "react";
import { FaEdit, FaSave, FaChevronDown, FaChevronUp, FaUser, FaBolt, FaMagic, FaScroll } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { updatePlayer, updateJobLevel } from "../../services/api";
import ToolTip from "../../components/Tooltip";

// Hook to manage editing state
const useEditingState = () => {
  const [editing, setEditing] = useState({});
  const [editedData, setEditedData] = useState({});

  const startEdit = (playerId, field, currentValue) => {
    setEditing((e) => ({
      ...e,
      [playerId]: { ...e[playerId], [field]: true },
    }));
    setEditedData((d) => ({
      ...d,
      [playerId]: { ...d[playerId], [field]: currentValue },
    }));
  };

  const changeField = (playerId, field, value) => {
    setEditedData((d) => ({
      ...d,
      [playerId]: { ...d[playerId], [field]: value },
    }));
  };

  const saveAll = async (playerId, setPlayers) => {
    const payload = editedData[playerId];
    const res = await updatePlayer(playerId, payload);
    if (res) {
      setPlayers((list) =>
        list.map((p) => (p.id === playerId ? { ...p, ...payload } : p))
      );
      return payload;
    }
    alert("❌ Erreur lors de l'enregistrement.");
    return null;
  };

  return { editing, editedData, startEdit, changeField, saveAll };
};

// Utility to prettify bonus type keys
const formatTypeLabel = (raw) =>
  raw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function PlayerEdit({
  player,
  setPlayers,
  handleUpdate,
  onSaveSuccess,
}) {
  const { editing, editedData, startEdit, changeField, saveAll } =
    useEditingState();
  const id = player.id;
  const [openSection, setOpenSection] = useState("Identité"); // Open first by default
  const toggleSection = (label) =>
    setOpenSection(openSection === label ? null : label);

  const STAT_BLOCKS = [
    {
      label: "Identité",
      icon: <FaUser />,
      fields: [
        { key: "pseudo_minecraft", icon: "🎮", label: "Pseudo", type: "text" },
        { key: "name", icon: "📛", label: "Prénom", type: "text" },
        { key: "surname", icon: "🏷️", label: "Nom", type: "text" },
        {
          key: "description",
          icon: "📄",
          label: "Description",
          type: "textarea",
          rows: 3,
        },
        {
          key: "rank",
          icon: "🎖️",
          label: "Rang",
          type: "select",
          options: [
            "Esclave",
            "Etranger",
            "Villageois",
            "Citoyen",
            "Citoyen Libre",
            "Patricien",
            "Noble",
            "Seigneur",
            "Vicompte",
            "Compte",
            "Marquis",
            "Moderateur",
            "Admin",
          ],
        },
        { key: "money", icon: "💰", label: "Argent", type: "number" },
        {
          key: "divin",
          icon: "🔮",
          label: "Divinité",
          type: "select",
          options: [
            "aucun",
            "Ardorium",
            "Sylvaria",
            "Inquisora",
            "Solanaré",
            "Aurelios",
            "Explorien",
            "Ignotembris",
            "Ombrelume",
            "Scénarche",
            "Glacilune",
            "Nevrosante",
            "Érudihiver",
          ],
        },
      ],
    },
    {
      label: "Attributs de base",
      icon: <FaBolt />,
      fields: [
        { key: "life", icon: "❤️", label: "Vie", type: "number" },
        { key: "strength", icon: "💪", label: "Force", type: "number" },
        { key: "speed", icon: "⚡", label: "Vitesse", type: "number" },
        { key: "reach", icon: "🎯", label: "Portée", type: "number" },
        { key: "resistance", icon: "🛡️", label: "Résistance", type: "number" },
        { key: "regeneration", icon: "💖", label: "Régénération", type: "number" },
        { key: "haste", icon: "⛏️", label: "Célérité", type: "number" },
        { key: "place", icon: "📦", label: "Inventaire", type: "number" },
      ],
    },
    {
      label: "Compétences",
      icon: <FaMagic />,
      fields: [
        { key: "mana", icon: "🔮", label: "Mana", type: "number" },
        { key: "dodge", icon: "🏃", label: "Esquive", type: "number" },
        { key: "discretion", icon: "🕵️", label: "Discrétion", type: "number" },
        { key: "charisma", icon: "😎", label: "Charisme", type: "number" },
        { key: "rethoric", icon: "📢", label: "Rhétorique", type: "number" },
        { key: "negotiation", icon: "🤝", label: "Négociation", type: "number" },
        { key: "influence", icon: "👑", label: "Influence", type: "number" },
        { key: "skill", icon: "🎓", label: "Compétence", type: "number" },
      ],
    },
  ];

  const experienceFields = Object.entries(player.experiences?.jobs || {}).map(
    ([jobKey, job]) => ({
      key: `experiences.jobs.${jobKey}.xp`,
      icon: "📈",
      label: `${jobKey
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())} XP`,
      type: "number",
      initialValue: job.xp,
    })
  );
  const STAT_EXPERIENCE = [{ label: "Expériences métiers", icon: <FaScroll />, fields: experienceFields }];

  const handleSaveClick = async () => {
    const payload = await saveAll(id, setPlayers);
    if (!payload) return;
    const xpKeys = Object.keys(payload).filter(
      (k) => k.startsWith("experiences.jobs.") && k.endsWith(".xp")
    );
    await Promise.all(
      xpKeys.map((key) => {
        const jobName = key.split(".")[2];
        return updateJobLevel(id, jobName);
      })
    );
    handleUpdate();
    onSaveSuccess?.();
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end sticky top-0 z-10 bg-gray-800/90 backdrop-blur-sm py-2 border-b border-gray-700">
        <motion.button
          whileHover={{ scale: 1.03 }}
          className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white font-semibold shadow-lg"
          onClick={handleSaveClick}
        >
          <FaSave /> <span>Enregistrer les modifications</span>
        </motion.button>
      </div>

      {/* Editable Panels */}
      {[...STAT_BLOCKS, ...STAT_EXPERIENCE].map(({ label, icon, fields }) => (
        <motion.div
          key={label}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 rounded-xl shadow-md border border-gray-700 overflow-hidden"
        >
          <button
            className="w-full flex justify-between items-center bg-gray-750 px-6 py-4 hover:bg-gray-700 transition"
            onClick={() => toggleSection(label)}
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="text-blue-400">{icon}</span> {label}
            </h3>
            <span className="text-gray-400">
              {openSection === label ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {openSection === label && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-800"
              >
                {fields.map(({ key, icon: fieldIcon, label: lbl, type, options, rows, initialValue }) => {
                  const val = editedData[id]?.[key] ?? initialValue ?? player[key] ?? "";
                  const isEd = editing[id]?.[key];
                  return (
                    <div
                      key={key}
                      className={`flex items-start rounded-lg p-3 transition cursor-pointer border ${isEd ? 'bg-gray-700 border-blue-500/50' : 'bg-gray-700/50 border-transparent hover:border-gray-600'}`}
                      onClick={() => !isEd && startEdit(id, key, val)}
                    >
                      <span className="text-xl mr-3 mt-1">{fieldIcon}</span>
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{lbl}</label>
                        {isEd ? (
                          type === "textarea" ? (
                            <textarea
                              rows={rows}
                              autoFocus
                              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none text-sm"
                              value={val}
                              onChange={(e) => changeField(id, key, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : type === "select" ? (
                            <select
                              autoFocus
                              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none text-sm"
                              value={val}
                              onChange={(e) => changeField(id, key, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {options.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              autoFocus
                              type={type}
                              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none text-sm"
                              value={val}
                              onChange={(e) =>
                                changeField(id, key, type === "number" ? Number(e.target.value) : e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          )
                        ) : (
                          <p className="text-white text-sm truncate">{val !== "" ? val : <span className="text-gray-500 italic">Vide</span>}</p>
                        )}
                      </div>
                      {!isEd && (
                        <button
                          className="ml-2 text-gray-500 hover:text-blue-400 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(id, key, val);
                          }}
                        >
                          <FaEdit />
                        </button>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* Bonus résumé */}
      <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaMagic className="text-purple-400" /> Bonus actifs
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(player.real_charact || {}).map(([statKey, bonusArr]) => {
            const base = player[statKey] ?? 0;
            const arr = Array.isArray(bonusArr) ? bonusArr : bonusArr ? [bonusArr] : [];
            const totalBonus = arr.reduce((sum, b) => sum + b.count, 0);
            const total = base + totalBonus;
            const label =
              STAT_BLOCKS.concat(STAT_EXPERIENCE)
                .flatMap((b) => b.fields)
                .find((f) => f.key === statKey)?.label || formatTypeLabel(statKey);

            if (totalBonus === 0) return null;

            return (
              <div
                key={statKey}
                className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 flex flex-col items-center text-center"
              >
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">{label}</p>
                <p className="text-white font-mono text-lg">
                  {total} <span className="text-green-400 text-sm">(+{totalBonus})</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
