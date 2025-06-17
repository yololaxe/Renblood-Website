// src/pages/TalentTree2.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  getPlayerJobs,
  getJobDetails,
  updateTalentProgression,
  getAllNodes,
  updateJobLevel,
} from "../services/api";
import Tooltip from "../components/Tooltip";

export default function TalentTree2() {
  const { profession } = useParams();
  const userId = new URLSearchParams(useLocation().search).get("userId");

  const [talentData, setTalentData] = useState(null);
  const [itemMap, setItemMap] = useState({});
  const [unlockedTalents, setUnlockedTalents] = useState({});
  const [availablePoints, setAvailablePoints] = useState(0);
  const [unlockedInterChoices, setUnlockedInterChoices] = useState([false, false]);
  const [unlockedMastery, setUnlockedMastery] = useState(false);

  useEffect(() => {
    async function init() {
      if (!userId) {
        console.error("❌ Aucune userId fournie !");
        return;
      }
      try {
        await updateJobLevel(userId, profession);
      } catch (err) {
        console.warn("⚠️ Impossible de mettre à jour le level:", err);
      }

      const [jobs, talents, nodes] = await Promise.all([
        getPlayerJobs(userId),
        getJobDetails(profession),
        getAllNodes(),
      ]);

      const playerJob = jobs?.jobs?.jobs?.[profession];
      if (!playerJob || playerJob.xp === -1) {
        alert("⚠️ Ce métier est verrouillé !");
        return;
      }

      const nodeMap = nodes.reduce((acc, node) => {
        acc[node.id] = node;
        return acc;
      }, {});
      setItemMap(nodeMap);
      setTalentData(talents);

      const prog = playerJob.progression;
      setAvailablePoints(
        Math.max(0, playerJob.level - prog.filter(Boolean).length)
      );
      setUnlockedTalents({
        choice_1: prog.slice(0, 3),
        choice_2: prog.slice(3, 6),
        choice_3: prog.slice(6, 9),
        choice_4: prog.slice(9, 12),
      });
      setUnlockedInterChoices([prog[12] || false, prog[13] || false]);
      setUnlockedMastery(prog[14] || false);
    }
    init();
  }, [userId, profession]);

  const strip = (code) => {
    const m = code.match(/^(.+)_([0-9]+)$/);
    return m ? { base: m[1], lvl: m[2] } : { base: code, lvl: null };
  };

  const displayName = (code) => {
    const { base, lvl } = strip(code);
    const name = itemMap[base]?.fr_name || base;
    return lvl ? `${name}${lvl}` : name;
  };

  const updateProg = (tal, inter, mastery) => {
    const prog = [
      ...tal.choice_1,
      ...tal.choice_2,
      ...tal.choice_3,
      ...tal.choice_4,
      inter[0] || false,
      inter[1] || false,
      mastery || false,
    ];
    updateTalentProgression(userId, profession, prog);
  };

  const handleUnlock = (ci, ti) => {
    const key = `choice_${ci + 1}`;
    if (unlockedTalents[key][ti] || availablePoints < 1) return;
    if (ti > 0 && !unlockedTalents[key][ti - 1]) {
      alert("⚠️ Débloquez d'abord le précédent !");
      return;
    }
    if (!window.confirm("💡 Confirmez le déblocage ?")) return;

    setUnlockedTalents((prev) => {
      const nxt = { ...prev };
      nxt[key][ti] = true;
      updateProg(nxt, unlockedInterChoices, unlockedMastery);
      return nxt;
    });
    setAvailablePoints((p) => p - 1);
  };

  const canInter = (idx) => {
    if (!talentData?.inter_choice) return false;
    if (unlockedInterChoices[idx]) return false;
    if (idx === 0) {
      return (
        unlockedTalents.choice_1.every(Boolean) &&
        unlockedTalents.choice_2.every(Boolean)
      );
    }
    return (
      unlockedTalents.choice_3.every(Boolean) &&
      unlockedTalents.choice_4.every(Boolean)
    );
  };

  const handleInter = (idx) => {
    if (!canInter(idx) || availablePoints < 1) return;
    const code = talentData.inter_choice[idx];
    alert(`🎉 Débloqué : ${displayName(code)}`);
    setUnlockedInterChoices((prev) => {
      const nxt = [...prev];
      nxt[idx] = true;
      updateProg(unlockedTalents, nxt, unlockedMastery);
      return nxt;
    });
    setAvailablePoints((p) => p - 1);
  };

  const canMastery =
    talentData?.mastery?.length &&
    Object.values(unlockedTalents).flat().every(Boolean) &&
    unlockedInterChoices.every(Boolean) &&
    !unlockedMastery &&
    availablePoints > 0;

  const handleMastery = () => {
    if (!canMastery) return;
    const code = talentData.mastery[0];
    alert(`🎖️ Maîtrise débloquée : ${displayName(code)}`);
    setUnlockedMastery(true);
    updateProg(unlockedTalents, unlockedInterChoices, true);
    setAvailablePoints((p) => p - 1);
  };

  if (!talentData || Object.keys(itemMap).length === 0) {
    return <p className="text-center text-gray-400 mt-20">Chargement...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 text-white">
      <h1 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent from-purple-400 to-pink-500 bg-gradient-to-r">
        🏛️ Arbre des Talents – {talentData.name}
      </h1>
      <p className="text-center text-lg mb-8">
        Points disponibles :{' '}
        <span className="font-bold text-green-300">{availablePoints}</span>
      </p>

      {/* 4 colonnes de choix */}
      <div className="grid grid-cols-4 gap-12">
        {['choice_1','choice_2','choice_3','choice_4'].map((key, ci) => (
          <div key={key} className="space-y-6">
            {talentData.skills[key].map((skill, ti) => {
              const code = skill.name;
              const { base } = strip(code);
              const meta = itemMap[base] || {};
              const unlocked = unlockedTalents[key][ti];
              const blocked =
                (ti > 0 && !unlockedTalents[key][ti - 1]) ||
                availablePoints < 1;

              return (
                <div key={skill.id} className="flex flex-col items-center">
                  <Tooltip text={meta.fr_description || ""}>
                    <button
                      onClick={() => handleUnlock(ci, ti)}
                      disabled={unlocked || blocked}
                      className={`w-24 h-24 rounded-full flex items-center justify-center p-2 text-sm font-medium transition-shadow ${
                        unlocked
                          ? "bg-green-600 shadow-lg"
                          : blocked
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-gray-600 hover:bg-gray-500 shadow-md"
                      }`}>
                      {displayName(code)}
                    </button>
                  </Tooltip>
                  {ti < talentData.skills[key].length - 1 && (
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
        ))}
      </div>

      {/* inter choices */}
      <div className="mt-12 flex justify-center space-x-8">
        {talentData.inter_choice.map((code, idx) => {
          const { base } = strip(code);
          const meta = itemMap[base] || {};
          const available = canInter(idx);
          const unlocked = unlockedInterChoices[idx];

          return (
            <Tooltip key={code} text={meta.fr_description || ""}>
              <button
                onClick={() => handleInter(idx)}
                disabled={!available}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  unlocked
                    ? "bg-indigo-600 shadow-lg"
                    : available
                    ? "bg-purple-600 hover:bg-purple-700 shadow-md"
                    : "bg-gray-700 cursor-not-allowed"
                }`}>
                {displayName(code)}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* mastery */}
      <div className="mt-12 flex justify-center">
        {talentData.mastery.map((code) => {
          const { base } = strip(code);
          const meta = itemMap[base] || {};
          const available = canMastery;
          const unlocked = unlockedMastery;

          return (
            <Tooltip key={code} text={meta.fr_description || ""}>
              <button
                onClick={handleMastery}
                disabled={!available}
                className={`px-8 py-4 rounded-lg text-xl font-bold text-white transition ${
                  unlocked
                    ? "bg-green-600 shadow-lg"
                    : available
                    ? "bg-yellow-400 hover:bg-yellow-300 shadow-md"
                    : "bg-gray-700 cursor-not-allowed"
                }`}>
                {displayName(code)}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
