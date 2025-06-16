// src/pages/TalentSelection.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayerJobs, getJobDetails } from "../services/api";
import { useUser } from "../context/UserContext";

export default function TalentSelection() {
  const { userId } = useUser();
  const [jobs, setJobs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      alert("❌ Vous devez être connecté pour accéder à cette page !");
      navigate("/home");
      return;
    }
    (async () => {
      try {
        const jobsData = await getPlayerJobs(userId);
        setJobs(jobsData?.jobs?.jobs ?? {});
      } catch (err) {
        console.error("Erreur récupération métiers :", err);
      }
    })();
  }, [userId, navigate]);

  if (!userId) {
    return (
      <p className="text-center text-red-400 mt-10">
        ❌ Utilisateur non connecté !
      </p>
    );
  }
  if (!jobs || Object.keys(jobs).length === 0) {
    return (
      <p className="text-center text-gray-400 mt-10">Chargement...</p>
    );
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-white text-center">
        ⚒️ Sélectionnez un Métier
      </h1>

      {/* Grille 4 colonnes */}
      <div className="grid grid-cols-4 gap-8">
        {Object.entries(jobs).map(([key, job]) => {
          const isLocked = job.xp === -1;
          const displayName = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase());

          const handleClick = async () => {
            if (isLocked) return;
            try {
              const details = await getJobDetails(key);
              const path =
                details?.inter_choice?.length > 0
                  ? `/talent2/${key}?userId=${userId}`
                  : `/talents/${key}?userId=${userId}`;
              navigate(path);
            } catch (err) {
              console.error("Erreur détails métier :", err);
              alert("❌ Impossible de charger les détails du métier.");
            }
          };

          return (
            <div
              key={key}
              className={`relative rounded-lg overflow-hidden ${
                isLocked
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-80"
              }`}
              onClick={handleClick}
            >
              {/* Image en background, lazy-loading */}
              <img
                src={`/metiers/${key}.png`}
                alt={displayName}
                loading="lazy"
                className="w-full h-auto object-cover block"
              />

              {/* Overlay sombre */}
              <div className="absolute inset-0 bg-black/50"></div>

              {/* Texte et badge */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <h2 className="text-white text-xl font-bold drop-shadow">
                  {displayName}
                </h2>
                {!isLocked && (
                  <span className="self-start bg-white/30 text-white px-2 py-1 rounded">
                    XP : {job.xp}
                  </span>
                )}
                {isLocked && (
                  <div className="self-start bg-red-600 text-white px-2 py-1 rounded">
                    Verrouillé
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
