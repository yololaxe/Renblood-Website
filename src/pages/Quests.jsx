import RealmHeader from "../components/RealmHeader";
import React, { useEffect, useState, useMemo, useCallback } from "react";
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

const TREE_SEPARATION = { siblings: 2, nonSiblings: 2.5 };
const TREE_NODE_SIZE = { x: 260, y: 180 };

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

  useEffect(() => {
    if (!selectedQuest) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = e => { if (e.key === "Escape") setSelectedQuest(null); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", close); };
  }, [selectedQuest]);

  // Centrer l'arbre au chargement
  const containerRef = React.useCallback((container) => {
    if (container !== null) {
      const { width, height } = container.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 5 });
    }
  }, []);

  const questStatusById = useMemo(
    () => Object.fromEntries(playerQuests.map(quest => [quest.quest_id, quest.status])),
    [playerQuests]
  );

  const getQuestStatus = useCallback(
    (questId) => questStatusById[questId] || null,
    [questStatusById]
  );

  const formatText = (text, quest) => {
    if (!text) return "";
    let formatted = text;
    formatted = formatted.replace(/{npc}/g, quest.startNpcName || quest.startNpcId || "Inconnu");
    formatted = formatted.replace(/{player}/g, playerName);
    formatted = formatted.replace(/{username}/g, playerName);
    return formatted;
  };

  const getNpcLabel = (name, id) => name && id ? `${name} (${id})` : name || id || "Aucun";
  const getObjectiveNpcLabel = (objective) => (
    objective.target?.npcName || objective.target?.npcId || objective.npcName || objective.npcId || "PNJ inconnu"
  );

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
  const renderCustomNode = useCallback(({ nodeDatum, toggleNode }) => {
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
            <div className="w-full h-full p-3 rounded-lg border border-stone-700 bg-[#191916]/50 flex flex-col items-center justify-center shadow-inner opacity-70 cursor-not-allowed">
              <FaLock className="text-stone-500 text-2xl mb-2" />
              <span className="text-stone-500 font-mono text-sm">???</span>
            </div>
          </foreignObject>
        </g>
      );
    }

    // Si déverrouillé
    return (
      <g role="button" tabIndex={0} aria-label={`Ouvrir la quête ${quest.name}`} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedQuest(quest); } }} onClick={() => setSelectedQuest(quest)}>
        <foreignObject x="-120" y="-40" width="240" height="100">
          <div 
            className={`
              realm-quest-node w-full h-full p-3 border flex flex-col justify-between cursor-pointer transition-all duration-200
              ${isActive ? "border-green-500 bg-[#191916] shadow-[0_0_15px_rgba(34,197,94,0.3)]" : ""}
              ${isCompleted ? "border-amber-600 bg-[#191916] opacity-80" : ""}
              ${!isActive && !isCompleted ? "border-stone-600 bg-[#191916] hover:border-yellow-500" : ""}
              ${isSelected ? "ring-2 ring-yellow-400 scale-105" : ""}
            `}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase text-amber-300/80 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                {quest.category}
              </span>
              {isActive && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" title="En cours" />
              )}
              {isCompleted && (
                <div className="text-[10px] text-amber-300 font-bold border border-amber-600/30 px-1 rounded">FINI</div>
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
                <span className="text-[10px] text-amber-300 flex items-center gap-0.5">
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
  }, [getQuestStatus, selectedQuest?.questId, userRank]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="realm-page realm-quest-page">
      <RealmHeader eyebrow="Le journal / Quêtes" title="Choisissez votre voie" description="Suivez les fils de votre aventure et découvrez les objectifs qui s’ouvrent à vous." />
      <div className="realm-content" style={{paddingTop:0}}>
        <div className="realm-quest-toolbar" aria-label="Filtrer les quêtes">{QUEST_TYPES.map(type => <button key={type.id} className="realm-filter" aria-pressed={selectedType === type.id} onClick={() => { setSelectedType(type.id); setSelectedQuest(null); }}>{type.label}</button>)}</div>
        <p className="realm-quest-help">Déplacez la carte pour explorer les branches. Sélectionnez une quête pour consulter ses objectifs et récompenses.</p>
      </div>
      {/* Zone de l'arbre (Canvas) */}
      <div className="realm-quest-canvas" ref={containerRef}>
        {treeData ? (
          <Tree
            data={treeData}
            translate={translate}
            zoom={zoom}
            renderCustomNodeElement={renderCustomNode}
            orientation="vertical"
            pathFunc="step" // Lignes coudées style circuit
            separation={TREE_SEPARATION}
            nodeSize={TREE_NODE_SIZE}
            enableLegacyTransitions={false}
            transitionDuration={0}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-stone-400">
            Aucune quête disponible.
          </div>
        )}
        <div className="realm-zoom" aria-label="Zoom de la carte">
          <button aria-label="Agrandir" onClick={() => setZoom(z => Math.min(z + .2,2))}><FaSearchPlus /></button>
          <button aria-label="Réinitialiser le zoom" onClick={() => setZoom(1)}><FaCompress /></button>
          <button aria-label="Réduire" onClick={() => setZoom(z => Math.max(z - .2,.3))}><FaSearchMinus /></button>
        </div>
      </div>

      {/* Modale de détails (inchangée) */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog" aria-modal="true" aria-label={selectedQuest.name} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedQuest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-[#191916] w-full max-w-2xl rounded-sm shadow-none border border-stone-600 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modale */}
              <div className="p-6 border-b border-stone-700 flex justify-between items-start bg-stone-950/50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-yellow-500/10 px-2 py-1 rounded">
                      {selectedQuest.category}
                    </span>
                    <span className="text-xs text-stone-500 uppercase tracking-wider border border-stone-600 px-2 py-1 rounded">
                      {selectedQuest.type}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      ID: {selectedQuest.questId}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {selectedQuest.name}
                  </h2>
                </div>
                <button
                  aria-label="Fermer les détails de la quête"
                  onClick={() => setSelectedQuest(null)}
                  className="text-stone-400 hover:text-white transition p-1"
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
                  <p className="text-stone-300 leading-relaxed">
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
                            className="bg-stone-800/50 p-3 rounded-lg border border-stone-700 flex items-start gap-3"
                          >
                            <span className="bg-gray-600 text-xs font-bold px-2 py-1 rounded text-stone-300 mt-0.5">
                              {obj.type}
                            </span>
                            <div className="text-sm text-stone-200">
                              {obj.type === "ITEM" &&
                                obj.target?.items?.map((it, i) => (
                                  <div key={i}>
                                    • Récupérer {it.count}x{" "}
                                    <span className="text-amber-200">
                                      {it.itemId}
                                    </span>
                                  </div>
                                ))}
                              {obj.type === "LOCATION" && (
                                <div>
                                  • Se rendre aux coordonnées :{" "}
                                  <span className="text-yellow-300 font-mono">
                                    {obj.target?.coord}
                                  </span>
                                </div>
                              )}
                              {/* Fallback pour autres types */}
                              {["NPC", "TALK"].includes(obj.type) && (
                                <div>• Parler au PNJ : <span className="text-purple-300">{getObjectiveNpcLabel(obj)}</span></div>
                              )}
                              {!["ITEM", "LOCATION", "NPC", "TALK"].includes(obj.type) && (
                                <div>• Validation : {obj.validation || "ADMIN"}</div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Récompenses */}
                <div className="bg-stone-800/30 p-4 rounded-sm border border-stone-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    🎁 Récompenses
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedQuest.money > 0 && (
                      <div className="flex items-center gap-2 bg-[#191916] px-3 py-2 rounded-lg border border-stone-600">
                        <FaCoins className="text-amber-300" />
                        <span className="font-bold text-yellow-100">
                          <MoneyDisplay value={selectedQuest.money} />
                        </span>
                      </div>
                    )}
                    {selectedQuest.xp && (
                      <div className="flex items-center gap-2 bg-[#191916] px-3 py-2 rounded-lg border border-stone-600">
                        <FaStar className="text-amber-300" />
                        <span className="font-bold text-blue-100">
                          {selectedQuest.xp.amount} XP
                        </span>
                        <span className="text-xs text-stone-500 uppercase ml-1">
                          ({selectedQuest.xp.job})
                        </span>
                      </div>
                    )}
                    {selectedQuest.rewards?.map((reward, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#191916] px-3 py-2 rounded-lg border border-stone-600"
                      >
                        <span className="text-green-400 font-bold">
                          {reward.count}x
                        </span>
                        <span className="text-stone-200">{reward.itemId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NPC & Dialogues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-400">
                  <div>
                    <span className="font-semibold text-stone-500 block mb-1">
                      PNJ de départ
                    </span>
                    <span className="text-white bg-stone-800 px-2 py-1 rounded">
                      {getNpcLabel(selectedQuest.startNpcName, selectedQuest.startNpcId)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-500 block mb-1">PNJ de validation</span>
                    <span className="text-white bg-stone-800 px-2 py-1 rounded">
                      {getNpcLabel(selectedQuest.completionNpcName, selectedQuest.completionNpcId)}
                    </span>
                  </div>
                  {selectedQuest.prerequisitesAll?.length > 0 && (
                    <div>
                      <span className="font-semibold text-stone-500 block mb-1">
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
              <div className="p-6 border-t border-stone-700 bg-stone-950/50 flex justify-end">
                <button
                  aria-label="Fermer les détails de la quête"
                  onClick={() => setSelectedQuest(null)}
                  className="px-6 py-2 bg-stone-800 hover:bg-gray-600 text-white rounded-lg transition font-medium"
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
