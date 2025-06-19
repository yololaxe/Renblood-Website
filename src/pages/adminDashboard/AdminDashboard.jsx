// src/pages/adminDashboard/AdminDashboard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import GlobalWidget from "./GlobalWidget";
import SessionManagerWidget from "./SessionManagerWidget";

export default function AdminDashboard() {
  const { userRank } = useUser();
  const navigate = useNavigate();

  // Guard : si pas Admin, on redirige
  useEffect(() => {
    if (userRank !== "Admin") {
      navigate("/unauthorized", { replace: true });
    }
  }, [userRank, navigate]);

  const blocks = [
    // { id: "users",     title: "👥 Utilisateurs"   },
    // { id: "jobs",      title: "⚒️ Métiers"        },
    // { id: "stats",     title: "📊 Statistiques"   },
    { id: "sessions",  title: "🕹️ Sessions"      },  // ← Nouveau bloc
    { id: "globals",   title: "🌐 Globals"        },
    { id: "logs",      title: "📜 Logs"           },
    { id: "settings",  title: "⚙️ Paramètres"      },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1
        className="text-4xl font-extrabold text-center mb-8
                   bg-clip-text text-transparent
                   bg-gradient-to-r from-green-300 to-blue-400"
      >
        🛠️ Tableau de bord Admin
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="bg-gray-800 rounded-xl shadow-lg p-6
                       flex flex-col hover:bg-gray-700 transition"
          >
            <h2 className="text-xl font-semibold mb-4">{block.title}</h2>
            <div className="flex-1">
              {block.id === "globals" ? (
                <GlobalWidget />
              ) : block.id === "sessions" ? (
                <SessionManagerWidget />
              ) : (
                <div
                  className="h-full border-2 border-dashed border-gray-700
                             rounded-md flex items-center justify-center
                             text-gray-500"
                >
                  Zone de widget
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
