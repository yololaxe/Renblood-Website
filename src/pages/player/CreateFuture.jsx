// src/pages/CreateFuturePage.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { createFuture } from "../../services/api";
import { motion } from "framer-motion";
import { FaPlus, FaQuestionCircle, FaArrowLeft, FaCoins, FaDice, FaGift, FaLock } from "react-icons/fa";

const FUTURE_TEMPLATES = [
  {
    type: "exploration",
    label: "Exploration",
    restriction: "Aucune",
    cost: "12B",
    detail: "Choisir X différents items à récupérer pendant une exploration",
    chance: "78 %",
    reward: "X items",
    question: "Quels items ?",
    color: "from-green-500 to-emerald-600"
  },
  {
    type: "construction",
    label: "Construction",
    restriction: "Builder 3",
    cost: "Matériaux",
    detail: "Construction ouverte en OFF avec les matériaux disponibles (100 blocs max)",
    chance: "100 %",
    reward: "XP Builder",
    question: null,
    color: "from-orange-500 to-amber-600"
  },
  {
    type: "caisse_royale",
    label: "La caisse royale !",
    restriction: "Aucune",
    cost: "5B",
    detail: "Jouer à destin pour changer de vie !!! (Jeux de hasard)",
    chance: "99 %",
    reward: "Argent / Trésor / Réputation",
    question: null,
    color: "from-yellow-500 to-amber-500"
  },
  {
    type: "rejoindre_armee",
    label: "Rejoindre l’armée",
    restriction: "Aucune",
    cost: "Aucun",
    detail: "Tirage au sort d’un défi PVP / PVE",
    chance: "Variable",
    reward: "Argent / Trésor / Réputation",
    question: null,
    color: "from-red-600 to-rose-700"
  },
  {
    type: "tenir_magasin",
    label: "Tenir le magasin",
    restriction: "Magasin",
    cost: "Aucun",
    detail: "Reçoit les clients et réalise des ventes (stocks disponibles)",
    chance: "Variable",
    reward: "Argent / Réputation",
    question: "Nom du magasin & ID",
    color: "from-blue-500 to-indigo-600"
  },
  {
    type: "travailler",
    label: "Travailler",
    restriction: "Lieu de travail",
    cost: "Aucun",
    detail: "Produit des items suivant ce qui est prévu",
    chance: "Variable",
    reward: "Items produits",
    question: "Quels items ?",
    color: "from-cyan-500 to-teal-600"
  },
  {
    type: "espionner",
    label: "Espionner",
    restriction: "Aucune",
    cost: "Aucun",
    detail: "Espionne une personne ou un bâtiment (+5 discrétion)",
    chance: "Variable",
    reward: "Information",
    question: "Qui ? / Quel bâtiment ?",
    color: "from-gray-600 to-slate-700"
  },
  {
    type: "sentrainer",
    label: "S’entraîner",
    restriction: "Aucune",
    cost: "Aucun",
    detail: "Entraîne un talent (max 2 par talent)",
    chance: "Variable",
    reward: "Talent +1",
    question: "Quel talent ?",
    color: "from-purple-500 to-fuchsia-600"
  },
];

export default function CreateFuturePage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const { userId } = useUser();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({});
  const [loadingType, setLoadingType] = useState(null);

  const handleChange = (type, value) => {
    setAnswers((a) => ({ ...a, [type]: value }));
  };

  const handleCreate = async (template) => {
    if (template.question && !answers[template.type]) {
      return alert("Veuillez répondre à la question avant d’ajouter.");
    }
    setLoadingType(template.type);
    try {
      await createFuture({
        sessionId,
        playerId: userId,
        type: template.type,
        answer: answers[template.type] || "",
      });
      alert("✅ Future ajoutée !");
      navigate("/sessions");
    } catch (err) {
      console.error(err);
      alert("❌ Échec de la création.");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 pb-20">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Planifier une Action</h1>
          <p className="text-gray-400">Choisissez une activité pour la prochaine session.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {FUTURE_TEMPLATES.map((tpl, index) => (
          <motion.div
            key={tpl.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
            className="flex flex-col bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg group"
          >
            {/* Card Header */}
            <div className={`bg-gradient-to-r ${tpl.color} px-5 py-4 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2">
                {/* Icone décorative (optionnel) */}
              </div>
              <h2 className="text-xl font-bold text-white relative z-10">{tpl.label}</h2>
            </div>

            {/* Card Body */}
            <div className="flex-1 p-5 space-y-4 text-sm">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><FaLock size={10}/> Restriction</span>
                  <span className="text-gray-200 font-medium">{tpl.restriction}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><FaCoins size={10}/> Coût</span>
                  <span className="text-yellow-400 font-medium">{tpl.cost}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><FaDice size={10}/> Chance</span>
                  <span className="text-blue-400 font-medium">{tpl.chance}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><FaGift size={10}/> Gain</span>
                  <span className="text-green-400 font-medium truncate" title={tpl.reward}>{tpl.reward}</span>
                </div>
              </div>

              <p className="text-gray-400 italic border-l-2 border-gray-600 pl-3 py-1">
                {tpl.detail}
              </p>

              {/* Question Input */}
              {tpl.question && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <label className="block mb-2 text-white font-semibold flex items-center gap-2">
                    <FaQuestionCircle className="text-blue-400" />
                    {tpl.question}
                  </label>
                  <input
                    type="text"
                    value={answers[tpl.type] || ""}
                    onChange={(e) => handleChange(tpl.type, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    placeholder="Votre réponse..."
                  />
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="p-4 bg-gray-900 border-t border-gray-700">
              <button
                disabled={!!loadingType}
                onClick={() => handleCreate(tpl)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition shadow-lg ${
                  loadingType === tpl.type
                    ? "bg-gray-700 text-gray-400 cursor-wait"
                    : "bg-white text-gray-900 hover:bg-gray-200"
                }`}
              >
                {loadingType === tpl.type ? (
                  <span className="animate-pulse">Traitement...</span>
                ) : (
                  <>
                    <FaPlus /> Choisir cette action
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
