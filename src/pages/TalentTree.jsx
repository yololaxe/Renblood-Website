import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getPlayerJobs, getJobDetails, updateTalentProgression } from "../data/api";

function TalentTree() {
  const { profession } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");

  const [talentData, setTalentData] = useState(null);
  const [unlockedTalents, setUnlockedTalents] = useState({});
  const [availablePoints, setAvailablePoints] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!userId) {
        console.error("❌ Aucune userId fournie !");
        return;
      }

      // 🔥 Récupère les métiers du joueur
      const jobsData = await getPlayerJobs(userId);
      if (!jobsData || !jobsData.jobs[profession] || jobsData.jobs[profession].xp === -1) {
        alert("⚠️ Ce métier est verrouillé !");
        return;
      }

      // 🔥 Récupère les talents du métier
      const talents = await getJobDetails(profession);
      if (!talents) {
        console.error("❌ Impossible de charger les talents.");
        return;
      }

      setTalentData(talents);
      setAvailablePoints(jobsData.jobs[profession].level - jobsData.jobs[profession].progression.filter((p) => p).length);
      initializeUnlockedTalents(jobsData.jobs[profession].progression);
    }

    fetchData();
  }, [userId, profession]);

  const initializeUnlockedTalents = (progression) => {
    setUnlockedTalents({
      choice_1: [progression[0], progression[1], progression[2]],
      choice_2: [progression[3], progression[4], progression[5]],
      choice_3: [progression[6], progression[7], progression[8]],
    });
  };

  const handleUnlockTalent = async (choiceIndex, tierIndex) => {
    if (availablePoints <= 0) {
      alert("⚠️ Vous n'avez pas assez de points de talent !");
      return;
    }
  
    const choiceKey = `choice_${choiceIndex + 1}`;
    if (tierIndex > 0 && !unlockedTalents[choiceKey][tierIndex - 1]) {
      alert("⚠️ Vous devez débloquer le talent précédent !");
      return;
    }
  
    // 🟢 Confirmation avant achat
    const confirmPurchase = window.confirm("💡 Voulez-vous vraiment débloquer ce talent ?");
    if (!confirmPurchase) return;
  
    // 🟢 Mise à jour locale des talents débloqués
    const updatedTalents = { ...unlockedTalents };
    updatedTalents[choiceKey][tierIndex] = true;
    setUnlockedTalents(updatedTalents);
    setAvailablePoints((prev) => prev - 1);
  
    // 🟢 Convertit la structure des talents en une seule liste pour l'API
    const newProgression = [
      ...updatedTalents.choice_1,
      ...updatedTalents.choice_2,
      ...updatedTalents.choice_3,
      false, // Assure que le 10ème élément est bien la maîtrise
    ];
  
    await updateTalentProgression(userId, profession, newProgression);
  };
  
  

  const unlockLevel10 = () => {
    const allUnlocked = Object.values(unlockedTalents).every((tier) => tier.every((talent) => talent));
    if (!allUnlocked) {
      alert("⚠️ Vous devez débloquer tous les talents pour accéder au niveau 10 !");
      return;
    }
    alert(`🎉 Félicitations ! Vous avez débloqué : ${talentData.level_10_skill.options.join(", ")}`);
  };

  if (!talentData) return <p className="text-center text-gray-400 mt-10">Chargement...</p>;

  return (
    <div className="p-6 text-white text-center">
      <h1 className="text-3xl font-bold mb-4">🌳 Arbre des Talents - {talentData.name}</h1>
      <p className="text-lg mb-6">Points de talent disponibles : {availablePoints}</p>

      {/* 🌿 Affichage des talents en GRILLE */}
      <div className="grid grid-cols-3 gap-4 justify-center">
        {Object.entries(talentData.skills).map(([choice, skills], choiceIndex) => (
          <div key={choice} className="flex flex-col items-center space-y-3">
            {skills.map((skill, tierIndex) => (
              <div key={skill.id} className="flex flex-col items-center">
                <button
                  onClick={() => handleUnlockTalent(choiceIndex, tierIndex)} // 🔥 Appel ici
                  className={`w-20 h-20 rounded-full border-4 text-sm text-white flex items-center justify-center
              ${unlockedTalents[choice][tierIndex] ? "bg-green-500 border-green-400" : "bg-gray-600 border-gray-500"}
              hover:scale-105 transition`}
                >
                  {skill.name}
                </button>
                {/* ⬇️ Flèche */}
                {tierIndex < skills.length - 1 && (
                  <div className="text-white text-2xl mt-[-8px]">⬇️</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>


      {/* 🎯 Talent de niveau 10 */}
      <div className="mt-8 flex flex-col items-center">
        <div className="text-white text-2xl mt-[-8px]">⬇️</div>
        <button
          onClick={unlockLevel10}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-lg font-semibold transition"
        >
          🔥 Débloquer Talent Niveau 10
        </button>
      </div>
    </div>
  );
}


export default TalentTree;
