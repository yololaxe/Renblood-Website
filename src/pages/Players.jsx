import RealmHeader from "../components/RealmHeader";
// src/pages/Players.jsx
import { useEffect, useState } from "react";
import { getPlayers } from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext";

import { motion } from "framer-motion";
import { FaUserCircle, FaSearch, FaFilter, FaCog, FaPlus } from "react-icons/fa";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const { userRank } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      const data = await getPlayers(userRank);
      if (data) {
        setPlayers(data);
        setFilteredPlayers(data);
      }
      setLoading(false);
    }
    fetchPlayers();
  }, [userRank]);

  useEffect(() => {
    const results = players.filter(player =>
      (player.pseudo_minecraft || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.name && player.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (player.surname && player.surname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPlayers(results);
  }, [searchTerm, players]);

  return <main className="realm-page">
    <RealmHeader eyebrow="Le registre / Habitants" title="Les visages du royaume" description="Des noms, des histoires et des destins qui se croisent. Retrouvez les citoyens de Renblood." image="/accueil/screen1.png">
      {userRank === "Admin" && <><button className="realm-action" onClick={() => navigate("/players-admin")}><FaCog /> Gérer les joueurs</button><button className="realm-action" onClick={() => navigate("/create-player")}><FaPlus /> Créer un joueur</button></>}
    </RealmHeader>
    <section className="realm-content" aria-label="Registre des joueurs">
      <div className="realm-toolbar"><label className="realm-search"><FaSearch /><span className="sr-only">Rechercher un joueur</span><input placeholder="Un nom, un personnage…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></label><p className="realm-count" aria-live="polite">{loading ? "Chargement du registre…" : `${filteredPlayers.length} personnage${filteredPlayers.length > 1 ? "s" : ""}`}</p></div>
      {loading ? <p className="realm-empty" role="status">Ouverture du registre…</p> : !filteredPlayers.length ? <div className="realm-empty"><p>Aucun personnage ne correspond à cette recherche.</p><button className="realm-action mt-4" onClick={() => setSearchTerm("")}>Effacer la recherche</button></div> : <div className="realm-register">
        {filteredPlayers.map((player,index) => <motion.article key={player.id || player.pseudo_minecraft} className="realm-citizen" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true,amount:.15}} transition={{duration:.4,delay:Math.min(index % 3 * .06,.12)}}>
          <div className="realm-avatar"><FaUserCircle size={28} />{player.discord_avatar ? <img onError={e => { e.currentTarget.style.display = "none"; }} loading="lazy" src={`https://cdn.discordapp.com/avatars/${player.discord_id}/${player.discord_avatar}.png`} alt="" /> : null}</div>
          <div className="min-w-0"><span className="realm-rank">{player.rank}</span><h2>{player.pseudo_minecraft || "Sans nom"}</h2><p>{player.description || "Une histoire reste à écrire."}</p><dl><div><dt>Identité</dt><dd>{[player.name,player.surname].filter(Boolean).join(" ") || "Non renseignée"}</dd></div><div><dt>Divinité</dt><dd>{player.divin || "Aucune"}</dd></div></dl></div>
        </motion.article>)}
      </div>}
    </section>
  </main>;
}
