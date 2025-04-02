import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getPlayerJobs, getJobDetails, updateTalentProgression } from "../services/api";

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

      const jobsData = await getPlayerJobs(userId);
      console.log("🔍 Données des métiers récupérées :", jobsData);

      const playerJob = jobsData?.jobs?.jobs?.[profession]; // ✅ Correction ici
      if (!playerJob || playerJob.xp === -1) {
        alert("⚠️ Ce métier est verrouillé !");
        return;
      }

      const talents = await getJobDetails(profession);
      if (!talents) {
        console.error("❌ Impossible de charger les talents.");
        return;
      }

      setTalentData(talents);
      setAvailablePoints(playerJob.level - playerJob.progression.filter((p) => p).length);
      initializeUnlockedTalents(playerJob.progression);
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
    const choiceKey = `choice_${choiceIndex + 1}`;

    // ✅ Vérifie si le talent est déjà débloqué
    if (unlockedTalents[choiceKey][tierIndex]) {
      alert("⚠️ Ce talent est déjà débloqué !");
      return;
    }

    if (availablePoints <= 0) {
      alert("⚠️ Vous n'avez pas assez de points de talent !");
      return;
    }

    if (tierIndex > 0 && !unlockedTalents[choiceKey][tierIndex - 1]) {
      alert("⚠️ Vous devez débloquer le talent précédent !");
      return;
    }

    const confirmPurchase = window.confirm("💡 Voulez-vous vraiment débloquer ce talent ?");
    if (!confirmPurchase) return;

    // ✅ Mise à jour de l'état et exécution de l'API dans un callback
    setUnlockedTalents((prev) => {
      const updatedTalents = { ...prev };
      updatedTalents[choiceKey][tierIndex] = true;

      // ✅ Construire newProgression avec les nouvelles valeurs mises à jour
      const newProgression = [
        ...updatedTalents.choice_1,
        ...updatedTalents.choice_2,
        ...updatedTalents.choice_3,
        false, // Assure que le 10ème élément est bien la maîtrise
      ];

      console.log("✅ Nouvelle progression envoyée :", newProgression);

      // ✅ Appelle l'API après la mise à jour de l'état
      updateTalentProgression(userId, profession, newProgression);

      return updatedTalents;
    });

    setAvailablePoints((prev) => prev - 1);
  };






  const unlockLevel10 = () => {
    const allUnlocked = Object.values(unlockedTalents).every((tier) => tier.every((talent) => talent));

    if (!allUnlocked) {
      alert("⚠️ Vous devez débloquer tous les talents pour accéder au niveau 10 !");
      return;
    }

    if (availablePoints <= 0) {
      alert("⚠️ Vous devez avoir au moins 1 point de talent disponible pour débloquer le niveau 10 !");
      return;
    }

    if (!talentData?.mastery) {
      console.error("❌ Erreur : Le talent de niveau 10 est introuvable.");
      alert("❌ Erreur : Impossible de débloquer ce talent.");
      return;
    }

    alert(`🎉 Félicitations ! Vous avez débloqué : ${talentData.mastery.join(", ")}`);
    setAvailablePoints((prev) => prev - 1);
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
            {skills.map((skill, tierIndex) => {
              const choiceKey = `choice_${choiceIndex + 1}`;
              const isUnlocked = unlockedTalents[choiceKey][tierIndex];
              const isBlocked = availablePoints <= 0 || (tierIndex > 0 && !unlockedTalents[choiceKey][tierIndex - 1]);

              return (
                <div key={skill.id} className="flex flex-col items-center">
                  <button
                    onClick={() => !unlockedTalents[choiceKey][tierIndex] && handleUnlockTalent(choiceIndex, tierIndex)}
                    className={`w-20 h-20 rounded-full border-4 text-sm flex items-center justify-center
    ${unlockedTalents[choiceKey][tierIndex] ? "bg-green-500 border-green-400 cursor-not-allowed" :
                        availablePoints <= 0 ? "bg-gray-800 border-gray-700 cursor-not-allowed" : "bg-gray-600 border-gray-500"}
    hover:scale-105 transition`}
                    disabled={unlockedTalents[choiceKey][tierIndex] || availablePoints <= 0}
                  >

                    {skill.name}
                  </button>
                  {tierIndex < skills.length - 1 && <div className="text-white text-2xl mt-[-8px]">⬇️</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>



      <div className="mt-8 flex flex-col items-center">
        <div className="text-white text-2xl mt-[-8px]">⬇️</div>
        <button
          onClick={unlockLevel10}
          className={`px-6 py-3 rounded-lg text-lg font-semibold transition
      ${availablePoints <= 0 || !Object.values(unlockedTalents).every((tier) => tier.every((talent) => talent))
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
            }`}
          disabled={availablePoints <= 0 || !Object.values(unlockedTalents).every((tier) => tier.every((talent) => talent))}
        >
          🔥 Débloquer Talent Niveau 10
        </button>
      </div>

    </div>
  );
}


export default TalentTree;
