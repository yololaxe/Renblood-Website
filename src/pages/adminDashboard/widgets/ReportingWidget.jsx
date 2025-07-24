// src/pages/adminDashboard/ReportingWidget.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaChartLine, FaFileAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ReportingWidget() {
  const navigate = useNavigate();

  const reports = [
    {
      id: "sales",
      title: "Évolution des ventes",
      icon: <FaChartLine />,
      path: "/reporting/sales",
    },
    {
      id: "sessions",
      title: "Évolution des sessions",
      icon: <FaFileAlt />,
      path: "/reporting/sessions",
    },
    {
      id: "money",
      title: "Évolution de la money",
      icon: <FaChartLine />,
      path: "/reporting/money",
    },
    // ajouter d'autres rapports ici si besoin
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center space-x-2">

      </div>
      <div className="flex-1 grid grid-cols-1 gap-3">
        {reports.map((r) => (
          <motion.button
            key={r.id}
            onClick={() => navigate(r.path)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            <span className="text-xl text-blue-400">{r.icon}</span>
            <span className="font-medium text-white">{r.title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
