import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayerJobs } from "../data/api";
import { useUser } from "../context/UserContext"; // ✅ Import du contexte utilisateur

function TalentSelection() {
  const { userId } = useUser(); // ✅ Récupération depuis l'état global
  const [jobs, setJobs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      alert("❌ Vous devez être connecté pour accéder à cette page !");
      navigate("/home"); // ✅ Redirige vers l'accueil
      return;
    }

    async function fetchData() {
      const jobsData = await getPlayerJobs(userId);
      setJobs(jobsData.jobs || {});
    }
    fetchData();
  }, [userId, navigate]);

  if (!userId) return <p className="text-center text-gray-400 mt-10">❌ Utilisateur non connecté !</p>;
  if (!jobs) return <p className="text-center text-gray-400 mt-10">Chargement...</p>;

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
              onClick={() => !isLocked && navigate(`/talents/${jobKey}?userId=${userId}`)}
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
