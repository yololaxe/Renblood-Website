// src/pages/admin/PlayerEdit.jsx
import React, { useState } from "react";
import { FaEdit, FaSave, FaChevronDown, FaChevronUp } from "react-icons/fa";
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
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (label) =>
    setOpenSection(openSection === label ? null : label);

  const STAT_BLOCKS = [
    {
      label: "👤 Identité",
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
      label: "💪 Attributs de base",
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
      label: "🔮 Compétences",
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
  const STAT_EXPERIENCE = [{ label: "📜 Expériences métiers", fields: experienceFields }];

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
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.03 }}
          className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white font-semibold shadow"
          onClick={handleSaveClick}
        >
          <FaSave /> <span>Enregistrer</span>
        </motion.button>
      </div>

      {/* Editable Panels */}
      {[...STAT_BLOCKS, ...STAT_EXPERIENCE].map(({ label, fields }) => (
        <motion.div
          key={label}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <button
            className="w-full flex justify-between items-center bg-gray-700 px-6 py-3 hover:bg-gray-600 transition"
            onClick={() => toggleSection(label)}
          >
            <h3 className="text-xl font-bold text-white">{label}</h3>
            <span className="text-xl text-gray-300">
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
                className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {fields.map(({ key, icon, label: lbl, type, options, rows, initialValue }) => {
                  const val = editedData[id]?.[key] ?? initialValue ?? player[key] ?? "";
                  const isEd = editing[id]?.[key];
                  return (
                    <div
                      key={key}
                      className="flex items-start bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition cursor-pointer"
                      onClick={() => !isEd && startEdit(id, key, val)}
                    >
                      <span className="text-2xl mr-3">{icon}</span>
                      <div className="flex-1">
                        <label className="block text-gray-200 mb-1 font-medium">{lbl}</label>
                        {isEd ? (
                          type === "textarea" ? (
                            <textarea
                              rows={rows}
                              autoFocus
                              className="w-full bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={val}
                              onChange={(e) => changeField(id, key, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : type === "select" ? (
                            <select
                              autoFocus
                              className="w-full bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
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
                              className="w-full bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={val}
                              onChange={(e) =>
                                changeField(id, key, type === "number" ? Number(e.target.value) : e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          )
                        ) : (
                          <p className="text-gray-200">{val}</p>
                        )}
                      </div>
                      {!isEd && (
                        <button
                          className="ml-3 text-gray-400 hover:text-white"
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
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Bonus résumé</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(player.real_charact || {}).map(([statKey, bonusArr]) => {
            const base = player[statKey] ?? 0;
            const arr = Array.isArray(bonusArr) ? bonusArr : bonusArr ? [bonusArr] : [];
            const totalBonus = arr.reduce((sum, b) => sum + b.count, 0);
            const total = base + totalBonus;
            const label =
              STAT_BLOCKS.concat(STAT_EXPERIENCE)
                .flatMap((b) => b.fields)
                .find((f) => f.key === statKey)?.label || formatTypeLabel(statKey);

            return (
              <div
                key={statKey}
                className="bg-gray-700 rounded-xl p-4 flex flex-col items-center text-center gap-y-2 hover:bg-gray-600 transition"
              >
                <p className="text-white font-semibold">{label}</p>
                <p className="text-white text-lg flex items-center gap-2 justify-center">
                  {total}
                  {arr.length > 0 && (
                    <ToolTip
                      text={
                        `Base: ${base}` +
                        arr.map((b) => {
                          const typeLabel = formatTypeLabel(
                            b.type.replace(/^talent_tree_/, "")
                          );
                          return `, +${b.count} (${typeLabel})`;
                        }).join("")
                      }
                    >
                      <span className="text-sm text-green-300">
                        {arr.map((b) => `+${b.count}`).join(" ")}
                      </span>
                    </ToolTip>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
