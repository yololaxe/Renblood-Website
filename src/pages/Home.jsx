// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import YouTube from "react-youtube";
import { FaVolumeMute, FaVolumeUp, FaDiscord, FaMapMarkedAlt, FaScroll, FaUsers } from "react-icons/fa";
import AdBox from "../components/ads/AdBox.jsx";
import { listenToAuthChanges } from "../data/firebaseConfig";
import { getPlayerFullProfile, getPlayers, getQuestsList } from "../services/api";
import { categories, specials } from "../data/metiers";

// --- COMPOSANTS UI ---

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-yellow-500/50 hover:bg-gray-800 transition-all group"
  >
    <div className="text-4xl text-yellow-500 mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
      {title}
    </h3>
    <p className="text-gray-400 text-sm leading-relaxed">
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
      <div className="text-4xl md:text-5xl font-extrabold text-white mb-1">
        {count}+
      </div>
      <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
        {label}
      </div>
    </div>
  );
};

export default function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(50);
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
    <div className="bg-gray-900 min-h-screen overflow-x-hidden font-sans text-gray-200">
      
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-900" />
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
            className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight"
          >
            Forge ton <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">Destin</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 font-light"
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
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaDiscord /> Rejoindre le Discord
            </a>
            <a 
              href="/histoire"
              className="px-8 py-4 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg font-bold text-lg backdrop-blur-sm border border-gray-600 transition-all hover:scale-105 flex items-center justify-center gap-2"
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
      <div className="bg-gray-900 border-b border-gray-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter end={stats.players} label="Joueurs Inscrits" />
          <StatCounter end={stats.cities} label="Villes Majeures" />
          <StatCounter end={stats.quests} label="Quêtes Uniques" />
          <StatCounter end={stats.jobs} label="Métiers" />
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <section className="py-20 px-4 relative z-20 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Un Monde Vivant</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full" />
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
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900 z-10" />
        
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">L'Histoire de Renblood</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            "Depuis l'aube des temps, les factions se déchirent pour le contrôle des ressources magiques. 
            Aujourd'hui, une nouvelle ère commence. Serez-vous le héros qui unifiera les peuples, 
            ou le conquérant qui les asservira ?"
          </p>
          <a 
            href="/histoire"
            className="inline-block px-8 py-3 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900 font-bold rounded-full transition-all duration-300"
          >
            Lire la suite
          </a>
        </div>
      </section>

      {/* --- GALERIE --- */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Aperçu du Royaume</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["screen1.png", "screen2.png", "screen3.png", "screen4.png", "screen5.png", "screen6.png", "screen7.png", "screen8.png"].map((img, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="aspect-video rounded-lg overflow-hidden shadow-lg cursor-pointer"
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
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Prêt à écrire ta légende ?</h2>
        <p className="text-gray-400 mb-10 max-w-xl mx-auto">
          Rejoins des milliers d'autres joueurs et commence ton aventure dès aujourd'hui.
          Le royaume de Renblood t'attend.
        </p>
        <button
          onClick={() => (window.location.href = "https://discord.gg/uwNy5tM8jU")}
          className="px-10 py-5 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] transition-all transform hover:-translate-y-1"
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
    </div>
  );
}
