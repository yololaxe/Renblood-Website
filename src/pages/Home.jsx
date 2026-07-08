// src/pages/Home.jsx
import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import YouTube from "react-youtube";
import { FaVolumeMute, FaVolumeUp, FaDiscord, FaMapMarkedAlt, FaScroll, FaUsers, FaUserCircle, FaSearch, FaTasks, FaBookOpen, FaNewspaper, FaStar } from "react-icons/fa";
import AdBox from "../components/ads/AdBox.jsx";
import { listenToAuthChanges } from "../data/firebaseConfig";
import { getPlayerFullProfile, getPlayers, getQuestsList } from "../services/api";
import { categories, specials } from "../data/metiers";

const GlobalSearch = lazy(() => import("../components/GlobalSearch"));

// --- COMPOSANTS UI ---

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 p-6 shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-yellow-500/50 hover:bg-gray-800"
  >
    <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
    <div className="mb-4 text-4xl text-yellow-500 transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-yellow-400">
      {title}
    </h3>
    <p className="text-sm leading-relaxed text-gray-400">
      {description}
    </p>
  </motion.div>
);

const StatCounter = ({ end, label }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center">
      <div className="mb-1 text-4xl font-extrabold text-white md:text-5xl">
        {count}+
      </div>
      <div className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </div>
    </div>
  );
};

