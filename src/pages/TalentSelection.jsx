import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayerJobs, getJobDetails } from "../services/api";
import { useUser } from "../context/UserContext";

function TalentSelection() {
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

  if (!userId)
    return (
      <p className="text-center text-red-400 mt-10">
        ❌ Utilisateur non connecté !
      </p>
    );
  if (!jobs)
    return (
      <p className="text-center text-gray-400 mt-10">Chargement...</p>
    );

  return (
    <div className="p-10 text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-center">
        ⚒️ Sélectionnez un Métier
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {Object.entries(jobs).map(([key, job]) => {
          const isLocked = job.xp === -1;
          const displayName =
            key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

          return (
            <div
              key={key}
              className={`relative flex flex-col justify-between p-6 rounded-xl transition-shadow ${
                isLocked
                  ? "bg-gray-800 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-br from-blue-600 to-blue-500 hover:shadow-2xl hover:from-blue-500 hover:to-blue-400"
              }`}
            >
              {/* Métier */}
              <div>
                <h2 className="text-xl font-bold mb-2">{displayName}</h2>
                {!isLocked && (
                  <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
                    XP: {job.xp}
                  </span>
                )}
              </div>

              {/* Actions */}
              {!isLocked ? (
                <button
                  onClick={async () => {
                    try {
                      const details = await getJobDetails(key);
                      const path =
                        details?.inter_choice?.length > 0
                          ? `/talent2/${key}?userId=${userId}`
                          : `/talents/${key}?userId=${userId}`;
                      navigate(path);
                    } catch (err) {
                      console.error("Erreur détails métier :", err);
                      alert(
                        "❌ Impossible de charger les détails du métier."
                      );
                    }
                  }}
                  className="mt-6 self-start inline-block bg-white/30 hover:bg-white/40 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Voir l’arbre
                </button>
              ) : (
                <div className="mt-6 flex items-center text-gray-400">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v1h1a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6a1 1 0 011-1h1v-1c0-1.657 1.343-3 3-3z"
                    />
                  </svg>
                  <span className="font-semibold">Verrouillé</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TalentSelection;
