// src/pages/CreateFuturePage.jsx

import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { createFuture } from "../../services/api";

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
  const [loading, setLoading] = useState(false);

  const handleChange = (type, value) => {
    setAnswers((a) => ({ ...a, [type]: value }));
  };

  const handleCreate = async (template) => {
    const answer = template.question ? answers[template.type] : "";
    if (template.question && !answer) {
      return alert("Veuillez répondre à la question avant d’ajouter.");
    }
    setLoading(true);
    try {
      await createFuture({
        sessionId,
        playerId: userId,
        type: template.type,
        answer,
      });
      alert("✅ Votre future a bien été ajoutée !");
      navigate("/sessions");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de la création de la future.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Ajouter une future</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FUTURE_TEMPLATES.map((tpl) => (
          <div
            key={tpl.type}
            className="bg-gray-800 p-4 rounded-lg flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">
                {tpl.label}
              </h2>
              <p className="text-sm text-gray-300">
                <strong>Restriction :</strong> {tpl.restriction}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Coût :</strong> {tpl.cost}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Détail :</strong> {tpl.detail}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Chance :</strong> {tpl.chance}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Récompense :</strong> {tpl.reward}
              </p>
              {tpl.question && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-200 mb-1">
                    {tpl.question}
                  </label>
                  <input
                    type="text"
                    value={answers[tpl.type] || ""}
                    onChange={(e) =>
                      handleChange(tpl.type, e.target.value)
                    }
                    className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
                    placeholder="Votre réponse…"
                  />
                </div>
              )}
            </div>
            <button
              disabled={loading}
              onClick={() => handleCreate(tpl)}
              className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
            >
              {loading ? "…" : "Ajouter"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
