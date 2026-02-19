import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tree from "react-d3-tree";
import { getQuestsList, getPlayerQuests, getPlayerFullProfile } from "../services/api";
import { useUser } from "../context/UserContext";
import { FaTimes, FaScroll, FaCoins, FaStar, FaSearchPlus, FaSearchMinus, FaCompress, FaLock } from "react-icons/fa";
import { MoneyDisplay } from "../components/MoneyDisplay";

const QUEST_TYPES = [
  { id: "ALL", label: "Toutes" },
  { id: "Main", label: "Principale" },
  { id: "Secondary", label: "Secondaire" },
  { id: "Tertiary", label: "Tertiaire" },
  { id: "FullRP", label: "Full-RP" },
  { id: "SemiRP", label: "Semi-RP" },
];

export default function Quests() {
  const { userId, userRank } = useUser();
  const [quests, setQuests] = useState([]);
  const [playerQuests, setPlayerQuests] = useState([]);
  const [playerName, setPlayerName] = useState("Aventurier");
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [getQuestsList()];
        if (userId) {
          promises.push(getPlayerQuests(userId));
          promises.push(getPlayerFullProfile(userId));
        }

        const [questsData, playerQuestsData, profileData] = await Promise.all(promises);

        setQuests(questsData || []);
        if (playerQuestsData) setPlayerQuests(playerQuestsData);
        if (profileData) {
          setPlayerName(profileData.pseudo_minecraft || profileData.name || "Aventurier");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des quêtes :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Centrer l'arbre au chargement
  const containerRef = React.useCallback((container) => {
    if (container !== null) {
      const { width, height } = container.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 5 });
    }
  }, []);

  const getQuestStatus = (questId) => {
    const pq = playerQuests.find((p) => p.quest_id === questId);
    return pq ? pq.status : null; // 'IN_PROGRESS', 'COMPLETED', or null
  };

  const formatText = (text, quest) => {
    if (!text) return "";
    let formatted = text;
    formatted = formatted.replace(/{npc}/g, quest.npc || "Inconnu");
    formatted = formatted.replace(/{player}/g, playerName);
    formatted = formatted.replace(/{username}/g, playerName);
    return formatted;
  };

  // Transformation des données pour react-d3-tree
  const treeData = useMemo(() => {
    const filtered = selectedType === "ALL"
      ? quests
      : quests.filter((q) => q.category === selectedType);

    const questMap = {};
    filtered.forEach(q => {
      questMap[q.questId] = { 
        name: q.name,
        attributes: { ...q }, 
        children: [] 
      };
    });

    const roots = [];
    filtered.forEach(q => {
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
    if (roots.length === 1) return roots[0];
    
    return {
      name: "Quêtes",
      attributes: { isRoot: true },
      children: roots.sort((a, b) => a.attributes.questId.localeCompare(b.attributes.questId, undefined, { numeric: true }))
    };
  }, [quests, selectedType]);

  // Rendu personnalisé des nœuds
  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    // Nœud racine virtuel
    if (nodeDatum.attributes?.isRoot) {
      return (
        <g>
          <circle r={20} fill="#EAB308" stroke="#fff" strokeWidth={3} />
          <text 
            fill="white" 
            x="30" 
            dy="8" 
            fontSize="24" 
            fontWeight="bold"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
          >
            Début
          </text>
        </g>
      );
    }

    const quest = nodeDatum.attributes;
    const status = getQuestStatus(quest.questId);
    const isActive = status === "IN_PROGRESS";
    const isCompleted = status === "COMPLETED";
    const isSelected = selectedQuest?.questId === quest.questId;
    const isAdmin = userRank === "Admin";

    // Logique de verrouillage
    const parentId = quest.parentId;
    const parentStatus = parentId ? getQuestStatus(parentId) : "COMPLETED"; 
    
    const isLocked = !isAdmin && parentId && parentStatus !== "COMPLETED" && !isActive && !isCompleted;

    // Si verrouillé, on affiche une carte mystère
    if (isLocked) {
      return (
        <g>
          <foreignObject x="-120" y="-40" width="240" height="100">
            <div className="w-full h-full p-3 rounded-lg border border-gray-700 bg-gray-800/50 flex flex-col items-center justify-center shadow-inner opacity-70 cursor-not-allowed">
              <FaLock className="text-gray-500 text-2xl mb-2" />
              <span className="text-gray-500 font-mono text-sm">???</span>
            </div>
          </foreignObject>
        </g>
      );
    }

    // Si déverrouillé
    return (
      <g onClick={() => setSelectedQuest(quest)}>
        <foreignObject x="-120" y="-40" width="240" height="100">
          <div 
            className={`
              w-full h-full p-3 rounded-lg border shadow-lg flex flex-col justify-between cursor-pointer transition-all duration-200
              ${isActive ? "border-green-500 bg-gray-800 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : ""}
              ${isCompleted ? "border-blue-500 bg-gray-800 opacity-80" : ""}
              ${!isActive && !isCompleted ? "border-gray-600 bg-gray-800 hover:border-yellow-500" : ""}
              ${isSelected ? "ring-2 ring-yellow-400 scale-105" : ""}
            `}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase text-yellow-500/80 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                {quest.category}
              </span>
              {isActive && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" title="En cours" />
              )}
              {isCompleted && (
                <div className="text-[10px] text-blue-400 font-bold border border-blue-500/30 px-1 rounded">FINI</div>
              )}
            </div>
            
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 mt-1">
              {quest.name}
            </h3>

            <div className="flex items-center gap-2 mt-auto">
              {quest.money > 0 && (
                <span className="text-[10px] text-yellow-400 flex items-center gap-0.5">
                  <FaCoins size={8} /> <MoneyDisplay value={quest.money} />
                </span>
              )}
              {quest.xp && (
                <span className="text-[10px] text-blue-400 flex items-center gap-0.5">
                  <FaStar size={8} /> {quest.xp.amount}
                </span>
              )}
            </div>
          </div>
        </foreignObject>
        
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <circle 
            r={8} 
            cy={60} 
            fill="#374151" 
            stroke="#9CA3AF" 
            strokeWidth={1}
            className="cursor-pointer hover:fill-gray-600"
            onClick={(e) => { e.stopPropagation(); toggleNode(); }}
          />
        )}
      </g>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden flex flex-col relative">
      {/* Header Flottant */}
      <div className="absolute top-20 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-yellow-500 flex items-center gap-2 drop-shadow-lg bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur-md pointer-events-auto"
        >
          <FaScroll /> Carte des Quêtes
        </motion.h1>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 pointer-events-auto">
          {QUEST_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shadow-lg backdrop-blur-sm ${
                selectedType === type.id
                  ? "bg-yellow-500 text-gray-900 scale-105"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zone de l'arbre (Canvas) */}
      <div className="flex-grow w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black" ref={containerRef}>
        {treeData ? (
          <Tree
            data={treeData}
            translate={translate}
            zoom={zoom}
            renderCustomNodeElement={renderCustomNode}
            orientation="vertical"
            pathFunc="step" // Lignes coudées style circuit
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            nodeSize={{ x: 260, y: 180 }} // Espacement entre les nœuds
            enableLegacyTransitions={true}
            transitionDuration={500}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Aucune quête disponible.
          </div>
        )}
      </div>

      {/* Contrôles de zoom */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-10">
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white">
          <FaSearchPlus />
        </button>
        <button onClick={() => setZoom(1)} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white">
          <FaCompress />
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 text-white">
          <FaSearchMinus />
        </button>
      </div>

      {/* Modale de détails (inchangée) */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedQuest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-600 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modale */}
              <div className="p-6 border-b border-gray-700 flex justify-between items-start bg-gray-900/50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                      {selectedQuest.category}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider border border-gray-600 px-2 py-1 rounded">
                      {selectedQuest.type}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      ID: {selectedQuest.questId}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {selectedQuest.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedQuest(null)}
                  className="text-gray-400 hover:text-white transition p-1"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Contenu Scrollable */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    📜 Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {formatText(
                      selectedQuest.description?.fr || selectedQuest.description?.en,
                      selectedQuest
                    )}
                  </p>
                </div>

                {/* Objectifs */}
                {selectedQuest.objectives &&
                  selectedQuest.objectives.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        🎯 Objectifs
                      </h3>
                      <ul className="space-y-2">
                        {selectedQuest.objectives.map((obj, idx) => (
                          <li
                            key={idx}
                            className="bg-gray-700/50 p-3 rounded-lg border border-gray-700 flex items-start gap-3"
                          >
                            <span className="bg-gray-600 text-xs font-bold px-2 py-1 rounded text-gray-300 mt-0.5">
                              {obj.type}
                            </span>
                            <div className="text-sm text-gray-200">
                              {obj.type === "ITEM" &&
                                obj.items?.map((it, i) => (
                                  <div key={i}>
                                    • Récupérer {it.count}x{" "}
                                    <span className="text-blue-300">
                                      {it.itemId}
                                    </span>
                                  </div>
                                ))}
                              {obj.type === "LOCATION" && (
                                <div>
                                  • Se rendre aux coordonnées :{" "}
                                  <span className="text-yellow-300 font-mono">
                                    {obj.coord}
                                  </span>
                                </div>
                              )}
                              {/* Fallback pour autres types */}
                              {!["ITEM", "LOCATION"].includes(obj.type) && (
                                <div>• {JSON.stringify(obj)}</div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Récompenses */}
                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    🎁 Récompenses
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedQuest.money > 0 && (
                      <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-600">
                        <FaCoins className="text-yellow-500" />
                        <span className="font-bold text-yellow-100">
                          <MoneyDisplay value={selectedQuest.money} />
                        </span>
                      </div>
                    )}
                    {selectedQuest.xp && (
                      <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-600">
                        <FaStar className="text-blue-400" />
                        <span className="font-bold text-blue-100">
                          {selectedQuest.xp.amount} XP
                        </span>
                        <span className="text-xs text-gray-500 uppercase ml-1">
                          ({selectedQuest.xp.job})
                        </span>
                      </div>
                    )}
                    {selectedQuest.rewards?.map((reward, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-600"
                      >
                        <span className="text-green-400 font-bold">
                          {reward.count}x
                        </span>
                        <span className="text-gray-200">{reward.itemId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NPC & Dialogues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                  <div>
                    <span className="font-semibold text-gray-500 block mb-1">
                      Donneur de quête
                    </span>
                    <span className="text-white bg-gray-700 px-2 py-1 rounded">
                      {selectedQuest.npc}
                    </span>
                  </div>
                  {selectedQuest.prerequisitesAll?.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-500 block mb-1">
                        Prérequis
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedQuest.prerequisitesAll.map((pre, i) => (
                          <span
                            key={i}
                            className="text-xs bg-red-900/30 text-red-300 border border-red-900/50 px-2 py-0.5 rounded"
                          >
                            {pre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Modale */}
              <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex justify-end">
                <button
                  onClick={() => setSelectedQuest(null)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
