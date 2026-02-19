import React, { useEffect, useState, useMemo, useCallback } from "react";
import Tree from "react-d3-tree";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPlus, FaSave, FaTrash, FaTimes, FaSearchPlus, FaSearchMinus, FaCompress, 
  FaEdit, FaUserAstronaut, FaCheckCircle, FaRunning, FaDiscord, FaCube, FaMapMarkerAlt, FaUserTie, FaHammer, FaTheaterMasks 
} from "react-icons/fa";
import { 
  getQuestsList, createQuest, updateQuest, deleteQuest, getPlayers, getAllPlayerQuestStates 
} from "../../services/api";

const DEFAULT_QUEST = {
  questId: "",
  parentId: "",
  category: "Main",
  name: "Nouvelle Quête",
  type: "Solo",
  npc: "",
  description: { fr: "", en: "" },
  money: 0,
  xp: { job: "aventurier", amount: 0 },
  objectives: [],
  rewards: [],
  prerequisitesAll: [],
  prerequisitesAny: [],
  beginText: { fr: "", en: "" },
  endText: { fr: "", en: "" }
};

// Helper pour l'URL Discord
const getDiscordAvatarUrl = (discordId, avatarHash) => {
  if (!discordId || !avatarHash) return "/assets/default-avatar.png"; // Fallback local
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png`;
};

// --- Composants d'édition visuelle ---

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

const ObjectivesEditor = ({ objectives, onChange }) => {
  const handleAddObjective = (type) => {
    let newObj = { type };
    switch (type) {
      case "ITEM": newObj.items = []; break;
      case "LOCATION": newObj.coord = "x:0 y:0 z:0 r:5"; break;
      case "NPC": newObj.npcId = ""; break;
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-2">
        <button onClick={() => handleAddObjective("ITEM")} className="px-2 py-1 bg-blue-600/50 hover:bg-blue-600 text-white text-xs rounded flex items-center gap-1" title="Récupérer des items">
          <FaCube /> Item
        </button>
        <button onClick={() => handleAddObjective("LOCATION")} className="px-2 py-1 bg-yellow-600/50 hover:bg-yellow-600 text-white text-xs rounded flex items-center gap-1" title="Aller à un endroit">
          <FaMapMarkerAlt /> Lieu
        </button>
        <button onClick={() => handleAddObjective("NPC")} className="px-2 py-1 bg-purple-600/50 hover:bg-purple-600 text-white text-xs rounded flex items-center gap-1" title="Parler à un PNJ">
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
              obj.type === "NPC" ? "bg-purple-600" :
              obj.type === "CONSTRUCTION" ? "bg-orange-600" : "bg-pink-600"
            }`}>{obj.type}</span>
          </div>

          {obj.type === "ITEM" && (
            <ItemListEditor 
              items={obj.items || []} 
              onChange={(newItems) => handleUpdateObjective(idx, { items: newItems })}
              label="Items requis"
            />
          )}

          {obj.type === "LOCATION" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Coordonnées (format: x:0 y:0 z:0 r:5)</label>
              <input 
                type="text" 
                value={obj.coord || ""} 
                onChange={(e) => handleUpdateObjective(idx, { coord: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm font-mono"
              />
            </div>
          )}

          {obj.type === "NPC" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">ID du PNJ (ex: npc_banker_01)</label>
              <input 
                type="text" 
                value={obj.npcId || ""} 
                onChange={(e) => handleUpdateObjective(idx, { npcId: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm"
              />
            </div>
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

// --- Main Component ---

export default function QuestEditor() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'texts' | 'logic' | 'players'

  // Cache des joueurs pour affichage (id -> data)
  const [playersCache, setPlayersCache] = useState({});
  
  // Suivi des quêtes (questId -> [ { playerId, status } ])
  const [questTracking, setQuestTracking] = useState({});

  // Form State
  const [formData, setFormData] = useState(DEFAULT_QUEST);

  // Chargement des données
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Récupérer les quêtes
      const questsData = await getQuestsList();
      setQuests(questsData || []);

      // 2. Récupérer tous les états de quêtes
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

      // 3. Récupérer les joueurs
      const ranksToFetch = ["Citoyen", "Admin", "Etranger", "Villageois", "Noble"]; 
      const playersPromises = ranksToFetch.map(r => getPlayers(r));
      const playersResults = await Promise.all(playersPromises);
      
      const cache = {};
      playersResults.flat().filter(Boolean).forEach(p => {
        cache[p.id] = p;
      });
      
      setPlayersCache(cache);

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
    setSelectedQuest(quest);
    setIsCreating(false);
    setActiveTab(tab);
    setFormData({
      ...DEFAULT_QUEST, // Ensure all fields exist
      ...quest,
      description: quest.description || { fr: "", en: "" },
      beginText: quest.beginText || { fr: "", en: "" },
      endText: quest.endText || { fr: "", en: "" },
      xp: quest.xp || { job: "", amount: 0 },
      prerequisitesAll: quest.prerequisitesAll || [],
      prerequisitesAny: quest.prerequisitesAny || [],
      objectives: quest.objectives || [],
      rewards: quest.rewards || [],
    });
  };

  const handleCreateClick = (parentId = null, suggestedId = null) => {
    setSelectedQuest(null);
    setIsCreating(true);
    setActiveTab("details");
    setFormData({ 
      ...DEFAULT_QUEST, 
      parentId: parentId || "",
      questId: suggestedId || `new.${Date.now()}` 
    });
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

  const handleSave = async () => {
    if (isCreating) {
      await createQuest(formData);
    } else {
      await updateQuest(formData.questId, formData);
    }
    await fetchAllData();
    closeModal();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer la quête ${formData.name} ?`)) return;
    await deleteQuest(formData.questId);
    await fetchAllData();
    closeModal();
  };

  const closeModal = () => {
    setSelectedQuest(null);
    setIsCreating(false);
  };

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
            onClick={closeModal}
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
                  <button onClick={closeModal} className="text-gray-400 hover:text-white"><FaTimes size={24}/></button>
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

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">PNJ Donneur</label>
                      <input type="text" name="npc" value={formData.npc || ""} onChange={handleFormChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white" />
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Argent</label>
                        <input type="number" name="money" value={formData.money} onChange={handleFormChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">XP Montant</label>
                        <input 
                          type="number" 
                          value={formData.xp?.amount || 0} 
                          onChange={(e) => handleNestedChange("xp", "amount", Number(e.target.value))}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">XP Métier</label>
                        <input 
                          type="text" 
                          value={formData.xp?.job || ""} 
                          onChange={(e) => handleNestedChange("xp", "job", e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white" 
                        />
                      </div>
                    </div>

                    {/* Visual Editors */}
                    <ObjectivesEditor 
                      objectives={formData.objectives} 
                      onChange={(newObjs) => setFormData(prev => ({ ...prev, objectives: newObjs }))} 
                    />
                    
                    <ItemListEditor 
                      items={formData.rewards} 
                      onChange={(newRewards) => setFormData(prev => ({ ...prev, rewards: newRewards }))} 
                      label="Récompenses Items"
                    />
                  </>
                )}

                {/* --- TAB: PLAYERS --- */}
                {activeTab === "players" && !isCreating && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FaUserAstronaut /> Suivi des joueurs
                    </h3>
                    
                    {(!questTracking[formData.questId] || questTracking[formData.questId].length === 0) ? (
                      <p className="text-gray-400 italic">Aucun joueur n'a commencé cette quête.</p>
                    ) : (
                      <div className="space-y-2">
                        {questTracking[formData.questId].map((entry, idx) => {
                          const player = playersCache[entry.playerId] || { pseudo_minecraft: "Inconnu", id: entry.playerId };
                          const avatarUrl = getDiscordAvatarUrl(player.discord_id, player.discord_avatar);
                          const isCompleted = entry.status === "COMPLETED";

                          return (
                            <div key={idx} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg border border-gray-600">
                              <div className="flex items-center gap-3">
                                <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full border border-gray-500" />
                                <div>
                                  <p className="font-bold text-white">{player.pseudo_minecraft}</p>
                                  <p className="text-xs text-gray-400 flex items-center gap-1">
                                    {player.discord_id ? <><FaDiscord className="text-indigo-400"/> Connecté</> : "Pas de Discord"}
                                  </p>
                                </div>
                              </div>
                              
                              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
                                isCompleted ? "bg-green-900/50 text-green-400 border border-green-700" : "bg-blue-900/50 text-blue-400 border border-blue-700"
                              }`}>
                                {isCompleted ? <><FaCheckCircle /> Terminé</> : <><FaRunning /> En cours</>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                  <button onClick={closeModal} className="px-4 py-2 text-gray-400 hover:text-white">Annuler</button>
                  <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold shadow-lg">
                    <FaSave /> Enregistrer
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
