import React from "react";
import { useNavigate } from "react-router-dom";
import { FaScroll } from "react-icons/fa";

export default function QuestsWidget() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <FaScroll className="text-5xl text-yellow-500" />
      <p className="text-gray-400 text-center text-sm">
        Gérez l'arbre des quêtes, créez de nouvelles aventures et suivez la progression des joueurs.
      </p>
      <button
        onClick={() => navigate("/admin/quests")}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold shadow-md transition"
      >
        Ouvrir l'éditeur
      </button>
    </div>
  );
}
