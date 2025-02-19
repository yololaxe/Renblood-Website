import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlayerData } from "../data/api";

function TalentTree() {
  const { profession } = useParams();
  const navigate = useNavigate();
  const [talentData, setTalentData] = useState(null);
  const [unlockedTalents, setUnlockedTalents] = useState({});
  const [availablePoints, setAvailablePoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      console.log(`🔄 Chargement des talents pour : ${profession}`);

      const storedPlayerData = sessionStorage.getItem("mcData");
      let playerData;

      if (storedPlayerData) {
        console.log("📂 Données trouvées en cache !");
        playerData = JSON.parse(storedPlayerData);
      } else {
        console.log("📡 Récupération des données depuis l'API...");
        playerData = await getPlayerData(localStorage.getItem("userId"));
        if (!playerData) {
          setError("Impossible de récupérer les données du joueur.");
          setLoading(false);
          return;
        }
        sessionStorage.setItem("mcData", JSON.stringify(playerData));
      }

      // Vérification du job
      const job = playerData.experiences?.jobs?.[profession];

      if (!job || job.xp === -1) {
        alert("⚠️ Ce métier est verrouillé ou inexistant !");
        navigate("/choosetalent");
        return;
      }

      const usedPoints = job.progression.filter((p) => p).length;
      setAvailablePoints(job.level - usedPoints);

      initializeUnlockedTalents(job.progression);

      try {
        console.log(`📡 Chargement des talents depuis /data/talents/${profession}.json`);
        const response = await fetch(`/data/talents/${profession}.json`);
        if (!response.ok) throw new Error("Le fichier JSON des talents est introuvable !");
        const talents = await response.json();
        console.log("✅ Talents chargés :", talents);
        setTalentData(talents);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des talents :", error);
        setError("Erreur de chargement des talents.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [profession, navigate]);

  const initializeUnlockedTalents = (progression) => {
    setUnlockedTalents({
      choice_1: [progression[0], progression[1], progression[2]],
      choice_2: [progression[3], progression[4], progression[5]],
      choice_3: [progression[6], progression[7], progression[8]],
    });
  };

  if (loading) return <p className="text-center text-gray-400 mt-10">⏳ Chargement...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">❌ {error}</p>;

  return (
    <div className="p-6 text-white text-center">
      <h1 className="text-3xl font-bold mb-4">🌳 Arbre des Talents - {talentData.name}</h1>
      <p className="text-lg mb-6">Points de talent disponibles : {availablePoints}</p>

      <div className="grid grid-cols-3 gap-4 justify-center">
        {Object.entries(talentData.skills).map(([choice, skills], choiceIndex) => (
          <div key={choice} className="flex flex-col items-center space-y-3">
            {skills.map((skill, tierIndex) => (
              <div key={skill.id} className="flex flex-col items-center">
                <button
                  className={`w-20 h-20 rounded-full border-4 text-sm text-white flex items-center justify-center
                    ${unlockedTalents[choice][tierIndex] ? "bg-green-500 border-green-400" : "bg-gray-600 border-gray-500"}
                    hover:scale-105 transition`}
                >
                  {skill.name}
                </button>
                {tierIndex < skills.length - 1 && (
                  <div className="text-white text-2xl mt-[-8px]">⬇️</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div className="text-white text-2xl mt-[-8px]">⬇️</div>
        <button
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-lg font-semibold transition"
        >
          🔥 Débloquer Talent Niveau 10
        </button>
      </div>
    </div>
  );
}

export default TalentTree;
