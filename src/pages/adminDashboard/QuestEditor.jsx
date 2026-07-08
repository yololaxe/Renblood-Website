import React, { useEffect, useState, useMemo, useCallback } from "react";
import Tree from "react-d3-tree";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPlus, FaSave, FaTrash, FaTimes, FaSearchPlus, FaSearchMinus, FaCompress, 
  FaEdit, FaUserAstronaut, FaCheckCircle, FaRunning, FaDiscord, FaCube, FaMapMarkerAlt, FaUserTie, FaHammer, FaTheaterMasks, FaSearch, FaPlay, FaBroom 
} from "react-icons/fa";
import {
  getQuestsList, createQuest, updateQuest, deleteQuest, getPlayers, getAllPlayerQuestStates, getNpcsList, updatePlayerQuestStatus, cancelPlayerQuestState
} from "../../services/api";
import { categories, specials } from "../../data/metiers";

const DEFAULT_QUEST = {
  questId: "",
  parentId: "",
  category: "Main",
  name: "Nouvelle Quête",
  type: "Solo",
  startNpcId: "",
  completionNpcId: "",
  description: { fr: "", en: "" },
  money: 0,
  xp: { job: "aventurier", amount: 0 },
  objectives: [],
  implementation: {
    status: "TODO",
    summary: "",
    tasks: []
  },
  rewards: [],
  prerequisitesAll: [],
  prerequisitesAny: [],
  beginText: { fr: "", en: "" },
  endText: { fr: "", en: "" }
};

const normalizeObjective = (objective) => ({
  ...objective,
  target: {
    ...(objective.target || {}),
    ...(objective.npcId && !objective.target?.npcId ? { npcId: objective.npcId } : {}),
    ...(objective.npcName && !objective.target?.npcName ? { npcName: objective.npcName } : {}),
    ...(objective.coord && !objective.target?.coord ? { coord: objective.coord } : {}),
    ...(objective.items && !objective.target?.items ? { items: objective.items } : {})
  }
});

const normalizeQuest = (quest = {}) => ({
  ...DEFAULT_QUEST,
  ...quest,
  startNpcId: quest.startNpcId || quest.quest_giver || quest.npc?.npc_id || quest.npc || "",
  startNpcName: quest.startNpcName || quest.quest_giver_name || quest.npc?.name || "",
  completionNpcId: quest.completionNpcId || quest.quest_validator || "",
  completionNpcName: quest.completionNpcName || quest.quest_validator_name || "",
  description: quest.description || { fr: "", en: "" },
  beginText: quest.beginText || { fr: "", en: "" },
  endText: quest.endText || { fr: "", en: "" },
  xp: quest.xp || { job: "aventurier", amount: 0 },
  prerequisitesAll: quest.prerequisitesAll || [],
  prerequisitesAny: quest.prerequisitesAny || [],
  objectives: (quest.objectives || []).map(normalizeObjective),
  rewards: quest.rewards || [],
  implementation: {
    ...DEFAULT_QUEST.implementation,
    ...(quest.implementation || {}),
    tasks: quest.implementation?.tasks || []
  }
});

const getObjectivePayload = ({ npcId, npcName, coord, items, target, ...objective }) => {
  const { npcName: targetNpcName, ...cleanTarget } = target || {};
  return {
    ...objective,
    target: cleanTarget
  };
};

const getQuestPayload = ({
  npc,
  npcId,
  npcName,
  startNpcName,
  completionNpcName,
  quest_giver,
  quest_giver_name,
  quest_validator,
  quest_validator_name,
  ...quest
}) => ({
  ...quest,
  objectives: (quest.objectives || []).map(getObjectivePayload)
});

const formatApiErrorValue = (value) => {
  if (Array.isArray(value)) return value.map(formatApiErrorValue).join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value).map(([field, detail]) => `${field}: ${formatApiErrorValue(detail)}`).join("; ");
  }
  return String(value);
};

const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  return Object.entries(data)
    .map(([field, messages]) => `${field}: ${formatApiErrorValue(messages)}`)
    .join("\n");
};

