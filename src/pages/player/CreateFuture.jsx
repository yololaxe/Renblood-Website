// src/pages/CreateFuturePage.jsx

import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { createFuture } from "../../services/api";
import { motion } from "framer-motion";
import { FaPlus, FaQuestionCircle } from "react-icons/fa";

const FUTURE_TEMPLATES = [
  {
    type: "exploration",
    label: "Exploration",
    restriction: "X",
    cost: "12B",
    detail:
      "Choisir X différents items à récupérer pendant une exploration",
    chance: "78 %",
    reward: "X items",
    question: "Quels items ?",
  },
  {
    type: "construction",
    label: "Construction",
    restriction: "Builder 3",
    cost: "Matériaux",
    detail:
      "Construction ouverte en OFF avec les matériaux disponibles (100 blocs posés max sauf amélioration)",
    chance: "100 %",
    reward: "XP Builder",
    question: null,
  },
  {
    type: "caisse_royale",
    label: "La caisse royale !",
    restriction: "X",
    cost: "5B",
    detail:
      "Jouer à destin pour changer de vie !!! (Jouer à des jeux d’hasard) 100 % gagnant",
    chance: "99 %",
    reward: "Argent / Trésor / Réputation",
    question: null,
  },
  {
    type: "rejoindre_armee",
    label: "Rejoindre l’armée",
    restriction: "X",
    cost: "X",
    detail: "Tirage au sort d’un défi PVP / PVE",
    chance: "X",
    reward: "Argent / Trésor / Réputation",
    question: null,
  },
  {
    type: "tenir_magasin",
    label: "Tenir le magasin",
    restriction: "Magasin",
    cost: "X",
    detail:
      "Reçoit les clients et réalise des ventes (dans les stocks disponibles)",
    chance: "X",
    reward: "Argent / Réputation",
    question: "Nom du magasin & ID",
  },
  {
    type: "travailler",
    label: "Travailler",
    restriction: "Lieu de travail",
    cost: "X",
    detail: "Produit des items suivant ce qui est schedule",
    chance: "X",
    reward: "X items",
    question: "Quels items ?",
  },
  {
    type: "espionner",
    label: "Espionner",
    restriction: "X",
    cost: "X",
    detail:
      "Espionne une personne ou un bâtiment (+5 discretion pendant le future)",
    chance: "X",
    reward: "Information",
    question: "Qui ? / Quel bâtiment",
  },
  {
    type: "sentrainer",
    label: "S’entraîner",
    restriction: "X",
    cost: "X",
    detail: "Entraîne un talent (max 2 par talent)",
    chance: "X",
    reward: "Talent +1",
    question: "Quel talent ? (Liste déroulante)",
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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-extrabold text-center text-white mb-4">
        📝 Ajouter un future
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {FUTURE_TEMPLATES.map((tpl) => (
          <motion.div
            key={tpl.type}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}
            className="flex flex-col bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Header dégradé */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-3">
              <h2 className="text-lg font-semibold text-white">{tpl.label}</h2>
            </div>

            {/* Contenu */}
            <div className="flex-1 p-4 space-y-2 text-gray-300 text-sm">
              <p><strong>Restriction :</strong> {tpl.restriction}</p>
              <p><strong>Coût :</strong> {tpl.cost}</p>
              <p><strong>Détail :</strong> {tpl.detail}</p>
              <p><strong>Chance :</strong> {tpl.chance}</p>
              <p><strong>Récompense :</strong> {tpl.reward}</p>

              {tpl.question && (
                <div className="mt-3">
                  <label className="block mb-1 text-gray-200 font-medium">
                    <FaQuestionCircle className="inline mr-1" />
                    {tpl.question}
                  </label>
                  <input
                    type="text"
                    value={answers[tpl.type] || ""}
                    onChange={(e) =>
                      handleChange(tpl.type, e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Votre réponse…"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-900">
              <button
                disabled={!!loadingType}
                onClick={() => handleCreate(tpl)}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition ${
                  loadingType === tpl.type
                    ? "bg-gray-600 cursor-wait"
                    : "bg-green-600 hover:bg-green-500"
                } text-white font-semibold`}
              >
                <FaPlus className="mr-2" />
                {loadingType === tpl.type ? "…" : "Ajouter"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}