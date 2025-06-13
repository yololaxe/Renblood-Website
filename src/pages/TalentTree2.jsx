import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  getPlayerJobs,
  getJobDetails,
  updateTalentProgression,
} from "../services/api";
import items from "../data/node";
import Tooltip from "../components/Tooltip";

function TalentTree2() {
  const { profession } = useParams();
  const userId = new URLSearchParams(useLocation().search).get("userId");

  const [talentData, setTalentData] = useState(null);
  const [unlockedTalents, setUnlockedTalents] = useState({});
  const [availablePoints, setAvailablePoints] = useState(0);
  const [unlockedInterChoices, setUnlockedInterChoices] = useState([false, false]);
  const [unlockedMastery, setUnlockedMastery] = useState(false);

  // Map id → metadata
  const itemMap = useMemo(() =>
    items.reduce((m, it) => {
      m[it.id] = it;
      return m;
    }, {}), []
  );

  useEffect(() => {
    async function init() {
      if (!userId) {
        console.error("❌ Aucune userId fournie !");
        return;
      }
      const jobs = await getPlayerJobs(userId);
      const playerJob = jobs?.jobs?.jobs?.[profession];
      if (!playerJob || playerJob.xp === -1) {
        alert("⚠️ Ce métier est verrouillé !");
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
        choice_4: prog.slice(9, 12) || [],
      });
      setUnlockedInterChoices([prog[12] || false, prog[13] || false]);
      setUnlockedMastery(prog[14] || false);
    }
    init();
  }, [userId, profession]);

  // Retire suffixe "_N"
  const strip = (code) => {
    const m = code.match(/^(.+)_([0-9]+)$/);
    return m ? { base: m[1], lvl: m[2] } : { base: code, lvl: null };
  };

  // Crée le texte affiché
  const displayName = (code) => {
    const { base, lvl } = strip(code);
    const name = itemMap[base]?.fr_name || base;
    return lvl ? `${name}${lvl}` : name;
  };

  // Envoie la progression complète
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

    setUnlockedTalents(prev => {
      const nxt = { ...prev };
      nxt[key][ti] = true;
      updateProg(nxt, unlockedInterChoices, unlockedMastery);
      return nxt;
    });
    setAvailablePoints(p => p - 1);
  };

  const canInter = idx => {
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

  const handleInter = idx => {
    if (!canInter(idx) || availablePoints < 1) return;
    const code = talentData.inter_choice[idx];
    alert(`🎉 Débloqué : ${displayName(code)}`);
    setUnlockedInterChoices(prev => {
      const nxt = [...prev];
      nxt[idx] = true;
      updateProg(unlockedTalents, nxt, unlockedMastery);
      return nxt;
    });
    setAvailablePoints(p => p - 1);
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
    setAvailablePoints(p => p - 1);
  };

  if (!talentData) {
    return <p className="text-center text-gray-400 mt-20">Chargement...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 text-white">
      <h1 className="text-4xl font-extrabold mb-6 text-center 
                     bg-clip-text text-transparent bg-gradient-to-r 
                     from-purple-400 to-pink-500">
        🏛️ Arbre des Talents – {talentData.name}
      </h1>
      <p className="text-center text-lg mb-8">
        Points disponibles:{" "}
        <span className="font-bold text-green-300">{availablePoints}</span>
      </p>

      <div className="grid grid-cols-4 gap-8">
        {Object.entries(talentData.skills).map(([choice, skills], ci) => {
          const key = `choice_${ci + 1}`;
          return (
            <div key={choice} className="space-y-6">
              {skills.map((skill, ti) => {
                const code = skill.name;
                const meta = itemMap[strip(code).base] || {};
                const tooltip = meta.fr_description || "";
                const unlocked = unlockedTalents[key][ti];
                const blocked = availablePoints < 1;

                return (
                  <div key={skill.id} className="flex flex-col items-center">
                    <Tooltip text={tooltip}>
                      <button
                        onClick={() => handleUnlock(ci, ti)}
                        disabled={unlocked || blocked}
                        className={`w-24 h-24 rounded-full flex items-center 
                           justify-center p-2 text-center font-medium transition-shadow ${
                             unlocked
                               ? "bg-green-600 shadow-lg"
                               : "bg-gray-700 hover:bg-gray-600 shadow-md"
                           } ${blocked && !unlocked ? "opacity-75 cursor-not-allowed" : ""}`}
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

      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-center">✨ Choix intermédiaires</h2>
        <div className="grid grid-cols-2 gap-6">
          {talentData.inter_choice.map((code, idx) => {
            const meta = itemMap[strip(code).base] || {};
            const tooltip = meta.fr_description || "";
            const unlocked = unlockedInterChoices[idx];
            const available = canInter(idx);

            let btnClass = "bg-gray-700 cursor-not-allowed";
            if (unlocked) btnClass = "bg-green-500 shadow-md text-white";
            else if (available) btnClass = "bg-yellow-500 hover:bg-yellow-400 shadow-md";

            return (
              <Tooltip key={idx} text={tooltip}>
                <button
                  onClick={() => handleInter(idx)}
                  disabled={!available}
                  className={`w-full py-3 rounded-lg text-lg font-semibold transition ${btnClass}`}
                >
                  {displayName(code)}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Talent de Maîtrise final: rectangle "rare" */}
      <div className="mt-12 flex justify-center">
        {talentData.mastery.map((code) => {
          const meta = itemMap[strip(code).base] || {};
          const tooltip = meta.fr_description || "";
          const available = canMastery;
          const unlocked = unlockedMastery;

          // rectangle doré plutôt que rond
          const btnClass = unlocked
            ? "bg-yellow-600 border-4 border-yellow-300 shadow-xl"
            : available
            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 border-2 border-yellow-200 shadow-lg"
            : "bg-gray-700 cursor-not-allowed";

          return (
            <Tooltip key={code} text={tooltip}>
              <button
                onClick={handleMastery}
                disabled={!available}
                className={`
                  px-8 py-4 rounded-lg text-xl font-extrabold text-white 
                  transition ${btnClass}
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

export default TalentTree2;
