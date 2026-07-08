// src/pages/adminDashboard/AdminDashboard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { motion } from "framer-motion";
import { FaUsers, FaUserPlus, FaCogs, FaChartLine, FaGlobe, FaScroll, FaGamepad, FaStore } from "react-icons/fa";

import GlobalWidget from "./widgets/GlobalWidget.jsx";
import SessionManagerWidget from "./widgets/SessionManagerWidget.jsx";
import ReportingWidget from "./widgets/ReportingWidget.jsx";
import QuestsWidget from "./widgets/QuestsWidget.jsx";
import MarketWidget from "./widgets/MarketWidget.jsx";

export default function AdminDashboard() {
  const { userRank } = useUser();
  const navigate = useNavigate();

  // Guard : si pas Admin, on redirige
  useEffect(() => {
    if (userRank !== "Admin") {
      navigate("/unauthorized", { replace: true });
    }
  }, [userRank, navigate]);

  const quickActions = [
    { label: "Gérer les Joueurs", icon: <FaUsers />, path: "/players-admin", color: "bg-blue-600 hover:bg-blue-500" },
    { label: "Créer un Joueur", icon: <FaUserPlus />, path: "/create-player", color: "bg-green-600 hover:bg-green-500" },
    { label: "Comptoirs marchands", icon: <FaStore />, path: "/admin/markets", color: "bg-amber-600 hover:bg-amber-500" },
  ];

  const widgets = [
    { id: "globals", title: "🌐 État Global", component: <GlobalWidget />, colSpan: "lg:col-span-1" },
    { id: "sessions", title: "🕹️ Gestion des Sessions", component: <SessionManagerWidget />, colSpan: "lg:col-span-2" },
    { id: "quests", title: "📜 Éditeur de Quêtes", component: <QuestsWidget />, colSpan: "lg:col-span-1" },
    { id: "reporting", title: "📊 Reporting Économique", component: <ReportingWidget />, colSpan: "lg:col-span-2" },
    { id: "markets", title: "Marchés & Comptoirs", component: <MarketWidget />, colSpan: "lg:col-span-2" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="relative bg-gray-800 border-b border-gray-700 py-12 px-6 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2"
            >
              Panneau d'Administration
            </motion.h1>
            <p className="text-gray-400">Bienvenue, Administrateur. Gérez le royaume de Renblood.</p>
          </div>

          {/* Actions Rapides */}
          <div className="flex gap-4">
            {quickActions.map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold shadow-lg transition ${action.color}`}
              >
                {action.icon} {action.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* --- WIDGETS GRID --- */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {widgets.map((widget, idx) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col ${widget.colSpan}`}
          >
            <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {widget.title}
              </h2>
              <FaCogs className="text-gray-600" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              {widget.component}
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
