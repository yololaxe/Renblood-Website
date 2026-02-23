// src/pages/player/EditFuturePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getFutureById, updateFuture } from "../../services/api";
import { motion } from "framer-motion";
import { FaCheck, FaQuestionCircle, FaArrowLeft, FaLock, FaCoins, FaDice, FaGift } from "react-icons/fa";

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

export default function EditFuturePage() {
  const { id } = useParams();
  const { userId } = useUser();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Chargement de la future
  useEffect(() => {
    (async () => {
      try {
        const f = await getFutureById(id);
        if (f.player !== userId) {
          alert("Vous ne pouvez modifier que votre propre future.");
          return navigate("/sessions");
        }
        setSelectedType(f.type);
        setAnswer(f.answer || "");
      } catch {
        alert("Impossible de charger la future.");
        navigate("/sessions");
      }
    })();
  }, [id, userId, navigate]);

  const tpl = FUTURE_TEMPLATES.find((t) => t.type === selectedType);

  const handleSubmit = async () => {
    if (tpl?.question && !answer.trim()) {
      return alert("Veuillez répondre à la question avant de mettre à jour.");
    }
    setLoading(true);
    try {
      await updateFuture(id, { type: selectedType, answer });
      alert("✅ Votre future a bien été mise à jour !");
      navigate("/sessions");
    } catch {
      alert("❌ Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 pb-20">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Modifier mon Action</h1>
          <p className="text-gray-400">Changez votre activité pour la prochaine session.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {FUTURE_TEMPLATES.map((t, index) => (
          <motion.div
            key={t.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              setSelectedType(t.type);
              setAnswer("");
            }}
            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
            className={`flex flex-col rounded-xl overflow-hidden border-2 shadow-lg cursor-pointer transition-all duration-300 ${
              t.type === selectedType
                ? "border-green-500 bg-gray-800 ring-2 ring-green-500/50"
                : "border-transparent bg-gray-800 hover:border-gray-600"
            }`}
          >
            {/* Card Header */}
            <div className={`bg-gradient-to-r ${t.color} px-5 py-4 relative overflow-hidden`}>
              <h2 className="text-xl font-bold text-white relative z-10">{t.label}</h2>
              {t.type === selectedType && (
                <div className="absolute top-4 right-4 bg-white text-green-600 rounded-full p-1 shadow-lg">
                  <FaCheck size={12} />
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="flex-1 p-5 space-y-4 text-sm">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><FaLock size={10}/> Restriction</span>
                  <span className="text-gray-200 font-medium">{t.restriction}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><FaCoins size={10}/> Coût</span>
                  <span className="text-yellow-400 font-medium">{t.cost}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><FaDice size={10}/> Chance</span>
                  <span className="text-blue-400 font-medium">{t.chance}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><FaGift size={10}/> Gain</span>
                  <span className="text-green-400 font-medium truncate" title={t.reward}>{t.reward}</span>
                </div>
              </div>

              <p className="text-gray-400 italic border-l-2 border-gray-600 pl-3 py-1">
                {t.detail}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Question Input (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6 shadow-2xl z-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          
          {tpl?.question ? (
            <div className="flex-1 w-full">
              <label className="block mb-2 text-white font-semibold flex items-center gap-2">
                <FaQuestionCircle className="text-blue-400" />
                {tpl.question}
              </label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="Votre réponse..."
              />
            </div>
          ) : (
            <div className="flex-1 text-gray-400 italic">Aucune information supplémentaire requise pour cette action.</div>
          )}

          <button
            disabled={loading || !selectedType}
            onClick={handleSubmit}
            className={`px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition transform hover:scale-105 flex items-center gap-2 whitespace-nowrap ${
              loading || !selectedType
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 text-white"
            }`}
          >
            {loading ? "Mise à jour..." : <><FaCheck /> Confirmer</>}
          </button>
        </div>
      </div>
      
      {/* Spacer for sticky footer */}
      <div className="h-24" />
    </div>
  );
}
