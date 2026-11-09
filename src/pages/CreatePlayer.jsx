// src/pages/CreatePlayer.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPlayer } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaIdCard, FaGamepad, FaMoneyBillWave, FaMagic, FaCheck, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const STEPS = [
  { id: 1, label: "Identité", icon: <FaUser /> },
  { id: 2, label: "Jeu & Rang", icon: <FaGamepad /> },
  { id: 3, label: "Ressources", icon: <FaMoneyBillWave /> },
];

export default function CreatePlayer() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [playerData, setPlayerData] = useState({
    id: "",
    id_minecraft: "",
    pseudo_minecraft: "",
    name: "",
    surname: "",
    description: "",
    rank: "Paysan",
    money: 0,
    divin: "aucun",
    // Les métiers sont initialisés par défaut dans l'API si omis, 
    // mais on peut les garder si on veut les pré-configurer ici.
    // Pour simplifier, on laisse l'API gérer la structure complexe par défaut.
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlayerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await createPlayer(playerData);
    setLoading(false);

    if (response) {
      alert("✅ Joueur créé avec succès !");
      navigate("/players");
    } else {
      alert("❌ Erreur lors de la création.");
    }
  };

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, STEPS.length));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));

  return (
    <div className="min-h-screen bg-[#11110f] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1b1b17] rounded-sm shadow-none border border-stone-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#11110f] p-6 border-b border-stone-700 text-center">
          <h1 className="text-2xl font-bold text-white editorial-title">Création de Personnage</h1>
          <p className="text-stone-400 text-sm mt-1">Ajoutez un nouveau citoyen au registre.</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between px-8 py-6 bg-[#1b1b17]/50">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  step.id <= currentStep
                    ? "bg-amber-800 text-white shadow-none shadow-blue-500/30"
                    : "bg-stone-800 text-stone-500"
                }`}
              >
                {step.id < currentStep ? <FaCheck /> : step.icon}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors ${
                  step.id <= currentStep ? "text-amber-300" : "text-stone-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
          {/* Progress Bar Background */}
          <div className="absolute top-[4.5rem] left-0 w-full h-0.5 bg-stone-800 -z-0 hidden md:block" />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          <AnimatePresence mode="wait">
            
            {/* ÉTAPE 1 : IDENTITÉ */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Prénom</label>
                    <input
                      type="text"
                      name="name"
                      value={playerData.name}
                      onChange={handleChange}
                      className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white focus:border-amber-600 focus:ring-1 focus:ring-amber-500 outline-none transition"
                      placeholder="Ex: Arthur"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Nom</label>
                    <input
                      type="text"
                      name="surname"
                      value={playerData.surname}
                      onChange={handleChange}
                      className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white focus:border-amber-600 focus:ring-1 focus:ring-amber-500 outline-none transition"
                      placeholder="Ex: Pendragon"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={playerData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white focus:border-amber-600 outline-none transition"
                    placeholder="Une brève histoire du personnage..."
                  />
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 2 : JEU & RANG */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-stone-400 mb-1">ID Firebase (UID)</label>
                  <input
                    type="text"
                    name="id"
                    value={playerData.id}
                    onChange={handleChange}
                    className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white font-mono text-sm focus:border-amber-600 outline-none"
                    placeholder="UID unique"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">Pseudo Minecraft</label>
                    <input
                      type="text"
                      name="pseudo_minecraft"
                      value={playerData.pseudo_minecraft}
                      onChange={handleChange}
                      className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white focus:border-amber-600 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-400 mb-1">ID Minecraft (UUID)</label>
                    <input
                      type="text"
                      name="id_minecraft"
                      value={playerData.id_minecraft}
                      onChange={handleChange}
                      className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white font-mono text-sm focus:border-amber-600 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-400 mb-1">Rang</label>
                  <select
                    name="rank"
                    value={playerData.rank}
                    onChange={handleChange}
                    className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white focus:border-amber-600 outline-none"
                  >
                    {["Esclave", "Etranger", "Villageois", "Citoyen", "Citoyen Libre", "Patricien", "Noble", "Seigneur", "Vicompte", "Compte", "Marquis", "Moderateur", "Admin"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 3 : RESSOURCES */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-stone-400 mb-1">Argent de départ</label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                    <input
                      type="number"
                      name="money"
                      value={playerData.money}
                      onChange={handleChange}
                      className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 pl-10 text-white focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-400 mb-1">Divinité</label>
                  <div className="relative">
                    <FaMagic className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                    <select
                      name="divin"
                      value={playerData.divin}
                      onChange={handleChange}
                      className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 pl-10 text-white focus:border-purple-500 outline-none"
                    >
                      <option value="aucun">Aucune</option>
                      {["Ardorium", "Sylvaria", "Inquisora", "Solanaré", "Aurelios", "Explorien", "Ignotembris", "Ombrelume", "Scénarche", "Glacilune", "Nevrosante", "Érudihiver"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-between pt-6 border-t border-stone-700">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-2 bg-stone-800 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
              >
                <FaArrowLeft /> Précédent
              </button>
            ) : (
              <div /> // Spacer
            )}

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-semibold transition shadow-none shadow-blue-500/30"
              >
                Suivant <FaArrowRight />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition shadow-none shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Création..." : "Confirmer la création"} <FaCheck />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
