import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  getPlayerJobs,
  getJobDetails,
  updateTalentProgression,
} from "../services/api";
import items from "../data/node";
import Tooltip from "../components/Tooltip";

function TalentTree() {
  const { profession } = useParams();
  const userId = new URLSearchParams(useLocation().search).get("userId");

  const [talentData, setTalentData] = useState(null);
  const [unlockedTalents, setUnlockedTalents] = useState({});
  const [availablePoints, setAvailablePoints] = useState(0);
  const [unlockedMastery, setUnlockedMastery] = useState(false);

  // id → meta
  const itemMap = useMemo(
    () =>
      items.reduce((m, it) => {
        m[it.id] = it;
        return m;
      }, {}),
    []
  );

  useEffect(() => {
    async function init() {
      if (!userId) return console.error("Aucune userId fournie");
      const jobsData = await getPlayerJobs(userId);
      const playerJob = jobsData?.jobs?.jobs?.[profession];
      if (!playerJob || playerJob.xp === -1) {
        alert("Ce métier est verrouillé !");
        return;
      }
      const talents = await getJobDetails(profession);
      setTalentData(talents);

      const prog = playerJob.progression;
      setAvailablePoints(
        Math.max(0, playerJob.level - prog.filter(Boolean).length)
      );
      setUnlockedTalents({
        choice_1: prog.slice(0, 3),
        choice_2: prog.slice(3, 6),
        choice_3: prog.slice(6, 9),
      });
      // 10th slot is mastery
      setUnlockedMastery(prog[9] || false);
    }
    init();
  }, [userId, profession]);

  // Retire suffixe "_N"
  const strip = (code) => {
    const m = code.match(/^(.+)_([0-9]+)$/);
    return m ? { base: m[1], lvl: m[2] } : { base: code, lvl: null };
  };

  // Construit le texte affiché
  const displayName = (code) => {
    const { base, lvl } = strip(code);
    const name = itemMap[base]?.fr_name || base;
    return lvl ? `${name}${lvl}` : name;
  };

  // Met à jour progression (+ mastery)
  const updateProg = (tal, mastery) => {
    const prog = [
      ...tal.choice_1,
      ...tal.choice_2,
      ...tal.choice_3,
      mastery,
    ];
    updateTalentProgression(userId, profession, prog);
  };

  const handleUnlock = (ci, ti) => {
    const key = `choice_${ci + 1}`;
    if (unlockedTalents[key][ti] || availablePoints < 1) return;
    if (ti > 0 && !unlockedTalents[key][ti - 1]) {
      alert("Débloquez d'abord le précédent");
      return;
    }
    if (!window.confirm("Confirmez ?")) return;

    setUnlockedTalents((prev) => {
      const nxt = { ...prev };
      nxt[key][ti] = true;
      updateProg(nxt, unlockedMastery);
      return nxt;
    });
    setAvailablePoints((p) => p - 1);
  };

  const canMastery =
    talentData?.mastery?.length &&
    Object.values(unlockedTalents).flat().every(Boolean) &&
    !unlockedMastery &&
    availablePoints > 0;

  const handleMastery = () => {
    if (!canMastery) return;
    const code = talentData.mastery[0];
    alert(`🎖️ Maîtrise débloquée : ${displayName(code)}`);
    setUnlockedMastery(true);
    updateProg(unlockedTalents, true);
    setAvailablePoints((p) => p - 1);
  };

  if (!talentData) {
    return (
      <p className="text-center text-gray-400 mt-20 text-lg">Chargement...</p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 text-white">
      <h1 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-400">
        🌳 Arbre des Talents – {talentData.name}
      </h1>
      <p className="text-center mb-8 text-lg">
        Points disponibles :{" "}
        <span className="font-bold text-green-300">{availablePoints}</span>
      </p>

      <div className="grid grid-cols-3 gap-12">
        {Object.entries(talentData.skills).map(([choice, skills], ci) => {
          const key = `choice_${ci + 1}`;
          return (
            <div key={choice} className="space-y-6">
              {skills.map((skill, ti) => {
                const code = skill.name;
                const { base } = strip(code);
                const meta = itemMap[base] || {};
                const unlocked = unlockedTalents[key][ti];
                const blocked =
                  ti > 0 && !unlockedTalents[key][ti - 1]
                    ? true
                    : availablePoints < 1;

                return (
                  <div
                    key={skill.id}
                    className="flex flex-col items-center"
                  >
                    <Tooltip text={meta.fr_description || ""}>
                      <button
                        onClick={() => handleUnlock(ci, ti)}
                        disabled={unlocked || blocked}
                        className={`w-24 h-24 rounded-full flex items-center justify-center p-2 text-center text-sm font-medium transition-shadow ${
                          unlocked
                            ? "bg-green-600 shadow-lg"
                            : blocked
                            ? "bg-gray-700 cursor-not-allowed"
                            : "bg-gray-600 hover:bg-gray-500 shadow-md"
                        }`}
                      >
                        {displayName(code)}
                      </button>
                    </Tooltip>
                    {ti < skills.length - 1 && (
                      <svg
                        className="w-6 h-6 text-gray-400 mt-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Talent final de maîtrise en rectangle doré */}
      <div className="mt-12 flex justify-center">
        {talentData.mastery.map((code) => {
          const { base } = strip(code);
          const meta = itemMap[base] || {};
          const tooltip = meta.fr_description || "";
          const available = canMastery;
          const unlocked = unlockedMastery;

          const btnClass = unlocked
            ? "bg-green-600 shadow-lg"
            : available
            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-md"
            : "bg-gray-700 cursor-not-allowed";

          return (
            <Tooltip key={code} text={tooltip}>
              <button
                onClick={handleMastery}
                disabled={!available}
                className={`
                  px-8 py-4 rounded-lg text-xl font-bold text-white transition
                  ${btnClass}
                `}
              >
                {displayName(code)}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

export default TalentTree;
