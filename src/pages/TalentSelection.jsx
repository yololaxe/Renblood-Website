import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayerData } from "../data/api";

function TalentSelection({ userId }) {
  const [playerData, setPlayerData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const data = await getPlayerData(userId);
      setPlayerData(data);
    }
    fetchData();
  }, [userId]);

  if (!playerData) return <p className="text-center text-gray-400 mt-10">Chargement...</p>;

  const jobs = playerData.experiences?.jobs || {};

  return (
    <div className="p-10 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">⚒️ Sélectionnez un Métier</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {Object.keys(jobs).map((jobKey) => {
          const job = jobs[jobKey];
          const isLocked = job.xp === -1;
          return (
            <button
              key={jobKey}
              onClick={() => !isLocked && navigate(`/talents/${jobKey}`)}
              className={`p-6 rounded-lg text-lg font-semibold transition
                ${isLocked ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"}`}
              disabled={isLocked}
            >
              {jobKey.charAt(0).toUpperCase() + jobKey.slice(1)}{" "}
              {!isLocked ? `- XP: ${job.xp}` : "🔒"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TalentSelection;
