// src/pages/TalentTree.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  getPlayerJobs,
  getJobDetails,
  updateTalentProgression,
  updateJobLevel,
  getAllNodes,
    addBonus
} from "../../services/api.js";
import Tooltip from "../../components/Tooltip.jsx";

export default function TalentTree() {
  const { profession } = useParams();
  const userId = new URLSearchParams(useLocation().search).get("userId");

  const [talentData, setTalentData] = useState(null);
  const [unlockedTalents, setUnlockedTalents] = useState({});
  const [availablePoints, setAvailablePoints] = useState(0);
  const [unlockedMastery, setUnlockedMastery] = useState(false);
  const [itemMap, setItemMap] = useState({});

  useEffect(() => {
    async function init() {
      if (!userId) {
        console.error("Aucune userId fournie");
        return;
      }

      // 1️⃣ Met à jour le level du métier
      try {
        await updateJobLevel(userId, profession);
      } catch (e) {
        console.warn("Impossible de mettre à jour le level du métier", e);
      }

      // 2️⃣ Charge tous les nodes pour les tooltips
      const nodeList = await getAllNodes();
      const map = nodeList.reduce((acc, it) => {
        acc[it.id] = it;
        return acc;
      }, {});
      setItemMap(map);

      // 3️⃣ Récupère le job du joueur
      const jobsData = await getPlayerJobs(userId);
      const playerJob = jobsData?.jobs?.jobs?.[profession];
      if (!playerJob || playerJob.xp === -1) {
        alert("Ce métier est verrouillé !");
        return;
      }

      // 4️⃣ Charge l'arbre de talents
      const talents = await getJobDetails(profession);
      setTalentData(talents);

      // 5️⃣ Initialise l'état local des débloqués
      const prog = playerJob.progression; // array de bools
      setAvailablePoints(
        Math.max(0, playerJob.level - prog.filter(Boolean).length)
      );
      setUnlockedTalents({
        choice_1: prog.slice(0, 3),
        choice_2: prog.slice(3, 6),
        choice_3: prog.slice(6, 9),
      });
      setUnlockedMastery(!!prog[9]);
    }

    init();
  }, [userId, profession]);

  const strip = (code) => {
    const m = code.match(/^(.+)_([0-9]+)$/);
    return m
      ? { base: m[1], lvl: parseInt(m[2], 10) }
      : { base: code, lvl: null };
  };

  const displayName = (code) => {
    const { base, lvl } = strip(code);
    const name = itemMap[base]?.fr_name || base;
    return lvl != null ? `${name}${lvl}` : name;
  };

  const updateProg = (tal, mastery) => {
    const prog = [
      ...tal.choice_1,
      ...tal.choice_2,
      ...tal.choice_3,
      mastery,
    ];
    updateTalentProgression(userId, profession, prog);
  };

  const handleUnlock = async (ci, ti, skills) => {
    const key = `choice_${ci + 1}`;
    const branch = unlockedTalents[key] || [];
    // déjà débloqué ou pas assez de points ?
    if (branch[ti] || availablePoints < 1) return;
    // dépendance
    if (ti > 0 && !branch[ti - 1]) {
      alert("Débloquez d'abord le palier précédent");
      return;
    }
    if (!window.confirm("Confirmez le déblocage ?")) return;

    const code = skills[ti].name;
    const { base, lvl } = strip(code);

    // bonus COMP-..._5
    if (base.startsWith("COMP-") && lvl === 5) {
      const stat = base.replace(/^COMP-/, "").toLowerCase();
      try {
        await addBonus(userId, stat, lvl, "COMP");
      } catch {
        console.warn("Le bonus n'a pas pu être appliqué");
      }
    }

    // maj local & serveur
    setUnlockedTalents((prev) => {
      const nxt = { ...prev };
      nxt[key] = [...(nxt[key] || [])];
      nxt[key][ti] = true;
      updateProg(nxt, unlockedMastery);
      return nxt;
    });
    setAvailablePoints((p) => p - 1);
  };

  const canMastery =
    talentData?.mastery?.length &&
    Object.values(unlockedTalents)
      .flat()
      .every(Boolean) &&
    !unlockedMastery &&
    availablePoints > 0;

  const handleMastery = async () => {
    if (!canMastery) return;
    const code = talentData.mastery[0];
    const { base, lvl } = strip(code);

    if (base.startsWith("COMP-") && lvl === 5) {
      const stat = base.replace(/^COMP-/, "").toLowerCase();
      try {
        await addBonus(userId, stat, lvl, "COMP");
      } catch {
        console.warn("Le bonus n'a pas pu être appliqué");
      }
    }

    alert(`🎖️ Maîtrise débloquée : ${displayName(code)}`);
    setUnlockedMastery(true);
    updateProg(unlockedTalents, true);
    setAvailablePoints((p) => p - 1);
  };

  if (!talentData) {
    return (
      <p className="text-center text-gray-400 mt-20 text-lg">
        Chargement...
      </p>
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
                const { base } = strip(skill.name);
                const meta = itemMap[base] || {};
                const branch = unlockedTalents[key] || [];
                const unlocked = !!branch[ti];
                const blocked =
                  ti > 0 && !branch[ti - 1]
                    ? true
                    : availablePoints < 1;

                return (
                  <div
                    key={skill.id}
                    className="flex flex-col items-center"
                  >
                    <Tooltip text={meta.fr_description || ""}>
                      <button
                        disabled={unlocked || blocked}
                        onClick={() =>
                          handleUnlock(ci, ti, skills)
                        }
                        className={`w-24 h-24 rounded-full flex items-center justify-center p-2 text-center text-sm font-medium transition-shadow ${
                          unlocked
                            ? "bg-green-600 shadow-lg"
                            : blocked
                            ? "bg-gray-700 cursor-not-allowed"
                            : "bg-gray-600 hover:bg-gray-500 shadow-md"
                        }`}
                      >
                        {displayName(skill.name)}
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

      <div className="mt-12 flex justify-center">
        {talentData.mastery.map((code) => {
          const { base } = strip(code);
          const meta = itemMap[base] || {};
          const available = canMastery;
          const unlocked = unlockedMastery;

          const btnClass = unlocked
            ? "bg-green-600 shadow-lg"
            : available
            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-md"
            : "bg-gray-700 cursor-not-allowed";

          return (
            <Tooltip key={code} text={meta.fr_description || ""}>
              <button
                disabled={!available}
                onClick={handleMastery}
                className={`px-8 py-4 rounded-lg text-xl font-bold text-white transition ${btnClass}`}
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
