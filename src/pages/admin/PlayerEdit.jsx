// src/pages/admin/PlayerEdit.jsx
import { useState } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import { updatePlayer } from "../../services/api";

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
      setPlayers(prev =>
        prev.map(p => (p.id === playerId ? { ...p, ...payload } : p))
      );
      return true;
    } else {
      alert("❌ Erreur lors de l'enregistrement.");
      return false;
    }
  };

  return { editing, editedData, startEdit, changeField, saveAll };
};

export default function PlayerEdit({
  player,
  setPlayers,
  handleUpdate,
  onSaveSuccess,      // ← nouveau
}) {
  const { editing, editedData, startEdit, changeField, saveAll } =
    useEditingState();
  const id = player.id;

  // blocs / champs à afficher
  const STAT_BLOCKS = [
    {
      label: "Identité",
      fields: [
        { key: "pseudo_minecraft", icon: "🎮", label: "Pseudo",       type: "text"     },
        { key: "name",            icon: "📛", label: "Prénom",       type: "text"     },
        { key: "surname",         icon: "🏷️", label: "Nom",          type: "text"     },
        { key: "description",     icon: "📄", label: "Description", type: "textarea", rows: 3 },
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
        { key: "money", icon: "💰", label: "Argent",   type: "number" },
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
      fields: [
        { key: "life",       icon: "❤️", label: "Vie",        type: "number" },
        { key: "strength",   icon: "💪", label: "Force",      type: "number" },
        { key: "speed",      icon: "⚡", label: "Vitesse",    type: "number" },
        { key: "reach",      icon: "🎯", label: "Portée",     type: "number" },
        { key: "resistance", icon: "🛡️", label: "Résistance", type: "number" },
        { key: "regeneration",icon: "💖", label: "Régénération",type: "number" },
        { key: "haste",       icon: "⛏️", label: "Célérité",    type: "number" },
        { key: "place",       icon: "📦", label: "Inventaire",  type: "number" },
      ],
    },
    {
      label: "Compétences",
      fields: [
        { key: "mana",        icon: "🔮", label: "Mana",       type: "number" },
        { key: "dodge",       icon: "🏃", label: "Esquive",     type: "number" },
        { key: "discretion",  icon: "🕵️", label: "Discrétion",  type: "number" },
        { key: "charisma",    icon: "😎", label: "Charisme",   type: "number" },
        { key: "rethoric",    icon: "📢", label: "Rhétorique", type: "number" },
        { key: "negotiation", icon: "🤝", label: "Négociation",type: "number" },
        { key: "influence",   icon: "👑", label: "Influence",  type: "number" },
        { key: "skill",       icon: "🎓", label: "Compétence", type: "number" },
      ],
    },
  ];

  // wrapper qui sauvegarde + ferme + toast
  const handleSaveClick = async () => {
    const ok = await saveAll(id, setPlayers);
    if (ok) {
      handleUpdate();
      onSaveSuccess?.();           // ← ferme et affiche le toast
    }
  };

  return (
    <div className="space-y-8 bg-gray-700 p-6 rounded-lg shadow-lg">
      {STAT_BLOCKS.map(({ label, fields }) => (
        <div key={label} className="space-y-4">
          <h4 className="text-white font-semibold border-b border-gray-600 pb-1">
            {label}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(({ key, icon, label: lbl, type, options, rows }) => {
              const val = editedData[id]?.[key] ?? player[key] ?? "";
              const isEd = editing[id]?.[key];

              return (
                <div
                  key={key}
                  className="flex items-center bg-gray-800 rounded px-3 py-2 cursor-pointer hover:bg-gray-700"
                  onClick={() => !isEd && startEdit(id, key, player[key])}
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
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        autoFocus
                        type={type}
                        className="flex-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                        value={val}
                        onChange={e =>
                          changeField(
                            id,
                            key,
                            type === "number" ? Number(e.target.value) : e.target.value
                          )
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
                        startEdit(id, key, player[key]);
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
        onClick={handleSaveClick}  // ← use the wrapper
      >
        <FaSave /> <span>Enregistrer</span>
      </button>
    </div>
  );
}
