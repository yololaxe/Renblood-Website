// src/pages/player/EditFuturePage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getFutureById, updateFuture } from "../../services/api";
import { motion } from "framer-motion";
import { FaCheck, FaQuestionCircle } from "react-icons/fa";

const FUTURE_TEMPLATES = [
  {
    type: "exploration",
    label: "Exploration",
    restriction: "X",
    cost: "12B",
    detail: "Choisir X différents items à récupérer pendant une exploration",
    chance: "78 %",
    reward: "X items",
    question: "Quels items ?"
  },
  {
    type: "construction",
    label: "Construction",
    restriction: "Builder 3",
    cost: "Matériaux",
    detail: "Construction ouverte en OFF avec les matériaux disponibles…",
    chance: "100 %",
    reward: "XP Builder",
    question: null
  },
  {
    type: "caisse_royale",
    label: "La caisse royale !",
    restriction: "X",
    cost: "5B",
    detail: "Jouer à Destin pour changer de vie",
    chance: "99 %",
    reward: "Argent / Trésor / Réputation",
    question: null
  },
  {
    type: "rejoindre_armee",
    label: "Rejoindre l’armée",
    restriction: "X",
    cost: "X",
    detail: "Tirage au sort d’un défi PvP / PvE",
    chance: "X",
    reward: "Argent / Trésor / Réputation",
    question: null
  },
  {
    type: "tenir_magasin",
    label: "Tenir le magasin",
    restriction: "Magasin",
    cost: "X",
    detail: "Reçoit les clients et réalise des ventes",
    chance: "X",
    reward: "Argent / Réputation",
    question: "Nom du magasin & ID"
  },
  {
    type: "travailler",
    label: "Travailler",
    restriction: "Lieu de travail",
    cost: "X",
    detail: "Produit des items suivant le planning",
    chance: "X",
    reward: "X items",
    question: "Quels items ?"
  },
  {
    type: "espionner",
    label: "Espionner",
    restriction: "X",
    cost: "X",
    detail: "Espionne une personne ou un bâtiment (+5 discrétion)",
    chance: "X",
    reward: "Information",
    question: "Qui ? / Quel bâtiment ?"
  },
  {
    type: "sentrainer",
    label: "S’entraîner",
    restriction: "X",
    cost: "X",
    detail: "Entraîne un talent (max 2 par talent)",
    chance: "X",
    reward: "Talent +1",
    question: "Quel talent ?"
  }
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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-extrabold text-center text-white">
        ✏️ Modifier ma future
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {FUTURE_TEMPLATES.map((t) => (
          <motion.div
            key={t.type}
            onClick={() => {
              setSelectedType(t.type);
              setAnswer("");
            }}
            whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}
            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition
              ${
                t.type === selectedType
                  ? "border-green-400 bg-gray-700"
                  : "border-transparent bg-gray-800 hover:bg-gray-700"
              }`}
          >
            {/* En-tête dégradé */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3">
              <h2 className="text-lg font-semibold text-white">{t.label}</h2>
            </div>

            {/* Détails */}
            <div className="p-4 space-y-1 text-gray-300 text-sm">
              <p><strong>Restriction :</strong> {t.restriction}</p>
              <p><strong>Coût :</strong> {t.cost}</p>
              <p><strong>Détail :</strong> {t.detail}</p>
              <p><strong>Chance :</strong> {t.chance}</p>
              <p><strong>Récompense :</strong> {t.reward}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Question */}
      {tpl?.question && (
        <div className="mt-4">
          <label className="flex items-center text-gray-200 mb-1 font-medium">
            <FaQuestionCircle className="mr-2 text-yellow-400" />
            {tpl.question}
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Votre réponse…"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      )}

      {/* Bouton de validation */}
      <div className="text-center">
        <button
          disabled={loading || !selectedType}
          onClick={handleSubmit}
          className={`inline-flex items-center px-6 py-2 rounded-lg font-semibold transition ${
            loading || !selectedType
              ? "bg-gray-600 cursor-not-allowed text-gray-300"
              : "bg-yellow-500 hover:bg-yellow-400 text-gray-900"
          }`}
        >
          {loading ? "… En cours" : <><FaCheck className="mr-2" />Mettre à jour</>}
        </button>
      </div>
    </div>
  );
}