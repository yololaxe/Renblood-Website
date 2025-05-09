// src/pages/admin/PlayerTraitAction.jsx
import { useState, useEffect } from "react";
import {
  getTraits,
  getActions,
  addTraitToPlayer,
  removeTraitFromPlayer,
  addActionToPlayer,
  removeActionFromPlayer,
} from "../../services/api";

export default function PlayerTraitAction({
  player,
  setPlayers,
}) {
  const [availableTraits, setAvailableTraits] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);
  const [selectedTab, setSelectedTab] = useState("traits");
  const [selectedItem, setSelectedItem] = useState("");
  const [traitsList, setTraitsList]   = useState(player.traits || []);
  const [actionsList, setActionsList] = useState(player.actions || []);

  // Sync local lists whenever parent player prop changes
  useEffect(() => {
    setTraitsList(player.traits || []);
    setActionsList(player.actions || []);
  }, [player.traits, player.actions]);

  // Load full catalogs
  useEffect(() => {
    getTraits().then(setAvailableTraits);
    getActions().then(setAvailableActions);
  }, []);

  // Filter out what the player already has
  const traitOptions = availableTraits.filter(
    t => !traitsList.some(existing => (existing.trait_id ?? existing.id) === t.trait_id)
  );
  const actionOptions = availableActions.filter(
    a => !actionsList.some(existing => (existing.action_id ?? existing.id) === a.action_id)
  );

  // Add handler
  const onAdd = () => {
    if (!selectedItem) return;
    if (selectedTab === "traits") {
      addTraitToPlayer(player.id, Number(selectedItem))
        .then(() => {
          const newTrait = availableTraits.find(t => t.trait_id === Number(selectedItem));
          const updated = [...traitsList, newTrait];
          setTraitsList(updated);
          setPlayers(prev => prev.map(p =>
            p.id === player.id ? { ...p, traits: updated } : p
          ));
        });
    } else {
      addActionToPlayer(player.id, Number(selectedItem))
        .then(() => {
          const newAction = availableActions.find(a => a.action_id === Number(selectedItem));
          const updated = [...actionsList, newAction];
          setActionsList(updated);
          setPlayers(prev => prev.map(p =>
            p.id === player.id ? { ...p, actions: updated } : p
          ));
        });
    }
    setSelectedItem("");
  };

  // Delete handlers
  const onDeleteTrait = (id, label) => {
    if (!window.confirm(`Supprimer le trait « ${label} » ?`)) return;
    removeTraitFromPlayer(player.id, id)
      .then(() => {
        const updated = traitsList.filter(t => (t.trait_id ?? t.id) !== id);
        setTraitsList(updated);
        setPlayers(prev => prev.map(p =>
          p.id === player.id ? { ...p, traits: updated } : p
        ));
      });
  };
  const onDeleteAction = (id, label) => {
    if (!window.confirm(`Supprimer l'action « ${label} » ?`)) return;
    removeActionToPlayer(player.id, id)
      .then(() => {
        const updated = actionsList.filter(a => (a.action_id ?? a.id) !== id);
        setActionsList(updated);
        setPlayers(prev => prev.map(p =>
          p.id === player.id ? { ...p, actions: updated } : p
        ));
      });
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg mt-6 space-y-4">
      {/* Tabs */}
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 rounded ${selectedTab === "traits" ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"}`}
          onClick={() => setSelectedTab("traits")}
        >
          Traits
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedTab === "actions" ? "bg-red-600 text-white" : "bg-gray-600 text-gray-200"}`}
          onClick={() => setSelectedTab("actions")}
        >
          Actions
        </button>
      </div>

      {/* Current list */}
      <div className="max-h-48 overflow-y-auto space-y-2">
        {selectedTab === "traits" ? (
          traitsList.length > 0 ? (
            traitsList.map(t => {
              const id = t.trait_id ?? t.id;
              const label = t.Name ?? t.name;
              return (
                <div key={id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <span>{label}</span>
                  <button
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded"
                    onClick={() => onDeleteTrait(id, label)}
                  >
                    ✖
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400">Aucun trait.</p>
          )
        ) : (
          actionsList.length > 0 ? (
            actionsList.map(a => {
              const id = a.action_id ?? a.id;
              const label = a.Name ?? a.name;
              return (
                <div key={id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <span>{label}</span>
                  <button
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded"
                    onClick={() => onDeleteAction(id, label)}
                  >
                    ✖
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400">Aucune action.</p>
          )
        )}
      </div>

      {/* Add select */}
      <div className="flex space-x-2 items-center">
        <select
          className="flex-1 bg-gray-800 p-2 rounded text-white"
          value={selectedItem}
          onChange={e => setSelectedItem(e.target.value)}
        >
          <option value="">Sélectionner...</option>
          {(selectedTab === "traits" ? traitOptions : actionOptions).map(item => (
            <option
              key={selectedTab === "traits" ? item.trait_id : item.action_id}
              value={selectedTab === "traits" ? item.trait_id : item.action_id}
            >
              {item.name}
            </option>
          ))}
        </select>
        <button
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
          onClick={onAdd}
        >
          ➕ Ajouter
        </button>
      </div>
    </div>
  );
}
