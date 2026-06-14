import React, { useEffect, useState } from "react";
import { cancelPlayerQuestState, getPlayerQuests, getQuestsList } from "../../services/api";
import { FaCheckCircle, FaRunning, FaTimes, FaTrash } from "react-icons/fa";

export default function PlayerQuests({ playerId }) {
  const [playerQuests, setPlayerQuests] = useState([]);
  const [allQuests, setAllQuests] = useState({});
  const [loading, setLoading] = useState(true);
  const [cancellingQuestId, setCancellingQuestId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [playerQuestsData, allQuestsData] = await Promise.all([
          getPlayerQuests(playerId),
          getQuestsList()
        ]);
        
        setPlayerQuests(playerQuestsData || []);
        
        const questsMap = allQuestsData.reduce((acc, q) => {
          acc[q.questId] = q;
          return acc;
        }, {});
        setAllQuests(questsMap);

      } catch (error) {
        console.error("Erreur chargement quêtes du joueur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [playerId]);

  const handleCancelQuest = async (questId, questName) => {
    if (!window.confirm(`Annuler la quête "${questName}" pour ce joueur ? Sa progression sur cette quête sera supprimée.`)) {
      return;
    }

    setCancellingQuestId(questId);
    const cancelled = await cancelPlayerQuestState(playerId, questId);
    setCancellingQuestId(null);

    if (!cancelled) {
      alert("La quête n'a pas pu être annulée.");
      return;
    }

    setPlayerQuests(current => current.filter(quest => quest.quest_id !== questId));
  };

  if (loading) return <p className="text-center text-gray-400 py-10">Chargement des quêtes...</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white mb-4">Suivi des Quêtes</h3>
      
      {playerQuests.length === 0 ? (
        <p className="text-gray-500 italic bg-gray-800 p-4 rounded-lg text-center">Ce joueur n'a progressé dans aucune quête.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {playerQuests.map(pq => {
            const questDetails = allQuests[pq.quest_id] || { name: pq.quest_id, category: "Inconnue" };
            const isCompleted = pq.status === "COMPLETED";
            const isInProgress = pq.status === "IN_PROGRESS";

            return (
              <div 
                key={pq.quest_id}
                className={`p-4 rounded-lg border flex flex-col justify-between transition-colors hover:border-gray-500 ${
                  isCompleted ? "bg-green-900/10 border-green-700/30" :
                  isInProgress ? "bg-blue-900/10 border-blue-700/30" :
                  "bg-gray-700/20 border-gray-600"
                }`}
              >
                <div className="mb-3">
                  <p className="font-bold text-white text-base leading-tight mb-1">{questDetails.name}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-400 font-mono bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">{pq.quest_id}</span>
                    <span className="text-yellow-500/80">{questDetails.category}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-3">
                  <div className={`self-start px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border ${
                    isCompleted ? "bg-green-900/50 text-green-400 border-green-700" :
                    isInProgress ? "bg-blue-900/50 text-blue-400 border-blue-700" :
                    "bg-gray-800 text-gray-500 border-gray-600"
                  }`}>
                    {isCompleted ? <FaCheckCircle /> : isInProgress ? <FaRunning /> : <FaTimes />}
                    {pq.status === "IN_PROGRESS" ? "EN COURS" : pq.status === "COMPLETED" ? "TERMINÉE" : pq.status}
                  </div>
                  <button
                    type="button"
                    disabled={cancellingQuestId === pq.quest_id}
                    onClick={() => handleCancelQuest(pq.quest_id, questDetails.name)}
                    className="flex items-center gap-1 rounded-lg border border-red-700/60 bg-red-900/30 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-900/60 disabled:cursor-wait disabled:opacity-50"
                  >
                    <FaTrash />
                    {cancellingQuestId === pq.quest_id ? "Annulation..." : "Annuler"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