// Helper pour l'URL Discord
const getDiscordAvatarUrl = (discordId, avatarHash) => {
  if (!discordId || !avatarHash) return "/assets/default-avatar.png"; // Fallback local
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png`;
};

// --- Composants d'édition visuelle ---

const MoneyInput = ({ value, onChange }) => {
  const [parts, setParts] = useState({ or: 0, argent: 0, bronze: 0, fer: 0 });

  useEffect(() => {
    const or = Math.floor(value / 262144);
    const remOr = value % 262144;
    const argent = Math.floor(remOr / 4096);
    const remArgent = remOr % 4096;
    const bronze = Math.floor(remArgent / 64);
    const fer = remArgent % 64;
    setParts({ or, argent, bronze, fer });
  }, [value]);

  const handleChange = (part, val) => {
    const newParts = { ...parts, [part]: Number(val) || 0 };
    setParts(newParts);
    const total = (newParts.or * 262144) + (newParts.argent * 4096) + (newParts.bronze * 64) + newParts.fer;
    onChange(total);
  };

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Argent</label>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(parts).map(([part, val]) => (
          <div key={part}>
            <label className="text-xs text-gray-500 capitalize">{part}</label>
            <input 
              type="number" 
              value={val} 
              onChange={(e) => handleChange(part, e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ItemListEditor = ({ items, onChange, label }) => {
  const handleAddItem = () => {
    onChange([...items, { itemId: "", count: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold text-gray-400 uppercase">{label}</label>
        <button onClick={handleAddItem} className="text-green-400 hover:text-green-300 text-xs flex items-center gap-1">
          <FaPlus /> Ajouter Item
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="ID Item (ex: minecraft:stone)" 
              value={item.itemId} 
              onChange={(e) => handleItemChange(idx, "itemId", e.target.value)}
              className="flex-grow bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm"
            />
            <input 
              type="number" 
              placeholder="Qté" 
              value={item.count} 
              onChange={(e) => handleItemChange(idx, "count", Number(e.target.value))}
              className="w-16 bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm"
            />
            <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-400">
              <FaTrash />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-gray-500 italic">Aucun item.</p>}
      </div>
    </div>
  );
};

const NpcSelector = ({ value, onChange, npcs, label = "PNJ Donneur", allowDummy = true }) => {
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [isDummy, setIsDummy] = useState(value?.startsWith("dummy-") || false);
  const [dummyName, setDummyName] = useState(value?.replace("dummy-", "") || "");

  useEffect(() => {
    const nextIsDummy = allowDummy && value?.startsWith("dummy-");
    setIsDummy(Boolean(nextIsDummy));
    setDummyName(nextIsDummy ? value.replace("dummy-", "") : "");
  }, [value, allowDummy]);

  const filteredNpcs = npcs.filter(npc => 
    npc.name.toLowerCase().includes(search.toLowerCase()) || 
    (npc.region && npc.region.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (npc) => {
    onChange(npc.npc_id);
    setShowList(false);
    setIsDummy(false);
  };

  const handleDummyChange = (e) => {
    const val = e.target.value;
    setDummyName(val);
    onChange(`dummy-${val}`);
  };

  const toggleDummy = () => {
    if (!isDummy) {
      setIsDummy(true);
      onChange(`dummy-${dummyName}`);
    } else {
      setIsDummy(false);
      onChange("");
    }
  };
  
  const selectedNpcName = useMemo(() => {
    if (!value || value.startsWith("dummy-")) return value;
    const npc = npcs.find(n => n.npc_id === value);
    return npc ? npc.name : value;
  }, [value, npcs]);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-xs font-bold text-gray-400 uppercase">{label}</label>
        {value && !isDummy && (
          <button onClick={() => onChange("")} className="text-xs text-red-400 hover:text-red-300">
            Retirer
          </button>
        )}
        {allowDummy && (isDummy || !value) && (
          <button
            onClick={toggleDummy}
            className={`text-xs px-2 py-0.5 rounded border ${isDummy ? "bg-yellow-600 border-yellow-500 text-white" : "bg-gray-700 border-gray-600 text-gray-400"}`}
          >
            {isDummy ? "Mode Dummy Actif" : "Utiliser Dummy"}
          </button>
        )}
      </div>

      {isDummy ? (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">dummy-</span>
          <input 
            type="text" 
            value={dummyName} 
            onChange={handleDummyChange}
            placeholder="Nom du futur PNJ"
            className="flex-1 bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none"
          />
        </div>
      ) : (
        <>
          <div 
            className="flex items-center bg-gray-700 border border-gray-600 rounded p-2 cursor-pointer"
            onClick={() => setShowList(!showList)}
          >
            <FaUserTie className="text-gray-400 mr-2" />
            <span className="flex-1 text-white">{selectedNpcName || "Sélectionner un PNJ..."}</span>
            <FaSearch className="text-gray-500" />
          </div>

          {showList && (
            <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded shadow-xl max-h-60 overflow-y-auto">
              <input 
                type="text" 
                placeholder="Rechercher (nom, région)..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 bg-gray-900 border-b border-gray-700 text-white focus:outline-none sticky top-0"
                autoFocus
              />
              {filteredNpcs.map(npc => (
                <div 
                  key={npc.npc_id} 
                  onClick={() => handleSelect(npc)}
                  className="p-2 hover:bg-gray-700 cursor-pointer flex items-center gap-3 border-b border-gray-700/50 last:border-0"
                >
                  <img 
                    src={npc.profile_image || "/assets/NPCdefault.png"} 
                    alt={npc.name} 
                    className="w-8 h-8 rounded-full object-cover bg-gray-900"
                    onError={(e) => e.target.src = "/assets/NPCdefault.png"}
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{npc.name}</p>
                    <p className="text-xs text-gray-400">{npc.region}</p>
                  </div>
                </div>
              ))}
              {filteredNpcs.length === 0 && (
                <div className="p-3 text-center text-gray-500 text-sm">Aucun PNJ trouvé.</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ObjectivesEditor = ({ objectives, onChange, npcs }) => {
  const handleAddObjective = (type) => {
    let newObj = { type, target: {} };
    switch (type) {
      case "ITEM": newObj.target.items = []; break;
      case "LOCATION": newObj.target.coord = "x:0 y:0 z:0 r:5"; break;
      case "TALK": newObj.target.npcId = ""; break;
      case "CONSTRUCTION": newObj.validation = "ADMIN"; break;
      case "RP": newObj.validation = "ADMIN"; break;
      default: break;
    }
    onChange([...objectives, newObj]);
  };

  const handleRemoveObjective = (index) => {
    const newObjs = [...objectives];
    newObjs.splice(index, 1);
    onChange(newObjs);
  };

  const handleUpdateObjective = (index, newData) => {
    const newObjs = [...objectives];
    newObjs[index] = { ...newObjs[index], ...newData };
    onChange(newObjs);
  };

  const handleUpdateTarget = (index, newTargetData) => {
    const newObjs = [...objectives];
    newObjs[index] = {
      ...newObjs[index],
      target: { ...(newObjs[index].target || {}), ...newTargetData }
    };
    onChange(newObjs);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-2">
        <button onClick={() => handleAddObjective("ITEM")} className="px-2 py-1 bg-blue-600/50 hover:bg-blue-600 text-white text-xs rounded flex items-center gap-1" title="Récupérer des items">
          <FaCube /> Item
        </button>
        <button onClick={() => handleAddObjective("LOCATION")} className="px-2 py-1 bg-yellow-600/50 hover:bg-yellow-600 text-white text-xs rounded flex items-center gap-1" title="Aller à un endroit">
          <FaMapMarkerAlt /> Lieu
        </button>
        <button onClick={() => handleAddObjective("TALK")} className="px-2 py-1 bg-purple-600/50 hover:bg-purple-600 text-white text-xs rounded flex items-center gap-1" title="Parler à un PNJ">
          <FaUserTie /> PNJ
        </button>
        <button onClick={() => handleAddObjective("CONSTRUCTION")} className="px-2 py-1 bg-orange-600/50 hover:bg-orange-600 text-white text-xs rounded flex items-center gap-1" title="Construire quelque chose">
          <FaHammer /> Build
        </button>
        <button onClick={() => handleAddObjective("RP")} className="px-2 py-1 bg-pink-600/50 hover:bg-pink-600 text-white text-xs rounded flex items-center gap-1" title="Action RP">
          <FaTheaterMasks /> RP
        </button>
      </div>

      {objectives.map((obj, idx) => (
        <div key={idx} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 relative">
          <button onClick={() => handleRemoveObjective(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400">
            <FaTimes />
          </button>
          
          <div className="mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
              obj.type === "ITEM" ? "bg-blue-600" :
              obj.type === "LOCATION" ? "bg-yellow-600" :
              ["NPC", "TALK"].includes(obj.type) ? "bg-purple-600" :
              obj.type === "CONSTRUCTION" ? "bg-orange-600" : "bg-pink-600"
            }`}>{obj.type}</span>
          </div>

          {obj.type === "ITEM" && (
            <ItemListEditor 
              items={obj.target?.items || []}
              onChange={(items) => handleUpdateTarget(idx, { items })}
              label="Items requis"
            />
          )}

          {obj.type === "LOCATION" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Coordonnées (format: x:0 y:0 z:0 r:5)</label>
              <input 
                type="text" 
                value={obj.target?.coord || ""}
                onChange={(e) => handleUpdateTarget(idx, { coord: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm font-mono"
              />
            </div>
          )}

          {["NPC", "TALK"].includes(obj.type) && (
            <NpcSelector
              value={obj.target?.npcId || ""}
              onChange={(npcId) => handleUpdateTarget(idx, { npcId })}
              npcs={npcs}
              label="PNJ à rencontrer"
              allowDummy={false}
            />
          )}

          {(obj.type === "CONSTRUCTION" || obj.type === "RP") && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Validation</label>
              <select 
                value={obj.validation || "ADMIN"} 
                onChange={(e) => handleUpdateObjective(idx, { validation: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm"
              >
                <option value="ADMIN">ADMIN (Validation manuelle)</option>
                <option value="AUTO">AUTO (Automatique)</option>
              </select>
            </div>
          )}
        </div>
      ))}
      {objectives.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">Aucun objectif défini.</p>}
    </div>
  );
};

