// src/pages/adminDashboard/AdminDashboard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { motion } from "framer-motion";
import { FaUsers, FaUserPlus, FaCogs, FaChartLine, FaGlobe, FaScroll, FaGamepad, FaStore } from "react-icons/fa";
import WikiWidget from "./widgets/WikiWidget.jsx";
import "../../components/wiki/wiki.css";
import "../../components/wiki/wiki-explore.css";
import GlobalWidget from "./widgets/GlobalWidget.jsx";
import SessionManagerWidget from "./widgets/SessionManagerWidget.jsx";
import ReportingWidget from "./widgets/ReportingWidget.jsx";
import QuestsWidget from "./widgets/QuestsWidget.jsx";
import MarketWidget from "./widgets/MarketWidget.jsx";
export default function AdminDashboard() {
  const {
    userRank
  } = useUser();
  const navigate = useNavigate();

  // Guard : si pas Admin, on redirige
  useEffect(() => {
    if (userRank !== "Admin") {
      navigate("/unauthorized", {
        replace: true
      });
    }
  }, [userRank, navigate]);
  const quickActions = [{ label: "Cadastre & terrains", icon: <FaGlobe />, path: "/admin/cadastre", color: "bg-amber-800 hover:bg-amber-700" }, {
    label: "Inscriptions & identités",
    icon: <FaUserPlus />,
    path: "/admin/registration",
    color: "bg-amber-800 hover:bg-amber-700"
  }, {
    label: "Intendance économique",
    icon: <FaChartLine />,
    path: "/admin/economie",
    color: "bg-amber-800 hover:bg-amber-700"
  }, {
    label: "Gérer les Joueurs",
    icon: <FaUsers />,
    path: "/players-admin",
    color: "bg-amber-800 hover:bg-amber-700"
  }, {
    label: "Créer un Joueur",
    icon: <FaUserPlus />,
    path: "/create-player",
    color: "bg-green-600 hover:bg-green-500"
  }, {
    label: "Comptoirs marchands",
    icon: <FaStore />,
    path: "/admin/markets",
    color: "bg-amber-600 hover:bg-amber-500"
  }];
  const widgets = [{
    id: "wiki",
    title: "Atelier du wiki",
    component: <WikiWidget />,
    colSpan: "lg:col-span-2"
  }, {
    id: "globals",
    title: "🌐 État Global",
    component: <GlobalWidget />,
    colSpan: "lg:col-span-1"
  }, {
    id: "sessions",
    title: "🕹️ Gestion des Sessions",
    component: <SessionManagerWidget />,
    colSpan: "lg:col-span-2"
  }, {
    id: "quests",
    title: "📜 Éditeur de Quêtes",
    component: <QuestsWidget />,
    colSpan: "lg:col-span-1"
  }, {
    id: "reporting",
    title: "📊 Reporting Économique",
    component: <ReportingWidget />,
    colSpan: "lg:col-span-2"
  }, {
    id: "markets",
    title: "Marchés & Comptoirs",
    component: <MarketWidget />,
    colSpan: "lg:col-span-2"
  }];
  return <div className="min-h-screen bg-[#11110f] text-stone-200 pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="relative bg-[#1b1b17] border-b border-stone-700 py-5 px-6 mb-5 overflow-hidden">
        <div className="max-w-[1680px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div>
            <motion.h1 initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} className="text-4xl font-extrabold      mb-2 editorial-title">
              Administration
            </motion.h1>

          </div>

          {/* Actions Rapides */}
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action, idx) => <motion.button key={idx} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={() => navigate(action.path)} className={`flex items-center gap-2 px-5 py-3 rounded-sm text-white font-bold shadow-none transition ${action.color}`}>
                {action.icon} {action.label}
              </motion.button>)}
          </div>
        </div>
      </div>

      {/* --- WIDGETS GRID --- */}
      <div className="max-w-[1680px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {widgets.map((widget, idx) => <motion.div key={widget.id} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: idx * 0.1
      }} className={`bg-[#1b1b17] rounded-sm border border-stone-700 shadow-xl overflow-hidden flex flex-col ${widget.colSpan}`}>
            <div className="bg-[#11110f]/50 px-6 py-4 border-b border-stone-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {widget.title}
              </h2>
              <FaCogs className="text-gray-600" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              {widget.component}
            </div>
          </motion.div>)}
      </div>

    </div>;
}
