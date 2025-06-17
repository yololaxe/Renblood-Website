// src/pages/admin/PlayerEdit.jsx
import React, { useState } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import { updatePlayer, updateJobLevel } from "../../services/api";

// Hook pour gérer l’état d’édition
const useEditingState = () => {
  const [editing, setEditing] = useState({});
  const [editedData, setEditedData] = useState({});

  const startEdit = (playerId, field, currentValue) => {
    setEditing(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: true }
    }));
    setEditedData(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: currentValue }
    }));
  };

  const changeField = (playerId, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: value }
    }));
  };

  const saveAll = async (playerId, setPlayers) => {
    const payload = editedData[playerId];
    const res = await updatePlayer(playerId, payload);
    if (res) {
      // mise à jour locale
      setPlayers(prev =>
        prev.map(p => (p.id === playerId ? { ...p, ...payload } : p))
      );
      return payload;  // retourne le payload pour post-traitement
    } else {
      alert("❌ Erreur lors de l'enregistrement.");
      return null;
    }
  };

  return { editing, editedData, startEdit, changeField, saveAll };
};

export default function PlayerEdit({
  player,
  setPlayers,
  handleUpdate,
  onSaveSuccess,
}) {
  const { editing, editedData, startEdit, changeField, saveAll } =
    useEditingState();
  const id = player.id;

  // Blocs de champs fixes
  const STAT_BLOCKS = [
    {
      label: "Identité",
      fields: [
        { key: "pseudo_minecraft", icon: "🎮", label: "Pseudo", type: "text" },
        { key: "name", icon: "📛", label: "Prénom", type: "text" },
        { key: "surname", icon: "🏷️", label: "Nom", type: "text" },
        { key: "description", icon: "📄", label: "Description", type: "textarea", rows: 3 },
        {
          key: "rank",
          icon: "🎖️",
          label: "Rang",
          type: "select",
          options: [
            "Esclave","Etranger","Villageois","Citoyen","Citoyen Libre",
            "Patricien","Noble","Seigneur","Vicompte","Compte","Marquis",
            "Moderateur","Admin"
          ],
        },
        { key: "money", icon: "💰", label: "Argent", type: "number" },
        {
          key: "divin",
          icon: "🔮",
          label: "Divinité",
          type: "select",
          options: [
            "aucun","Ardorium","Sylvaria","Inquisora","Solanaré",
            "Aurelios","Explorien","Ignotembris","Ombrelume","Scénarche",
            "Glacilune","Nevrosante","Érudihiver"
          ],
        },
      ],
    },
    {
      label: "Attributs de base",
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

  // Construction dynamique du bloc Expériences métiers
  const experienceFields = Object.entries(player.experiences?.jobs || {}).map(
    ([jobKey, job]) => ({
      key: `experiences.jobs.${jobKey}.xp`,
      icon: "📈",
      label: `${jobKey.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())} XP`,
      type: "number",
      initialValue: job.xp,
    })
  );
  const STAT_EXPERIENCE = [
    {
      label: "Expériences métiers",
      fields: experienceFields,
    },
  ];

  // Sauvegarde + recalcul niveaux + callback
  const handleSaveClick = async () => {
    const payload = await saveAll(id, setPlayers);
    if (!payload) return;

    // Recalculer chaque métier dont l'XP a été mise à jour
    const xpKeys = Object.keys(payload).filter(
      k => k.startsWith("experiences.jobs.") && k.endsWith(".xp")
    );
    await Promise.all(
      xpKeys.map(key => {
        const jobName = key.split(".")[2];
        return updateJobLevel(id, jobName);
      })
    );

    handleUpdate();
    onSaveSuccess?.();
  };

  return (
    <div className="space-y-8 bg-gray-700 p-6 rounded-lg shadow-lg">
      {[...STAT_BLOCKS, ...STAT_EXPERIENCE].map(({ label, fields }) => (
        <div key={label} className="space-y-4">
          <h4 className="text-white font-semibold border-b border-gray-600 pb-1">
            {label}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(({ key, icon, label: lbl, type, options, rows, initialValue }) => {
              const val = editedData[id]?.[key] ?? initialValue ?? player[key] ?? "";
              const isEd = editing[id]?.[key];

              return (
                <div
                  key={key}
                  className="flex items-center bg-gray-800 rounded px-3 py-2 cursor-pointer hover:bg-gray-700"
                  onClick={() => !isEd && startEdit(id, key, val)}
                >
                  <span className="mr-2">{icon}</span>
                  <span className="mr-4 font-medium">{lbl}:</span>

                  {isEd ? (
                    type === "textarea" ? (
                      <textarea
                        rows={rows}
                        autoFocus
                        className="flex-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 resize-y rounded p-1"
                        value={val}
                        onChange={e => changeField(id, key, e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : type === "select" ? (
                      <select
                        autoFocus
                        className="flex-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                        value={val}
                        onChange={e => changeField(id, key, e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        {options.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        autoFocus
                        type={type}
                        className="flex-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                        value={val}
                        onChange={e =>
                          changeField(id, key, type === "number" ? Number(e.target.value) : e.target.value)
                        }
                        onClick={e => e.stopPropagation()}
                      />
                    )
                  ) : (
                    <span className="flex-1 text-gray-100">{val}</span>
                  )}

                  {!isEd && (
                    <button
                      className="ml-2 text-gray-400 hover:text-white"
                      onClick={e => {
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
          </div>
        </div>
      ))}

      <button
        className="w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg flex items-center justify-center space-x-2"
        onClick={handleSaveClick}
      >
        <FaSave /> <span>Enregistrer</span>
      </button>
    </div>
  );
}
