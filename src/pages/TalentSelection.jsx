import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayerJobs, getJobDetails } from "../data/api";
import { useUser } from "../context/UserContext"; // ✅ Import du contexte utilisateur

function TalentSelection() {
  const { userId } = useUser(); // ✅ Récupération depuis l'état global
  const [jobs, setJobs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      alert("❌ Vous devez être connecté pour accéder à cette page !");
      navigate("/home");
      return;
    }
  
    async function fetchData() {
      try {
        const jobsData = await getPlayerJobs(userId);
        console.log("Données des métiers récupérées :", jobsData);
  
        // 🔥 Correction ici : extraire directement la liste des métiers
        setJobs(jobsData?.jobs?.jobs ?? {}); 
      } catch (error) {
        console.error("Erreur lors de la récupération des métiers :", error);
      }
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
              onClick={async () => {
                if (!isLocked) {
                  try {
                    const jobDetails = await getJobDetails(jobKey);
          
                    console.error("WTF : ", jobDetails.inter_choice);
                    if (jobDetails?.inter_choice?.length === 0) {
                      navigate(`/talents/${jobKey}?userId=${userId}`);
                    } else {
                      navigate(`/talent2/${jobKey}?userId=${userId}`);
                    }
                  } catch (error) {
                    console.error("❌ Erreur lors de la récupération des détails du métier :", error);
                    alert("Erreur lors de la récupération des informations du métier !");
                  }
                }
              }}
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
