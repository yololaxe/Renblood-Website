import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBalanceScale, FaExchangeAlt, FaStore } from "react-icons/fa";
import { motion } from "framer-motion";
const shortcuts = [{
  label: "Boutiques PNJ",
  description: "Villes, catalogues et prix des marchands",
  icon: <FaStore />,
  path: "/admin/npc-shops"
}, {
  label: "Modération",
  description: "Contrôler les comptoirs signalés",
  icon: <FaBalanceScale />,
  path: "/admin/markets/moderation"
}, {
  label: "Transactions",
  description: "Consulter les échanges récents",
  icon: <FaExchangeAlt />,
  path: "/admin/markets/transactions"
}];
export default function MarketWidget() {
  const navigate = useNavigate();
  return <div className="flex h-full flex-col gap-4">
      <button onClick={() => navigate("/admin/markets")} className="flex items-center gap-4 rounded-sm border border-amber-500/40 bg-amber-900/20 p-4 text-left transition hover:bg-amber-900/40">
        <span className="rounded-lg bg-amber-600 p-3 text-2xl text-white">
          <FaStore />
        </span>
        <span>
          <span className="block font-bold text-white">Administration des marchés</span>
          <span className="text-sm text-stone-400">Gérer les prix, items et comptoirs marchands</span>
        </span>
      </button>

      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        {shortcuts.map((shortcut, index) => <motion.button key={shortcut.path} onClick={() => navigate(shortcut.path)} initial={{
        opacity: 0,
        y: 8
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.08
      }} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} className="rounded-sm border border-stone-600 bg-stone-800/30 p-4 text-left transition hover:border-amber-500/50 hover:bg-stone-800/60">
            <span className="mb-3 block text-xl text-amber-400">{shortcut.icon}</span>
            <span className="block font-semibold text-white">{shortcut.label}</span>
            <span className="text-xs text-stone-400">{shortcut.description}</span>
          </motion.button>)}
      </div>
    </div>;
}