const QuickLinkCard = ({ icon, title, description, href, actionLabel, onClick, accent = "yellow" }) => {
  const accentClasses = {
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    green: "text-green-400 bg-green-500/10 border-green-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  };
  const content = (
    <div className="relative h-full overflow-hidden rounded-xl border border-gray-700 bg-gray-800/80 p-5 text-left shadow-lg transition hover:-translate-y-1 hover:border-yellow-500/50 hover:bg-gray-800">
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border ${accentClasses[accent]}`}>
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-gray-400">{description}</p>
      <span className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-200 transition group-hover:text-white">
        {actionLabel}
      </span>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="group h-full w-full">
        {content}
      </button>
    );
  }

  return (
    <a href={href} className="group block h-full">
      {content}
    </a>
  );
};

export default function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(50);
  const [searchOpen, setSearchOpen] = useState(false);
  const playerRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Parallaxe pour le hero
  const yHero = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

  // Auth & Patreon
  const [authStatus, setAuthStatus] = useState("unknown");
  const [patreon, setPatreon] = useState(undefined);

  // Stats dynamiques
  const [stats, setStats] = useState({
    players: 0,
    quests: 0,
    cities: 12, // Valeur fixe pour l'instant
    jobs: 0
  });

  useEffect(() => {
    document.title = "Renblood - Accueil";
    
    // Auth & Patreon
    const unsub = listenToAuthChanges(async (user) => {
      if (!user) {
        setAuthStatus("guest");
        setPatreon(null);
        return;
      }
      setAuthStatus("authed");
      try {
        const profile = await getPlayerFullProfile(user.uid);
        setPatreon(Number(profile?.patreon ?? 0));
      } catch {
        setPatreon(0);
      }
    });

    // Chargement des stats
    const loadStats = async () => {
      try {
        // 1. Joueurs (on compte plusieurs rangs pour avoir une idée globale)
        const ranks = ["Citoyen", "Etranger", "Villageois", "Noble", "Admin"];
        const playersPromises = ranks.map(r => getPlayers(r));
        const playersResults = await Promise.all(playersPromises);
        const totalPlayers = playersResults.flat().filter(Boolean).length;

        // 2. Quêtes
        const questsList = await getQuestsList();
        const totalQuests = questsList ? questsList.length : 0;

        // 3. Métiers (depuis le fichier de config)
        const totalJobs = categories.reduce((acc, cat) => acc + cat.jobs.length, 0) + specials.length;

        setStats(prev => ({
          ...prev,
          players: totalPlayers || 50, // Fallback si 0
          quests: totalQuests || 20,
          jobs: totalJobs
        }));
      } catch (err) {
        console.error("Erreur chargement stats:", err);
      }
    };
    loadStats();

    return () => unsub && unsub();
  }, []);

  const onPlayerReady = (event) => {
    const player = event.target;
    player.mute();
    player.setVolume(volume);
    player.setPlaybackQuality("hd1080");
    playerRef.current = player;
  };

  const toggleSound = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  const videoOptions = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 0,
      mute: 1,
      loop: 1,
      playlist: "jLFNzAMJ5DE",
      modestbranding: 1,
      showinfo: 0,
      fs: 0,
      disablekb: 1,
      rel: 0,
      iv_load_policy: 3,
      cc_load_policy: 0,
      quality: "hd1080",
      vq: "hd1080",
    },
  };

  const adPatreonProp = authStatus === "unknown" ? undefined : authStatus === "guest" ? null : patreon;

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-900 font-sans text-gray-200">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <YouTube
            videoId="jLFNzAMJ5DE"
            opts={videoOptions}
            onReady={onPlayerReady}
            className="absolute inset-0 w-full h-full scale-125" // Scale pour éviter les bandes noires
            iframeClassName="w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-gray-900" />
        </div>

        {/* Sound Control */}
        <button
          onClick={toggleSound}
          className="absolute top-24 right-6 z-20 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>

        {/* Hero Content */}
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            src="/accueil/logo.png"
            alt="Renblood Logo"
            className="w-64 md:w-80 mb-8 drop-shadow-[0_0_25px_rgba(234,179,8,0.3)]"
          />
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-4 text-5xl font-extrabold tracking-tight text-white md:text-7xl"
          >
            Forge ton <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">Destin</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-10 max-w-2xl text-lg font-light text-gray-300 md:text-xl"
          >
            Plonge dans un univers médiéval-fantastique unique. 
            Commerce, politique, guerre ou artisanat : quelle voie choisiras-tu ?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a 
              href="https://discord.gg/uwNy5tM8jU"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded border border-indigo-300/30 bg-indigo-800/85 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-950/40 transition-all hover:scale-105 hover:bg-indigo-700"
            >
              <FaDiscord /> Rejoindre le Discord
            </a>
            <a 
              href="/histoire"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-800/80 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-yellow-500 hover:bg-gray-700"
            >
              <FaScroll /> Découvrir le Lore
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400 text-sm flex flex-col items-center gap-2"
        >
          <span className="uppercase tracking-widest text-xs">Explorer</span>
          <div className="w-px h-12 bg-gradient-to-b from-yellow-500 to-transparent" />
        </motion.div>
      </div>

      {/* --- STATS SECTION --- */}
      <div className="relative z-20 border-b border-gray-800 bg-gray-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
          <StatCounter end={stats.players} label="Joueurs Inscrits" />
          <StatCounter end={stats.cities} label="Villes Majeures" />
          <StatCounter end={stats.quests} label="Quêtes Uniques" />
          <StatCounter end={stats.jobs} label="Métiers" />
        </div>
      </div>

      {/* --- PLAYER HUB --- */}
      <section className="relative z-20 overflow-hidden bg-gray-900 px-4 py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-yellow-400">Table du voyageur</p>
              <h2 className="text-3xl font-bold text-white">Reprendre la route sans consulter tout le royaume</h2>
            </div>
            <a
              href="/histoire"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:border-yellow-500 hover:text-white"
            >
              <FaBookOpen /> Ouvrir le guide complet
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <QuickLinkCard
              icon={<FaUserCircle />}
              title="Continuer ma progression"
              description="Accède à ton personnage, tes quêtes et tes talents pour reprendre exactement où tu t'es arrêté."
              href={authStatus === "guest" ? "/auth" : "/character"}
              actionLabel={authStatus === "guest" ? "Se connecter" : "Voir mon personnage"}
              accent="yellow"
            />
            <QuickLinkCard
              icon={<FaSearch />}
              title="Trouver une info"
              description="Cherche une règle, un PNJ, une ville, un métier, une famille, une quête ou un joueur."
              onClick={() => setSearchOpen(true)}
              actionLabel="Lancer la recherche"
              accent="blue"
            />
            <QuickLinkCard
              icon={<FaTasks />}
              title="Préparer ma session"
              description="Rassemble les infos utiles avant de jouer : quêtes, carte, PNJ, métiers et lois."
              href="/histoire"
              actionLabel="Préparer maintenant"
              accent="green"
            />
            <QuickLinkCard
              icon={<FaNewspaper />}
              title="Dernières nouveautés"
              description="Consulte le journal pour suivre les événements, annonces et changements récents."
              href="/histoires/journal"
              actionLabel="Lire le journal"
              accent="purple"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { href: "/quests", label: "Quêtes", icon: <FaScroll /> },
              { href: "/map", label: "Carte", icon: <FaMapMarkedAlt /> },
              { href: "/histoires/metiers", label: "Métiers", icon: <FaStar /> },
              { href: "/histoires/lois", label: "Lois", icon: <FaBookOpen /> },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-yellow-500 hover:bg-gray-800 hover:text-white"
              >
                {item.icon} {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="relative z-20 bg-gray-900 px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-yellow-400">Chroniques de terrain</p>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Un Monde Vivant</h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-yellow-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FaMapMarkedAlt />}
              title="Exploration Sans Limite"
              description="Parcours un monde immense, des forêts enchantées aux déserts arides. Découvre des secrets enfouis et des trésors oubliés."
              delay={0.1}
            />
            <FeatureCard 
              icon={<FaUsers />}
              title="Communauté Active"
              description="Rejoins des guildes, fonde ta propre ville ou participe aux événements politiques du serveur. Ton impact est réel."
              delay={0.2}
            />
            <FeatureCard 
              icon={<FaScroll />}
              title="Quêtes Épiques"
              description="Suis une trame narrative riche et évolutive. Tes choix influenceront l'histoire du royaume et ton propre destin."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* --- LORE PREVIEW (Parallax) --- */}
      <section className="relative py-32 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center z-0 opacity-30"
          style={{ backgroundImage: "url('/accueil/carte-renblood.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/10 to-gray-900 z-10" />
        
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">L'Histoire de Renblood</h2>
          <p className="mb-8 text-xl leading-relaxed text-gray-300">
            "Depuis l'aube des temps, les factions se déchirent pour le contrôle des ressources magiques. 
            Aujourd'hui, une nouvelle ère commence. Serez-vous le héros qui unifiera les peuples, 
            ou le conquérant qui les asservira ?"
          </p>
          <a 
            href="/histoire"
            className="inline-block rounded-full border-2 border-yellow-500 px-8 py-3 font-bold text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-gray-900"
          >
            Lire la suite
          </a>
        </div>
      </section>

      {/* --- GALERIE --- */}
      <section className="bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Aperçu du Royaume</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["screen1.png", "screen2.png", "screen3.png", "screen4.png", "screen5.png", "screen6.png", "screen7.png", "screen8.png"].map((img, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="aspect-video cursor-pointer overflow-hidden rounded-lg shadow-lg ring-1 ring-white/5 transition hover:ring-yellow-500/40"
              >
                <img 
                  src={`/accueil/${img}`} 
                  alt={`Screenshot ${i}`} 
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="bg-gradient-to-b from-gray-900 to-black px-4 py-24 text-center">
        <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Prêt à écrire ta légende ?</h2>
        <p className="mx-auto mb-10 max-w-xl text-gray-400">
          Rejoins des milliers d'autres joueurs et commence ton aventure dès aujourd'hui.
          Le royaume de Renblood t'attend.
        </p>
        <button
          onClick={() => (window.location.href = "https://discord.gg/uwNy5tM8jU")}
          className="transform rounded-full bg-green-600 px-10 py-5 text-xl font-bold text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all hover:-translate-y-1 hover:bg-green-500 hover:shadow-[0_0_50px_rgba(34,197,94,0.6)]"
        >
          Rejoindre Maintenant
        </button>
      </section>

      {/* Pub (réutilisable) */}
      {/*<div className="fixed bottom-6 right-6 z-50">*/}
      {/*  <AdBox*/}
      {/*      patreon={adPatreonProp}*/}
      {/*      slot="home-bottom-right"*/}
      {/*      size="sm"*/}
      {/*      hideWhenAdFree={true}*/}
      {/*      test={true}*/}
      {/*  />*/}
      {/*</div>*/}
      {searchOpen && (
        <Suspense fallback={null}>
          <GlobalSearch open onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
