// src/pages/adminDashboard/widgets/ReportingWidget.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaChartLine, FaFileAlt, FaCoins, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ReportingWidget() {
  const navigate = useNavigate();

  const reports = [
    {
      id: "money",
      title: "Économie Globale",
      desc: "Suivi de la masse monétaire",
      icon: <FaCoins />,
      path: "/reporting/money",
      color: "text-yellow-400 bg-yellow-900/20 border-yellow-500/30"
    },
    {
      id: "sessions",
      title: "Activité Sessions",
      desc: "Participation et tendances",
      icon: <FaUsers />,
      path: "/reporting/sessions",
      color: "text-blue-400 bg-blue-900/20 border-blue-500/30"
    },
    // {
    //   id: "sales",
    //   title: "Ventes & Commerce",
    //   desc: "Transactions entre joueurs",
    //   icon: <FaChartLine />,
    //   path: "/reporting/sales",
    //   color: "text-green-400 bg-green-900/20 border-green-500/30"
    // },
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      {reports.map((r, idx) => (
        <motion.button
          key={r.id}
          onClick={() => navigate(r.path)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center p-4 rounded-xl border transition-all text-left group ${r.color} hover:bg-opacity-40`}
        >
          <div className="text-2xl mr-4 p-3 bg-gray-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
            {r.icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{r.title}</h3>
            <p className="text-xs text-gray-400">{r.desc}</p>
          </div>
        </motion.button>
      ))}
      
      {/* Placeholder pour remplir si vide */}
      {reports.length < 3 && (
        <div className="flex-1 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-600 text-sm">
          Plus de rapports bientôt...
        </div>
      )}
    </div>
  );
}
