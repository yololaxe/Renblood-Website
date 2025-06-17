// src/pages/TalentTree2.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  getPlayerJobs,
  getJobDetails,
  updateTalentProgression,
  getAllNodes,
  updateJobLevel,      // ← on importe
} from "../services/api";
import Tooltip from "../components/Tooltip";

function TalentTree2() {
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

      // 1️⃣ Mise à jour du level du métier sur le serveur
      try {
        await updateJobLevel(userId, profession);
      } catch (err) {
        console.warn("⚠️ Impossible de mettre à jour le level:", err);
      }

      // 2️⃣ Chargement parallèle des données
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
      <h1 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        🏛️ Arbre des Talents – {talentData.name}
      </h1>
      <p className="text-center text-lg mb-8">
        Points disponibles :{" "}
        <span className="font-bold text-green-300">{availablePoints}</span>
      </p>

      {/* ...reste de l'UI inchangé... */}
    </div>
  );
}

export default TalentTree2;
