// src/pages/TalentSelection.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayerJobs, getJobDetails } from "../services/api";
import { useUser } from "../context/UserContext";

function SkeletonGrid() {
  return (
    <div className="p-10 bg-gray-900 min-h-screen">
      <h1 className="h-8 bg-gray-700 rounded w-1/3 mx-auto animate-pulse mb-8" />
      <div className="grid grid-cols-4 gap-8">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
      </div>
    </div>
  );
}

export default function TalentSelection() {
  const { userId } = useUser();
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      alert("❌ Vous devez être connecté pour accéder à cette page !");
      navigate("/home");
      return;
    }

    // Tenter de récupérer du cache sessionStorage
    const cacheKey = `mcJobs_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setJobs(JSON.parse(cached));
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await getPlayerJobs(userId);
        const jobsObj = data?.jobs?.jobs ?? {};
        sessionStorage.setItem(cacheKey, JSON.stringify(jobsObj));
        setJobs(jobsObj);
      } catch (err) {
        console.error("Erreur récupération métiers :", err);
        setError("Impossible de charger vos métiers.");
      } finally {
        setLoading(false);
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

  if (loading) {
    return <SkeletonGrid />;
  }

  if (error) {
    return (
      <p className="text-center text-red-400 mt-10">
        {error}
      </p>
    );
  }

  const entries = Object.entries(jobs);
  if (entries.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-10">
        Aucun métier trouvé.
      </p>
    );
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-white text-center">
        ⚒️ Sélectionnez un Métier
      </h1>

      <div className="grid grid-cols-4 gap-8">
        {entries.map(([key, job]) => {
          const isLocked = job.xp === -1;
          const displayName = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

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
              className={`relative rounded-lg overflow-hidden transition-opacity duration-200 ${
                isLocked
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-80"
              }`}
              onClick={handleClick}
            >
              <img
                src={`/metiers/${key}.png`}
                alt={displayName}
                loading="lazy"
                className="w-full h-48 object-cover block"
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <h2 className="text-white text-xl font-bold drop-shadow">
                  {displayName}
                </h2>
                {!isLocked ? (
                  <span className="self-start bg-white/30 text-white px-2 py-1 rounded">
                    XP : {job.xp}
                  </span>
                ) : (
                  <span className="self-start bg-red-600 text-white px-2 py-1 rounded">
                    Verrouillé
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
