// src/pages/TalentSelection.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayerJobs, getJobDetails } from "../../services/api.js";
import { useUser } from "../../context/UserContext.jsx";
import ToolTip from "../../components/Tooltip";

// Définitions françaises des métiers
import { categories, specials } from "../../data/metiers";

function SkeletonGrid() {
  return (
    <div className="p-10 bg-gray-900 min-h-screen">
      <h1 className="h-8 bg-gray-700 rounded w-1/3 mx-auto animate-pulse mb-8" />
      <div className="grid grid-cols-4 gap-8">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="h-48 bg-gray-700 rounded-lg animate-pulse" />
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

  const cacheKey = `mcJobs_${userId}`;

  // MÉTIERS dont le niveau max = 15
  const EXCEPTIONS = useMemo(
    () => new Set(["bestiary", "banker", "politician", "builder"]),
    []
  );

  // Map id → nom FR
  const jobNameMap = useMemo(() => {
    const all = [...categories.flatMap(c => c.jobs), ...specials];
    return all.reduce((m, j) => {
      m[j.id] = j.name;
      return m;
    }, {});
  }, []);

  // Seuils XP → niveau
  const LEVEL_THRESHOLDS = [
    { thresh: 0, level: 0 },
    { thresh: 20, level: 1 },
    { thresh: 50, level: 2 },
    { thresh: 90, level: 3 },
    { thresh: 140, level: 4 },
    { thresh: 200, level: 5 },
    { thresh: 270, level: 6 },
    { thresh: 350, level: 7 },
    { thresh: 450, level: 8 },
    { thresh: 600, level: 9 },
    { thresh: 750, level: 10 },
    { thresh: 1000, level: 11 },
    { thresh: 1250, level: 12 },
    { thresh: 1600, level: 13 },
    { thresh: 2000, level: 14 },
    { thresh: 3000, level: 15 },
  ];
  const getThresh = lvl => {
    const e = LEVEL_THRESHOLDS.find(x => x.level === lvl);
    return e ? e.thresh : 0;
  };

  const loadJobs = useCallback(async () => {
    if (!userId) return;
    setError(null);
    setLoading(true);
    try {
      const data = await getPlayerJobs(userId);
      const obj = data?.jobs?.jobs ?? {};
      sessionStorage.setItem(cacheKey, JSON.stringify(obj));
      setJobs(obj);
    } catch (err) {
      console.error("Erreur récupération métiers :", err);
      setError("Impossible de charger vos métiers.");
    } finally {
      setLoading(false);
    }
  }, [userId, cacheKey]);

  useEffect(() => {
    if (!userId) {
      alert("❌ Vous devez être connecté !");
      navigate("/home");
      return;
    }
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setJobs(JSON.parse(cached));
      setLoading(false);
    } else {
      loadJobs();
    }
  }, [userId, navigate, cacheKey, loadJobs]);

  if (!userId)
    return (
      <p className="text-center text-red-400 mt-10">
        ❌ Utilisateur non connecté !
      </p>
    );
  if (loading) return <SkeletonGrid />;
  if (error)
    return (
      <p className="text-center text-red-400 mt-10">{error}</p>
    );

  const entries = Object.entries(jobs);
  if (entries.length === 0)
    return (
      <p className="text-center text-gray-400 mt-10">
        Aucun métier trouvé.
      </p>
    );

  return (
    <div className="p-10 bg-gray-900 min-h-screen">
      {/* Titre */}
      <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-400 mb-6 text-center">
        ⚒️ Sélectionnez un métier
      </h1>

      {/* Bouton Rafraîchir */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => { sessionStorage.removeItem(cacheKey); loadJobs(); }}
          className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition"
        >
          🔄 Rafraîchir les métiers
        </button>
      </div>

      {/* Grille des métiers */}
      <div className="grid grid-cols-4 gap-8">
        {entries.map(([key, job]) => {
          const isLocked = job.xp === -1;
          const maxLevel = EXCEPTIONS.has(key) ? 15 : 10;
          const isCompleted = job.level >= maxLevel;
          const displayLevel = isCompleted ? maxLevel : job.level;

          // Calcul progression
          let xpCurrent = 0, xpNeeded = 0, pct = 0;
          if (!isLocked && !isCompleted) {
            const currT = getThresh(job.level);
            const nextT = getThresh(job.level + 1);
            xpCurrent = job.xp - currT;
            xpNeeded = nextT - currT;
            pct = Math.round((xpCurrent / xpNeeded) * 100);
          }

          // Tooltip
          let tooltipText = "";
          if (isLocked) tooltipText = "Métier non débloqué";
          else if (isCompleted) tooltipText = "Métier complété";
          else tooltipText = `${xpCurrent}/${xpNeeded} (${pct}%)`;

          // Nom FR
          const displayName =
            jobNameMap[key] ||
            key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

          const handleClick = async () => {
            if (isLocked) return;
            try {
              const det = await getJobDetails(key);
              const path = det?.inter_choice?.length
                ? `/talent2/${key}?userId=${userId}`
                : `/talents/${key}?userId=${userId}`;
              navigate(path);
            } catch {
              alert("❌ Impossible de charger les détails.");
            }
          };

          const card = (
            <div
              onClick={handleClick}
              className={`relative rounded-lg overflow-hidden transition-opacity duration-200 ${
                isLocked
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-80"
              }`}
            >
              {/* Pastille de niveau */}
              {!isLocked && (
                <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold z-10 shadow-lg">
                  {displayLevel}
                </div>
              )}

              <img
                src={`/metiers/${key}.png`}
                alt={displayName}
                loading="lazy"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 pointer-events-none" />
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <h2 className="text-white text-xl font-bold drop-shadow">
                  {displayName}
                </h2>
                <span
                  className={`self-start px-2 py-1 rounded ${
                    isLocked
                      ? "bg-red-600 text-white"
                      : isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                  {isLocked
                    ? "Verrouillé"
                    : isCompleted
                    ? `Max`
                    : `XP : ${job.xp}`}
                </span>
              </div>

              {/* Barre de progression */}
              {!isLocked && !isCompleted && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30">
                  <div
                    className="h-full bg-green-400/50"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );

          return (
            <ToolTip key={key} text={tooltipText}>
              {card}
            </ToolTip>
          );
        })}
      </div>
    </div>
  );
}
