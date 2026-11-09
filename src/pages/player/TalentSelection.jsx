import RealmHeader from "../../components/RealmHeader";
// src/pages/TalentSelection.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayerJobs, getJobDetails } from "../../services/api.js";
import { useUser } from "../../context/UserContext.jsx";
import ToolTip from "../../components/Tooltip";
import { motion } from "framer-motion";
import { FaHammer, FaLock, FaCheckCircle, FaSync } from "react-icons/fa";

// Définitions françaises des métiers
import { categories, specials } from "../../data/metiers";

function SkeletonGrid() {
  return (
    <div className="p-10 bg-[#11110f] min-h-screen">
      <div className="h-12 bg-[#1b1b17] rounded w-1/3 mx-auto animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="h-64 bg-[#1b1b17] rounded-sm animate-pulse" />
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
  const [filter, setFilter] = useState("Tous");
  const navigate = useNavigate();

  const cacheKey = `mcJobs_${userId}`;

  // MÉTIERS dont le niveau max = 15
  const EXCEPTIONS = useMemo(
    () => new Set(["bestiary", "banker", "politician", "builder"]),
    []
  );

  // Map id → nom FR & Catégorie
  const jobMetaMap = useMemo(() => {
    const all = [...categories.flatMap(c => c.jobs.map(j => ({ ...j, category: c.name }))), ...specials.map(s => ({ ...s, category: "Spécial" }))];
    return all.reduce((m, j) => {
      m[j.id] = { name: j.name, category: j.category, image: j.image, description: j.description, difficulty: j.difficulty };
      return m;
    }, {});
  }, []);

  const categoriesList = ["Tous", ...new Set(Object.values(jobMetaMap).map(j => j.category))];

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

  if (!userId) return <p className="text-center text-red-400 mt-10">❌ Utilisateur non connecté !</p>;
  if (loading) return <SkeletonGrid />;
  if (error) return <p className="text-center text-red-400 mt-10">{error}</p>;

  const entries = Object.entries(jobs).filter(([key]) => {
    if (filter === "Tous") return true;
    return jobMetaMap[key]?.category === filter;
  });

  return (
    <div className="realm-page talent-catalog">
      
      <RealmHeader eyebrow="Le savoir-faire / Talents" title="L’art de se distinguer" description="Chaque métier ouvre un chemin. Développez vos aptitudes, choisissez vos spécialisations et faites votre place dans le royaume." />

      {/* --- FILTRES & ACTIONS --- */}
      <div className="realm-content mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === cat 
                  ? "bg-yellow-500 text-gray-900 shadow-none scale-105" 
                  : "bg-[#1b1b17] text-stone-400 hover:bg-stone-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => { sessionStorage.removeItem(cacheKey); loadJobs(); }}
          className="flex items-center gap-2 text-sm bg-amber-800 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition shadow-md"
        >
          <FaSync className={loading ? "animate-spin" : ""} /> Rafraîchir
        </button>
      </div>

      {/* --- GRILLE DES MÉTIERS --- */}
      <div className="max-w-[1680px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {entries.map(([key, job], index) => {
          const meta = jobMetaMap[key] || { name: key, image: null, description: "", difficulty: "Moyenne" };
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

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{once:true,amount:.1}}
              transition={{ duration: .4, delay: Math.min(index % 4 * .06,.18) }}
              onClick={handleClick}
              role="button" tabIndex={isLocked ? -1 : 0} aria-disabled={isLocked} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}
              className={`relative bg-[#1b1b17] rounded-sm overflow-hidden border border-stone-700 shadow-none group transition-all duration-300 ${
                isLocked ? "opacity-60 cursor-not-allowed grayscale" : "cursor-pointer hover:border-yellow-500/50 hover:shadow-none hover:-translate-y-1"
              }`}
            >
              {/* Image de fond */}
              <div className="h-40 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
                <img
                  src={meta.image || `/metiers/${key}.png`}
                  alt={meta.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => e.target.src = "/metiers/default.png"} 
                />
                
                {/* Badge Niveau */}
                {!isLocked && (
                  <div className="absolute top-3 right-3 z-20 bg-[#11110f]/90 backdrop-blur text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30 shadow-none">
                    Lvl {displayLevel}
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="p-5 relative z-20 -mt-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {meta.name}
                  </h2>
                  {isCompleted && <FaCheckCircle className="text-green-500 mt-1" />}
                  {isLocked && <FaLock className="text-red-500 mt-1" />}
                </div>

                <p className="text-sm text-stone-400 line-clamp-2 mb-4 h-10">
                  {meta.description || "Aucune description disponible."}
                </p>

                {/* Barre XP */}
                {!isLocked && !isCompleted && (
                  <div className="w-full bg-stone-800 rounded-full h-2 mb-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}

                <div className="flex justify-between items-center text-xs font-medium">
                  <span className={`px-2 py-0.5 rounded ${
                    meta.difficulty === "Facile" ? "bg-green-900/30 text-green-400" :
                    meta.difficulty === "Moyenne" ? "bg-yellow-900/30 text-yellow-400" :
                    "bg-red-900/30 text-red-400"
                  }`}>
                    {meta.difficulty}
                  </span>
                  <span className="text-stone-500">
                    {isLocked ? "Verrouillé" : isCompleted ? "Maître" : `${xpCurrent}/${xpNeeded} XP`}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
