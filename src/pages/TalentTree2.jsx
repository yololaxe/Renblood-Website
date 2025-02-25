import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getPlayerJobs, getJobDetails, updateTalentProgression } from "../data/api";

function TalentTree2() {
  const { profession } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");

  const [talentData, setTalentData] = useState(null);
  const [unlockedTalents, setUnlockedTalents] = useState({});
  const [availablePoints, setAvailablePoints] = useState(0);
  const [unlockedInterChoices, setUnlockedInterChoices] = useState([false, false]);

  useEffect(() => {
    async function fetchData() {
      if (!userId) {
        console.error("❌ Aucune userId fournie !");
        return;
      }

      const jobsData = await getPlayerJobs(userId);
      console.log("🔍 Données des métiers récupérées :", jobsData);

      const playerJob = jobsData?.jobs?.jobs?.[profession];
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
      initializeUnlockedTalents(playerJob.progression, talents.skills);
    }
    fetchData();
  }, [userId, profession]);

  const initializeUnlockedTalents = (progression, skills) => {
    let unlocked = {};
    Object.keys(skills).forEach((choice, index) => {
      unlocked[choice] = skills[choice].map((_, i) => progression[i + index * skills[choice].length] || false);
    });
    setUnlockedTalents(unlocked);
    setUnlockedInterChoices([
      progression[12] ?? false,
      progression[13] ?? false
    ]);
  };

  const updateProgression = (newUnlockedTalents, newUnlockedInterChoices) => {
    const newProgression = [
      ...newUnlockedTalents.choice_1,
      ...newUnlockedTalents.choice_2,
      ...newUnlockedTalents.choice_3,
      ...newUnlockedTalents.choice_4,
      newUnlockedInterChoices[0] ?? false,
      newUnlockedInterChoices[1] ?? false,
      false // Mastery Level
    ];
    console.log("✅ Nouvelle progression envoyée :", newProgression);
    updateTalentProgression(userId, profession, newProgression);
  };

  const handleUnlockTalent = (choiceIndex, tierIndex) => {
    const choiceKey = `choice_${choiceIndex + 1}`;

    if (unlockedTalents[choiceKey][tierIndex] || availablePoints <= 0) return;

    if (tierIndex > 0 && !unlockedTalents[choiceKey][tierIndex - 1]) {
      alert("⚠️ Vous devez débloquer le talent précédent !");
      return;
    }

    if (!window.confirm("💡 Voulez-vous vraiment débloquer ce talent ?")) return;

    setUnlockedTalents((prev) => {
      const updatedTalents = { ...prev };
      updatedTalents[choiceKey][tierIndex] = true;
      updateProgression(updatedTalents, unlockedInterChoices);
      return updatedTalents;
    });

    setAvailablePoints((prev) => prev - 1);
  };

  const handleUnlockInterChoice = (index) => {
    if (!canUnlockInterChoice(index) || availablePoints <= 0) return;

    alert(`🎉 Vous avez débloqué : ${talentData.inter_choice[index]}`);

    setUnlockedInterChoices((prev) => {
      const updatedChoices = [...prev];
      updatedChoices[index] = true;
      updateProgression(unlockedTalents, updatedChoices);
      return updatedChoices;
    });

    setAvailablePoints((prev) => prev - 1);
  };

  const canUnlockInterChoice = (index) => {
    if (!talentData?.inter_choice?.length) return false;
    if (unlockedInterChoices[index]) return false;

    return index === 0
      ? unlockedTalents.choice_1.every((t) => t) && unlockedTalents.choice_2.every((t) => t)
      : unlockedTalents.choice_3.every((t) => t) && unlockedTalents.choice_4.every((t) => t);
  };

  const unlockMastery = () => {
    // Vérifie si tous les talents et inter_choices sont débloqués
    const allTalentsUnlocked = Object.values(unlockedTalents).every((tier) => tier.every((talent) => talent));
    const allInterChoicesUnlocked = unlockedInterChoices.every((choice) => choice);

    if (!allTalentsUnlocked || !allInterChoicesUnlocked) {
      alert("⚠️ Vous devez débloquer tous les talents ET les choix intermédiaires pour accéder à la maîtrise !");
      return;
    }

    if (availablePoints <= 0) {
      alert("⚠️ Vous devez avoir au moins 1 point disponible pour débloquer la maîtrise !");
      return;
    }

    alert(`🎉 Félicitations ! Vous avez débloqué : ${talentData.mastery.join(", ")}`);
    setAvailablePoints((prev) => prev - 1);
  };


  if (!talentData) return <p className="text-center text-gray-400 mt-10">Chargement...</p>;

  return (
    <div className="p-6 text-white text-center">
      <h1 className="text-3xl font-bold mb-4">🏛️ Arbre des Talents - {talentData.name}</h1>
      <p className="text-lg mb-6">Points disponibles : {availablePoints}</p>

      <div className="grid grid-cols-4 gap-4 justify-center">
        {Object.entries(talentData.skills).map(([choice, skills], choiceIndex) => (
          <div key={choice} className="flex flex-col items-center space-y-3">
            {skills.map((skill, tierIndex) => {
              const choiceKey = `choice_${choiceIndex + 1}`;
              const isUnlocked = unlockedTalents[choiceKey][tierIndex];

              return (
                <div key={skill.id} className="flex flex-col items-center">
                  <button
                    onClick={() => handleUnlockTalent(choiceIndex, tierIndex)}
                    className={`w-20 h-20 rounded-full border-4 text-sm flex items-center justify-center ${isUnlocked ? "bg-green-500 border-green-400 cursor-not-allowed"
                        : "bg-gray-600 border-gray-500 hover:scale-105 transition"
                      }`}
                    disabled={isUnlocked}
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

      <div className="mt-6 text-center">
        <h2 className="text-xl font-bold mb-3">✨ Choix Intermédiaires :</h2>
        {talentData.inter_choice.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleUnlockInterChoice(index)}
            className={`px-4 py-2 w-full rounded-lg text-lg font-semibold transition ${canUnlockInterChoice(index) ? "bg-yellow-500 hover:bg-yellow-400" : "bg-gray-600 cursor-not-allowed"
              }`}
            disabled={!canUnlockInterChoice(index)}
          >
            {choice}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <button onClick={unlockMastery} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-lg font-semibold transition">
          🎖️ Débloquer Maîtrise
        </button>
      </div>
    </div>
  );
}

export default TalentTree2;