const ImplementationEditor = ({ implementation, onChange }) => {
  const data = implementation || DEFAULT_QUEST.implementation;
  const updateTask = (index, updates) => {
    const tasks = [...data.tasks];
    tasks[index] = { ...tasks[index], ...updates };
    onChange({ ...data, tasks });
  };

  const addTask = () => {
    onChange({
      ...data,
      tasks: [...data.tasks, { id: `task_${Date.now()}`, label: "", type: "BUILD", status: "TODO", notes: "" }]
    });
  };

  const removeTask = (index) => {
    onChange({ ...data, tasks: data.tasks.filter((_, taskIndex) => taskIndex !== index) });
  };

  return (
    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-orange-400 uppercase">Implémentation / choses à construire</h3>
        <button onClick={addTask} className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
          <FaPlus /> Ajouter une tâche
        </button>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">État global</label>
        <select value={data.status} onChange={(e) => onChange({ ...data, status: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white">
          {["TODO", "IN_PROGRESS", "BLOCKED", "DONE"].map(status => <option key={status}>{status}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Résumé</label>
        <textarea value={data.summary} onChange={(e) => onChange({ ...data, summary: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white h-20" />
      </div>
      <div className="space-y-3">
        {data.tasks.map((task, index) => (
          <div key={task.id || index} className="bg-gray-800 p-3 rounded border border-gray-600 space-y-2">
            <div className="flex gap-2">
              <input value={task.id || ""} onChange={(e) => updateTask(index, { id: e.target.value })} placeholder="ID" className="w-32 bg-gray-900 border border-gray-600 rounded p-1 text-white text-sm" />
              <input value={task.label || ""} onChange={(e) => updateTask(index, { label: e.target.value })} placeholder="Chose à construire/configurer" className="flex-1 bg-gray-900 border border-gray-600 rounded p-1 text-white text-sm" />
              <button onClick={() => removeTask(index)} className="text-red-500 hover:text-red-400"><FaTrash /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={task.type || ""} onChange={(e) => updateTask(index, { type: e.target.value })} placeholder="Type, ex: BUILD" className="bg-gray-900 border border-gray-600 rounded p-1 text-white text-sm" />
              <select value={task.status || "TODO"} onChange={(e) => updateTask(index, { status: e.target.value })} className="bg-gray-900 border border-gray-600 rounded p-1 text-white text-sm">
                {["TODO", "IN_PROGRESS", "BLOCKED", "DONE"].map(status => <option key={status}>{status}</option>)}
              </select>
            </div>
            <textarea value={task.notes || ""} onChange={(e) => updateTask(index, { notes: e.target.value })} placeholder="Notes" className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-white text-sm h-16" />
          </div>
        ))}
        {data.tasks.length === 0 && <p className="text-xs text-gray-500 italic">Aucune tâche d'implémentation.</p>}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function QuestEditor() {
  const [quests, setQuests] = useState([]);
  const [npcs, setNpcs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState("details"); 

  // Cache des joueurs pour affichage (id -> data)
  const [playersCache, setPlayersCache] = useState({});
  const [allPlayersList, setAllPlayersList] = useState([]);
  
  // Suivi des quêtes (questId -> [ { playerId, status } ])
  const [questTracking, setQuestTracking] = useState({});

  // États pour l'ajout d'un joueur à une quête
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState("");
  const [cancellingPlayerId, setCancellingPlayerId] = useState(null);
  const [playerSearch, setPlayerSearch] = useState("");

  // Form State
  const [formData, setFormData] = useState(DEFAULT_QUEST);
  const [savedFormData, setSavedFormData] = useState(null);

  const hasUnsavedChanges = useMemo(
    () => savedFormData !== null && JSON.stringify(formData) !== JSON.stringify(savedFormData),
    [formData, savedFormData]
  );

  const jobCategories = useMemo(() => {
    return [
      { name: "Aventurier", jobs: [{ id: "aventurier", name: "Aventurier" }] },
      ...categories,
      { name: "Spécial", jobs: specials }
    ];
  }, []);

  // Chargement des données
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Récupérer les quêtes
      const questsData = await getQuestsList();
      setQuests(questsData || []);

      // 2. Récupérer les NPCs
      const npcsData = await getNpcsList();
      setNpcs(npcsData || []);

      // 3. Récupérer tous les états de quêtes
      const allStates = await getAllPlayerQuestStates();
      
      // Transformer la liste plate en map par questId
      const trackingMap = {};
      if (allStates && Array.isArray(allStates)) {
        allStates.forEach(state => {
          if (!trackingMap[state.quest_id]) {
            trackingMap[state.quest_id] = [];
          }
          trackingMap[state.quest_id].push({
            playerId: state.player_id,
            status: state.status
          });
        });
      }
      setQuestTracking(trackingMap);

      // 4. Récupérer les joueurs
      const ranksToFetch = ["Citoyen", "Admin", "Etranger", "Villageois", "Noble"]; 
      const playersPromises = ranksToFetch.map(r => getPlayers(r));
      const playersResults = await Promise.all(playersPromises);
      
      const playerMap = new Map();
      playersResults.flat().filter(Boolean).forEach(p => {
        if (p.id && !playerMap.has(p.id)) {
          playerMap.set(p.id, p);
        }
      });
      
      const uniquePlayers = Array.from(playerMap.values());
      setPlayersCache(Object.fromEntries(playerMap));
      setAllPlayersList(uniquePlayers);

    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Centrage initial
  const containerRef = useCallback((container) => {
    if (container !== null) {
      const { width, height } = container.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 6 });
    }
  }, []);

  // --- Gestion du Formulaire ---
  const handleEditClick = (quest, tab = "details") => {
    const questFormData = normalizeQuest(quest);

    setSelectedQuest(quest);
    setIsCreating(false);
    setActiveTab(tab);
    setFormData(questFormData);
    setSavedFormData(questFormData);
  };

  const handleCreateClick = (parentId = null, suggestedId = null) => {
    const newQuestFormData = {
      ...DEFAULT_QUEST, 
      parentId: parentId || "",
      questId: suggestedId || `new.${Date.now()}` 
    };

    setSelectedQuest(null);
    setIsCreating(true);
    setActiveTab("details");
    setFormData(newQuestFormData);
    setSavedFormData(newQuestFormData);
  };

  const handleClearForm = () => {
    if (window.confirm("Voulez-vous vraiment vider le formulaire ?")) {
      setFormData({ 
        ...DEFAULT_QUEST, 
        questId: `new.${Date.now()}` 
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent, key, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value }
    }));
  };

  const handleArrayChange = (e, field) => {
    // Simple comma-separated string to array
    const val = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleJsonChange = (e) => {
    const { name, value } = e.target;
    try {
      setFormData(prev => ({ ...prev, [name]: JSON.parse(value) }));
    } catch (err) {
      console.warn("Invalid JSON");
    }
  };

  const handleSave = async () => {
    try {
      const payload = getQuestPayload(formData);
      const savedQuest = isCreating
        ? await createQuest(payload)
        : await updateQuest(formData.questId, payload);

      if (!savedQuest) {
        alert("Erreur lors de l'enregistrement de la quête.");
        return;
      }

      await fetchAllData();
      closeModal();
    } catch (error) {
      alert(getApiErrorMessage(error, "Erreur lors de l'enregistrement de la quête."));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer la quête ${formData.name} ?`)) return;
    const deletedQuest = await deleteQuest(formData.questId);
    if (!deletedQuest) {
      alert("Erreur lors de la suppression de la quête.");
      return;
    }
    await fetchAllData();
    closeModal();
  };

  const closeModal = () => {
    setSelectedQuest(null);
    setIsCreating(false);
    setSavedFormData(null);
  };

  const handleForceClose = () => {
    if (hasUnsavedChanges && !window.confirm("Quitter sans sauvegarder ? Vos modifications seront perdues.")) return;
    closeModal();
  };

  // --- Gestion des joueurs sur la quête ---
  const handleAddPlayerToQuest = async () => {
    if (!selectedPlayerToAdd || !formData.questId) return;

    const hasParent = formData.parentId;
    let canAdd = true;
    
    if (hasParent) {
      const parentStatus = questTracking[hasParent]?.find(p => p.playerId === selectedPlayerToAdd)?.status;
      if (parentStatus !== "COMPLETED") {
        const confirmForce = window.confirm(`⚠️ Attention : Ce joueur n'a pas terminé la quête parente (${hasParent}). Voulez-vous forcer l'ajout et valider automatiquement la quête parente ?`);
        if (confirmForce) {
          // On valide la quête parente
          await updatePlayerQuestStatus(selectedPlayerToAdd, hasParent, "COMPLETED");
        } else {
          canAdd = false;
        }
      }
    }

    if (canAdd) {
      try {
        await updatePlayerQuestStatus(selectedPlayerToAdd, formData.questId, "IN_PROGRESS");
        await fetchAllData(); // Rafraîchir pour voir le joueur apparaître
        setShowAddPlayerModal(false);
        setSelectedPlayerToAdd("");
      } catch (error) {
        alert("Erreur lors de l'ajout du joueur à la quête.");
      }
    }
  };

  const handleCancelPlayerQuest = async (playerId, playerName) => {
    if (!window.confirm(`Retirer ${playerName} de la quête "${formData.name}" ? Sa progression sur cette quête sera supprimée.`)) {
      return;
    }

    setCancellingPlayerId(playerId);
    const cancelled = await cancelPlayerQuestState(playerId, formData.questId);
    setCancellingPlayerId(null);

    if (!cancelled) {
      alert("La quête n'a pas pu être annulée pour ce joueur.");
      return;
    }

    setQuestTracking(current => ({
      ...current,
      [formData.questId]: (current[formData.questId] || []).filter(entry => entry.playerId !== playerId),
    }));
  };

  const filteredPlayersList = allPlayersList.filter(p => 
    p.pseudo_minecraft?.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.name?.toLowerCase().includes(playerSearch.toLowerCase())
  );

  // --- Construction de l'arbre ---
  const treeData = useMemo(() => {
    if (quests.length === 0) return null;

    const questMap = {};
    quests.forEach(q => {
      questMap[q.questId] = { 
        name: q.name, 
        attributes: { ...q }, 
        children: [] 
      };
    });

    const roots = [];
    quests.forEach(q => {
      const parts = q.questId.split('.');
      if (parts.length > 1) {
        parts.pop();
        const parentId = parts.join('.');
        if (questMap[parentId]) {
          questMap[parentId].children.push(questMap[q.questId]);
        } else {
          roots.push(questMap[q.questId]);
        }
      } else {
        roots.push(questMap[q.questId]);
      }
    });

    if (roots.length === 0) return null;
    
    return {
      name: "Racine",
      attributes: { isRoot: true },
      children: roots.sort((a, b) => a.attributes.questId.localeCompare(b.attributes.questId, undefined, { numeric: true }))
    };
  }, [quests]);

  // --- Rendu des Nœuds ---
  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    if (nodeDatum.attributes?.isRoot) {
      return (
        <g>
          <circle r={20} fill="#EAB308" stroke="#fff" strokeWidth={3} />
          <text fill="white" x="30" dy="8" fontSize="20" fontWeight="bold">Quêtes</text>
          {/* Bouton Ajouter Racine */}
          <g 
            onClick={(e) => { e.stopPropagation(); handleCreateClick(null, "m" + (quests.length + 1)); }}
            className="cursor-pointer hover:opacity-80"
          >
            <circle r={12} cy={40} fill="#22c55e" stroke="#fff" strokeWidth={2} />
            <text x="-4" y={44} fill="white" fontSize="14" fontWeight="bold">+</text>
          </g>
        </g>
      );
    }

    const quest = nodeDatum.attributes;
    const trackedPlayers = questTracking[quest.questId] || [];
    
    // Calculer l'ID suggéré pour un enfant (ex: m1 -> m1.1, m1.1 -> m1.1.1)
    // On cherche le dernier enfant pour incrémenter, sinon .1
    const nextChildSuffix = (nodeDatum.children?.length || 0) + 1;
    const suggestedChildId = `${quest.questId}.${nextChildSuffix}`;

    return (
      <g>
        <foreignObject x="-140" y="-50" width="280" height="140">
          <div 
            className="w-full h-full bg-gray-800 border border-gray-600 rounded-xl shadow-xl flex flex-col overflow-hidden hover:border-yellow-500 transition-colors group cursor-pointer"
            onClick={() => handleEditClick(quest, "details")}
          >
            {/* Header */}
            <div className="bg-gray-900/50 p-2 flex justify-between items-center border-b border-gray-700">
              <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-1 rounded">
                {quest.questId}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                quest.category === "Main" ? "bg-yellow-500/20 text-yellow-500" : "bg-blue-500/20 text-blue-400"
              }`}>
                {quest.category}
              </span>
            </div>

            {/* Body */}
            <div className="p-3 flex-grow relative">
              <h3 className="text-sm font-bold text-white leading-tight mb-1">{quest.name}</h3>
              <p className="text-[10px] text-gray-400 line-clamp-2">
                {quest.description?.fr}
              </p>

              {/* Active Players Overlay (Clickable) */}
              <div 
                className="absolute bottom-2 right-2 flex -space-x-2 cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(quest, "players");
                }}
              >
                {trackedPlayers.slice(0, 3).map((tp, i) => {
                  const player = playersCache[tp.playerId];
                  const avatarUrl = player ? getDiscordAvatarUrl(player.discord_id, player.discord_avatar) : "/assets/default-avatar.png";
                  const borderColor = tp.status === "COMPLETED" ? "border-green-500" : "border-blue-500";
                  
                  return (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 ${borderColor} bg-gray-700 flex items-center justify-center overflow-hidden`} title={player?.pseudo_minecraft || "Inconnu"}>
                       <img src={avatarUrl} alt="pl" className="w-full h-full object-cover" />
                    </div>
                  );
                })}
                {trackedPlayers.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-600 bg-gray-800 flex items-center justify-center text-[8px] text-white font-bold">
                        +{trackedPlayers.length - 3}
                    </div>
                )}
              </div>
            </div>
          </div>
        </foreignObject>
        
        {/* Bouton Ajouter Enfant (+) */}
        <g 
          onClick={(e) => { e.stopPropagation(); handleCreateClick(quest.questId, suggestedChildId); }}
          className="cursor-pointer hover:opacity-80"
          transform="translate(0, 105)"
        >
          <circle r={10} fill="#22c55e" stroke="#fff" strokeWidth={1.5} />
          <text x="-3.5" y={3.5} fill="white" fontSize="12" fontWeight="bold">+</text>
        </g>

        {/* Toggle Button (si enfants) */}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <circle 
            r={8} cy={130} fill="#374151" stroke="#9CA3AF" strokeWidth={1}
            className="cursor-pointer hover:fill-yellow-500 transition-colors"
            onClick={(e) => { e.stopPropagation(); toggleNode(); }}
          />
        )}
      </g>
    );
  };

  if (loading) return <div className="text-white text-center mt-20">Chargement de l'éditeur...</div>;

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col relative overflow-hidden">
      
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={() => handleCreateClick()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold transition"
        >
          <FaPlus /> Nouvelle Quête
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-10">
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white"><FaSearchPlus /></button>
        <button onClick={() => setZoom(1)} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white"><FaCompress /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white"><FaSearchMinus /></button>
      </div>

      {/* Canvas */}
      <div className="flex-grow bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-gray-950" ref={containerRef}>
        {treeData ? (
          <Tree
            data={treeData}
            translate={translate}
            zoom={zoom}
            renderCustomNodeElement={renderCustomNode}
            orientation="vertical"
            pathFunc="step"
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            nodeSize={{ x: 300, y: 240 }} 
            enableLegacyTransitions={true}
            transitionDuration={300}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Aucune quête. Créez-en une !
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {(selectedQuest || isCreating) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
            // Retrait du onClick={closeModal} ici pour éviter la fermeture accidentelle
          >
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="w-full max-w-2xl bg-gray-800 h-full shadow-2xl border-l border-gray-700 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-700 bg-gray-900">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {isCreating ? <><FaPlus className="text-green-500"/> Créer une quête</> : <><FaEdit className="text-blue-500"/> Éditer la quête</>}
                  </h2>
                  <div className="flex items-center gap-4">
                    {isCreating && (
                      <button onClick={handleClearForm} className="text-xs flex items-center gap-1 text-orange-400 hover:text-orange-300">
                        <FaBroom /> Vider
                      </button>
                    )}
                    <button onClick={handleForceClose} className="text-gray-400 hover:text-white"><FaTimes size={24}/></button>
                  </div>
                </div>
                
                {/* Tabs */}
                {!isCreating && (
                  <div className="flex space-x-4 border-b border-gray-700 overflow-x-auto">
                    {['details', 'texts', 'logic', 'players'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-3 capitalize whitespace-nowrap ${activeTab === tab ? "text-yellow-500 border-b-2 border-yellow-500 font-bold" : "text-gray-400 hover:text-white"}`}
                      >
                        {tab === 'players' ? `Joueurs (${questTracking[formData.questId]?.length || 0})` : 
                         tab === 'texts' ? 'Textes & Dialogues' : 
                         tab === 'logic' ? 'Logique & Récompenses' : 'Détails'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                
                {/* --- TAB: DETAILS --- */}
                {(activeTab === "details" || isCreating) && (
                  <>
                    {/* Identifiants */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ID Quête</label>
                        <input 
                          type="text" name="questId" value={formData.questId} onChange={handleFormChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ID Parent</label>
                        <input 
                          type="text" name="parentId" value={formData.parentId || ""} onChange={handleFormChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none"
                          placeholder="ex: m1"
                        />
                      </div>
                    </div>

                    {/* Infos de base */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom</label>
                      <input 
                        type="text" name="name" value={formData.name} onChange={handleFormChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-yellow-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Catégorie</label>
                        <select name="category" value={formData.category} onChange={handleFormChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white">
                          <option value="Main">Principale</option>
                          <option value="Secondary">Secondaire</option>
                          <option value="Tertiary">Tertiaire</option>
                          <option value="FullRP">Full-RP</option>
                          <option value="SemiRP">Semi-RP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                        <select name="type" value={formData.type} onChange={handleFormChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white">
                          <option value="Solo">Solo</option>
                          <option value="Multi">Multi</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <NpcSelector
                        value={formData.startNpcId}
                        onChange={(startNpcId) => setFormData(prev => ({ ...prev, startNpcId }))}
                        npcs={npcs}
                        label="PNJ de départ"
                        allowDummy={false}
                      />
                      <NpcSelector
                        value={formData.completionNpcId}
                        onChange={(completionNpcId) => setFormData(prev => ({ ...prev, completionNpcId }))}
                        npcs={npcs}
                        label="PNJ de validation"
                        allowDummy={false}
                      />
                    </div>
                  </>
                )}

                {/* --- TAB: TEXTS --- */}
                {(activeTab === "texts" || isCreating) && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-yellow-500 uppercase border-b border-gray-700 pb-1">Description</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <textarea 
                          placeholder="Français"
                          value={formData.description?.fr || ""} 
                          onChange={(e) => handleNestedChange("description", "fr", e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-20 text-sm"
                        />
                        <textarea 
                          placeholder="Anglais"
                          value={formData.description?.en || ""} 
                          onChange={(e) => handleNestedChange("description", "en", e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-20 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-yellow-500 uppercase border-b border-gray-700 pb-1">Texte de début</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <textarea 
                          placeholder="Français"
                          value={formData.beginText?.fr || ""} 
                          onChange={(e) => handleNestedChange("beginText", "fr", e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-20 text-sm"
                        />
                        <textarea 
                          placeholder="Anglais"
                          value={formData.beginText?.en || ""} 
                          onChange={(e) => handleNestedChange("beginText", "en", e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-20 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-yellow-500 uppercase border-b border-gray-700 pb-1">Texte de fin</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <textarea 
                          placeholder="Français"
                          value={formData.endText?.fr || ""} 
                          onChange={(e) => handleNestedChange("endText", "fr", e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-20 text-sm"
                        />
                        <textarea 
                          placeholder="Anglais"
                          value={formData.endText?.en || ""} 
                          onChange={(e) => handleNestedChange("endText", "en", e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-20 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* --- TAB: LOGIC --- */}
                {(activeTab === "logic" || isCreating) && (
                  <>
                    {/* Prérequis */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Prérequis (Tous)</label>
                        <input 
                          type="text" 
                          placeholder="id1, id2..."
                          value={formData.prerequisitesAll?.join(", ") || ""} 
                          onChange={(e) => handleArrayChange(e, "prerequisitesAll")}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Prérequis (Au moins un)</label>
                        <input 
                          type="text" 
                          placeholder="id1, id2..."
                          value={formData.prerequisitesAny?.join(", ") || ""} 
                          onChange={(e) => handleArrayChange(e, "prerequisitesAny")}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Récompenses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MoneyInput 
                        value={formData.money} 
                        onChange={(val) => setFormData(prev => ({ ...prev, money: val }))} 
                      />
                      <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Expérience</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500">Métier</label>
                            <select 
                              value={formData.xp?.job || "aventurier"} 
                              onChange={(e) => handleNestedChange("xp", "job", e.target.value)}
                              className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm"
                            >
                              <option value="aventurier">Aventurier</option>
                              {jobCategories.map((cat, i) => (
                                <optgroup key={i} label={cat.name}>
                                  {cat.jobs.map(j => (
                                    <option key={j.id} value={j.id}>{j.name}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Montant</label>
                            <input 
                              type="number" 
                              value={formData.xp?.amount || 0} 
                              onChange={(e) => handleNestedChange("xp", "amount", Number(e.target.value))}
                              className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Editors */}
                    <ObjectivesEditor 
                      objectives={formData.objectives} 
                      onChange={(newObjs) => setFormData(prev => ({ ...prev, objectives: newObjs }))} 
                      npcs={npcs}
                    />
                    
                    <ItemListEditor 
                      items={formData.rewards} 
                      onChange={(newRewards) => setFormData(prev => ({ ...prev, rewards: newRewards }))} 
                      label="Récompenses Items"
                    />

                    <ImplementationEditor
                      implementation={formData.implementation}
                      onChange={(implementation) => setFormData(prev => ({ ...prev, implementation }))}
                    />
                  </>
                )}

                {/* --- TAB: PLAYERS --- */}
                {activeTab === "players" && !isCreating && (
                  <div className="space-y-6">
                    {/* Add Player Form */}
                    <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <FaPlus className="text-green-400" /> Démarrer la quête pour un joueur
                        </h3>
                        <button 
                          onClick={() => setShowAddPlayerModal(true)}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center gap-1 transition shadow-md"
                        >
                           Sélectionner un joueur
                        </button>
                      </div>
                    </div>

                    {/* List of active players */}
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <FaUserAstronaut /> Suivi des joueurs
                      </h3>
                      
                      {(!questTracking[formData.questId] || questTracking[formData.questId].length === 0) ? (
                        <p className="text-gray-400 italic bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">Aucun joueur n'a commencé cette quête.</p>
                      ) : (
                        <div className="space-y-3">
                          {questTracking[formData.questId].map((entry, idx) => {
                            const player = playersCache[entry.playerId] || { pseudo_minecraft: "Inconnu", id: entry.playerId };
                            const avatarUrl = getDiscordAvatarUrl(player.discord_id, player.discord_avatar);
                            const isCompleted = entry.status === "COMPLETED";

                            return (
                              <div key={entry.playerId} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                                <div className="flex items-center gap-3">
                                  <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full border border-gray-500" />
                                  <div>
                                    <p className="font-bold text-white">{player.pseudo_minecraft}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                      {player.discord_id ? <><FaDiscord className="text-indigo-400"/> Connecté</> : "Pas de Discord"}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
                                    isCompleted ? "bg-green-900/50 text-green-400 border border-green-700" : "bg-blue-900/50 text-blue-400 border border-blue-700"
                                  }`}>
                                    {isCompleted ? <><FaCheckCircle /> Terminé</> : <><FaRunning /> En cours</>}
                                  </div>
                                  <button
                                    type="button"
                                    disabled={cancellingPlayerId === entry.playerId}
                                    onClick={() => handleCancelPlayerQuest(entry.playerId, player.pseudo_minecraft)}
                                    className="flex items-center gap-2 rounded-lg border border-red-700/60 bg-red-900/30 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-900/60 disabled:cursor-wait disabled:opacity-50"
                                  >
                                    <FaTrash />
                                    {cancellingPlayerId === entry.playerId ? "Annulation..." : "Retirer"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-700 bg-gray-900 flex justify-between">
                {!isCreating && (
                  <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold">
                    <FaTrash /> Supprimer
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button onClick={handleForceClose} className="px-4 py-2 text-gray-400 hover:text-white">Annuler</button>
                  <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold shadow-lg">
                    <FaSave /> Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Sub-Modal pour sélectionner un joueur à ajouter */}
            <AnimatePresence>
              {showAddPlayerModal && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4"
                  onClick={() => setShowAddPlayerModal(false)}
                >
                  <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-600 w-full max-w-md flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">Ajouter un joueur</h3>
                      <button onClick={() => setShowAddPlayerModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                    </div>
                    
                    <div className="relative mb-4">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="text" placeholder="Rechercher (pseudo, nom)..." 
                        value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {filteredPlayersList.map(p => {
                        const isAlreadyOnQuest = questTracking[formData.questId]?.some(t => t.playerId === p.id);
                        
                        return (
                          <div 
                            key={p.id} 
                            onClick={() => !isAlreadyOnQuest && setSelectedPlayerToAdd(p.id)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                              isAlreadyOnQuest 
                                ? "bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed" 
                                : selectedPlayerToAdd === p.id 
                                  ? "bg-blue-900/50 border-blue-500" 
                                  : "bg-gray-700 border-gray-600 hover:border-gray-500"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={getDiscordAvatarUrl(p.discord_id, p.discord_avatar)} className="w-8 h-8 rounded-full" alt="av" />
                              <span className="text-white font-medium">{p.pseudo_minecraft}</span>
                            </div>
                            {isAlreadyOnQuest && <span className="text-xs text-gray-500 uppercase">Déjà assigné</span>}
                            {selectedPlayerToAdd === p.id && <FaCheckCircle className="text-blue-400" />}
                          </div>
                        );
                      })}
                      {filteredPlayersList.length === 0 && <p className="text-center text-gray-500 py-4">Aucun joueur trouvé.</p>}
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-700 pt-4">
                      <button onClick={() => setShowAddPlayerModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Annuler</button>
                      <button 
                        onClick={handleAddPlayerToQuest}
                        disabled={!selectedPlayerToAdd}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaPlay /> Démarrer la quête
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
