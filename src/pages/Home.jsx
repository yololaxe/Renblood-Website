import ImmersiveKingdom from "../components/ImmersiveKingdom";
// src/pages/Home.jsx
import { lazy, Suspense, useEffect, useMemo, useState, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, useInView } from "framer-motion";
import YouTube from "react-youtube";
import { FaVolumeMute, FaVolumeUp, FaDiscord, FaMapMarkedAlt, FaScroll, FaUsers, FaUserCircle, FaSearch, FaTasks, FaBookOpen, FaNewspaper, FaStar, FaMusic, FaPause, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AdBox from "../components/ads/AdBox.jsx";
import { listenToAuthChanges } from "../data/firebaseConfig";
import { getPlayerFullProfile, getPublicStats } from "../services/api";
import { categories, specials } from "../data/metiers";

const GlobalSearch = lazy(() => import("../components/GlobalSearch"));

// --- COMPOSANTS UI ---

const FeatureCard = ({ icon, title, description, delay, number }) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, delay }}
    viewport={{ once: true, amount: 0.2 }}
    className="group border-t border-stone-700 py-6 transition-colors hover:border-yellow-400 sm:py-8"
  >
    <div className="mb-8 flex items-center justify-between text-yellow-400">
      <span className="font-mono text-xs tracking-[0.2em] text-stone-500">{number}</span>
      <span className="text-xl transition-transform duration-300 group-hover:-translate-y-1">{icon}</span>
    </div>
    <h3 className="mb-3 max-w-xs text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-yellow-300 sm:text-3xl">{title}</h3>
    <p className="max-w-sm text-sm leading-7 text-stone-400 sm:text-base">{description}</p>
  </motion.article>
);

const StatCounter = ({ end, label }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);
  const visible = useInView(counterRef, {once:true});
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!visible) return;
    if (reduced) { setCount(end); return; }
    let frame;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / 1000, 1);
      setCount(Math.round(end * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, visible, reduced]);

  return (
    <div ref={counterRef} className="text-center">
      <div className="mb-1 text-4xl font-extrabold text-white md:text-5xl">
        {count}+
      </div>
      <div className="text-sm font-semibold uppercase tracking-wider text-stone-400">
        {label}
      </div>
    </div>
  );
};

const QuickLinkCard = ({ icon, title, description, href, actionLabel, onClick, accent = "yellow", number }) => {
  const accentClasses = {
    yellow: "text-yellow-300",
    blue: "text-sky-300",
    green: "text-emerald-300",
    purple: "text-violet-300",
  };
  const content = (
    <div className="group/card flex h-full flex-col border-t border-stone-700 py-5 text-left transition-colors hover:border-yellow-400 sm:py-6 xl:border-l xl:pl-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="font-mono text-xs tracking-[0.18em] text-stone-500">{number}</span>
        <span className={"text-lg " + accentClasses[accent]}>{icon}</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold leading-snug text-white transition-colors group-hover/card:text-yellow-300 sm:text-xl">{title}</h3>
      <p className="mb-6 flex-1 text-sm leading-6 text-stone-400">{description}</p>
      <span className="inline-flex items-center gap-2 self-start border-b border-yellow-500/50 pb-1 text-sm font-semibold text-stone-200 transition-colors group-hover/card:border-yellow-300 group-hover/card:text-yellow-200">
        {actionLabel}<span aria-hidden="true">→</span>
      </span>
    </div>
  );
  if (onClick) return <button type="button" onClick={onClick} className="group h-full w-full text-left">{content}</button>;
  return <a href={href} className="group block h-full">{content}</a>;
};

export default function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(true);
  const [musicVolume, setMusicVolume] = useState(22);
  const [volume, setVolume] = useState(50);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const playerRef = useRef(null);
  const localVideoRef = useRef(null);
  const musicRef = useRef(null);
  const { scrollY } = useScroll();
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (selectedImage === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleGalleryKey = (event) => {
      if (event.key === "Escape") setSelectedImage(null);
      if (event.key === "ArrowRight") setSelectedImage((current) => (current + 1) % 8);
      if (event.key === "ArrowLeft") setSelectedImage((current) => (current + 7) % 8);
    };
    window.addEventListener("keydown", handleGalleryKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleGalleryKey);
    };
  }, [selectedImage]);

  const localBackgrounds = useMemo(
    () => [
      "/animation/Animated_fantasy_city.mp4",
      "/animation/Animated_fantasy_countryside.mp4",
      "/animation/Animated_medieval_village.mp4",
      "/animation/Animating_Minecraft_server.mp4",
    ],
    []
  );

  const backgroundSources = useMemo(
    () => [
      { type: "youtube", id: "jLFNzAMJ5DE", label: "YouTube" },
      ...localBackgrounds.map((src, index) => ({ type: "local", src, label: `Animation ${index + 1}` })),
    ],
    [localBackgrounds]
  );

  const [activeBackground, setActiveBackground] = useState(0);


  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.muted = isMuted;
      localVideoRef.current.volume = isMuted ? 0 : Math.max(0.15, volume / 100);
    }
  }, [isMuted, volume]);
  
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
        const publicStats = await getPublicStats();
        const totalPlayers = publicStats?.players || 0;
        const totalQuests = publicStats?.quests || 0;
        const totalJobs = publicStats?.jobs || categories.reduce((acc, cat) => acc + cat.jobs.length, 0) + specials.length;

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
    player.setPlaybackQuality("highres");
    player.setPlaybackRate(1);
    playerRef.current = player;
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (playerRef.current) {
      if (nextMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    }

    if (localVideoRef.current) {
      localVideoRef.current.muted = nextMuted;
      localVideoRef.current.volume = nextMuted ? 0 : Math.max(0.15, volume / 100);
    }
  };

  const toggleMusic = async () => {
    const audio = musicRef.current;
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
      return;
    }

    audio.volume = musicVolume / 100;
    audio.muted = false;
    try {
      await audio.play();
      setIsMusicMuted(false);
      setIsMusicPlaying(true);
    } catch {
      setIsMusicPlaying(false);
    }
  };

  const toggleMusicMute = () => {
    const audio = musicRef.current;
    if (!audio) return;
    const nextMuted = !isMusicMuted;
    audio.muted = nextMuted;
    setIsMusicMuted(nextMuted);
  };

  const changeMusicVolume = (event) => {
    const nextVolume = Number(event.target.value);
    setMusicVolume(nextVolume);
    if (musicRef.current) musicRef.current.volume = nextVolume / 100;
  };

  const videoOptions = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 0,
      mute: 1,
      loop: 1,
      playsinline: 1,
      playlist: "jLFNzAMJ5DE",
      modestbranding: 1,
      showinfo: 0,
      fs: 0,
      disablekb: 1,
      rel: 0,
      iv_load_policy: 3,
      cc_load_policy: 0,
      origin: window.location.origin,
      quality: "hd1080",
      vq: "hd1080",
      enablejsapi: 1,
    },
  };

  const currentBackground = backgroundSources[activeBackground] || backgroundSources[0];

  const adPatreonProp = authStatus === "unknown" ? undefined : authStatus === "guest" ? null : patreon;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#11110f] font-sans text-stone-200">
      
      {/* --- HERO SECTION --- */}
      <div className="relative min-h-[calc(100svh-4rem)] w-full overflow-hidden py-16 sm:py-20">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          {currentBackground?.type === "youtube" ? (
            <YouTube
              key="youtube-backdrop"
              videoId={currentBackground.id}
              opts={videoOptions}
              onReady={onPlayerReady}
              className="absolute inset-0 h-full w-full scale-125"
              iframeClassName="pointer-events-none h-full w-full object-cover"
            />
          ) : (
            <video
              key={currentBackground.src}
              ref={localVideoRef}
              className="absolute inset-0 h-full w-full scale-125 object-cover"
              src={currentBackground.src}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="auto"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-gray-900" />
        </div>

        <audio ref={musicRef} src="/pippin-the-hunchback.mp3" loop preload="none" />

        {/* Medieval ambience controls */}
        <div className="absolute left-3 top-20 z-20 flex max-w-[calc(100vw-4.5rem)] flex-col gap-1.5 rounded-sm border border-white/15 bg-black/55 px-3 py-2 text-white shadow-none backdrop-blur-md sm:left-6 sm:top-24">
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleMusic}
              type="button"
              aria-label={isMusicPlaying ? "Mettre la musique médiévale en pause" : "Lancer la musique médiévale"}
              aria-pressed={isMusicPlaying}
              title={isMusicPlaying ? "Mettre en pause" : "Écouter la musique médiévale"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
            >
              {isMusicPlaying ? <FaPause aria-hidden="true" /> : <FaMusic aria-hidden="true" />}
            </button>
            <button
              onClick={toggleMusicMute}
              type="button"
              aria-label={isMusicMuted ? "Activer le son de la musique" : "Couper le son de la musique"}
              aria-pressed={!isMusicMuted}
              title={isMusicMuted ? "Activer le son de la musique" : "Couper le son de la musique"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
            >
              {isMusicMuted ? <FaVolumeMute aria-hidden="true" /> : <FaVolumeUp aria-hidden="true" />}
            </button>
            <label className="flex min-w-0 items-center gap-2 text-xs text-stone-200">
              <span className="sr-only">Volume de la musique médiévale</span>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={changeMusicVolume}
                aria-label="Volume de la musique médiévale"
                aria-valuetext={`${musicVolume}%`}
                className="w-20 accent-yellow-300 sm:w-24"
              />
              <output className="w-8 text-right tabular-nums" aria-live="polite">{musicVolume}%</output>
            </label>
          </div>
          <a
            href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400005"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] leading-tight text-stone-300 underline decoration-white/40 underline-offset-2 hover:text-white"
          >
            Pippin the Hunchback — Kevin MacLeod (incompetech.com) · CC BY 4.0
          </a>
        </div>

        {/* Sound Control */}
        <button
          onClick={toggleSound}
          type="button"
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
          className="absolute right-20 top-20 z-20 rounded-full border border-white/15 bg-black/55 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 sm:right-20 md:top-24"
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>

        {/* Background selector */}
        <div aria-label="Choisir un fond" className="absolute right-1 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1 rounded-full border border-white/15 bg-black/45 p-1 backdrop-blur-md sm:right-3 sm:gap-2 sm:p-2">
          {backgroundSources.map((background, index) => (
            <button
              key={`${background.type}-${background.id || background.src}`}
              type="button"
              aria-label={`Choisir le fond ${index === 0 ? "YouTube" : index} : ${background.label}`}
              aria-pressed={activeBackground === index}
              onClick={() => setActiveBackground(index)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 ${activeBackground === index ? "border-yellow-300 bg-yellow-400/20 shadow-[0_0_12px_rgba(250,204,21,0.35)]" : "border-white/30 hover:bg-white/15"}`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div 
          style={reducedMotion ? {} : { y: yHero, opacity: opacityHero }}
          className="relative z-10 flex min-h-[calc(100svh-8rem)] flex-col items-center justify-center px-10 text-center sm:px-12"
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            src="/accueil/logo.png"
            alt="Renblood Logo"
            className="mb-5 w-44 drop-shadow-[0_0_25px_rgba(234,179,8,0.3)] sm:mb-8 sm:w-56 md:w-72"
          />
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="home-title mb-4 text-white"
          >
            {["Forge", "ton", "destin."].map((word,i) => <span key={word} className="word-mask"><motion.span initial={reducedMotion?false:{y:"110%"}} animate={{y:0}} transition={{duration:.85,delay:.25+i*.13,ease:[.2,.65,.25,1]}} className={i===2?"text-amber-300":""}>{word}&nbsp;</motion.span></span>)}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-10 max-w-2xl text-lg font-light text-stone-300 md:text-xl"
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
              className="flex items-center justify-center gap-2 rounded border border-indigo-300/30 bg-indigo-800/85 px-8 py-4 text-lg font-bold text-white shadow-none shadow-indigo-950/40 transition-all hover:scale-105 hover:bg-indigo-700"
            >
              <FaDiscord /> Rejoindre le Discord
            </a>
            <a 
              href="/histoire"
              className="flex items-center justify-center gap-2 rounded-lg border border-stone-600 bg-[#1b1b17]/80 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-yellow-500 hover:bg-stone-800"
            >
              <FaScroll /> Découvrir le Lore
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-stone-400 text-sm flex flex-col items-center gap-2"
        >
          <span className="uppercase tracking-widest text-xs">Explorer</span>
          <div className="w-px h-12 bg-gradient-to-b from-yellow-500 to-transparent" />
        </motion.div>
      </div>

      {/* --- STATS SECTION --- */}
      <div className="relative z-20 border-b border-stone-800 bg-[#11110f]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
          <StatCounter end={stats.players} label="Joueurs Inscrits" />
          <StatCounter end={stats.cities} label="Villes Majeures" />
          <StatCounter end={stats.quests} label="Quêtes Uniques" />
          <StatCounter end={stats.jobs} label="Métiers" />
        </div>
      </div>

      {/* --- PLAYER HUB --- */}
      <ImmersiveKingdom onSelect={setSelectedImage} />

      <section className="relative z-20 overflow-hidden bg-[#11110f] px-4 py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-yellow-400">Table du voyageur</p>
              <h2 className="text-3xl font-bold text-white">Tes repères pour la suite</h2>
            </div>
            <a
              href="/histoire"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-700 bg-[#1b1b17] px-4 py-3 text-sm font-semibold text-stone-200 transition hover:border-yellow-500 hover:text-white"
            >
              <FaBookOpen /> Ouvrir le guide complet
            </a>
          </div>

          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 xl:grid-cols-4">
            <QuickLinkCard
              icon={<FaUserCircle />} number="01"
              title="Continuer ma progression"
              description="Ton profil, tes quêtes et tes talents au même endroit."
              href={authStatus === "guest" ? "/auth" : "/character"}
              actionLabel={authStatus === "guest" ? "Se connecter" : "Voir mon personnage"}
              accent="yellow"
            />
            <QuickLinkCard
              icon={<FaSearch />} number="02"
              title="Trouver une info"
              description="Règles, PNJ, lieux, métiers ou quêtes : tout est à portée de recherche."
              onClick={() => setSearchOpen(true)}
              actionLabel="Lancer la recherche"
              accent="blue"
            />
            <QuickLinkCard
              icon={<FaTasks />} number="03"
              title="Préparer ma session"
              description="Carte, quêtes, personnages et règles pour préparer ta prochaine session."
              href="/histoire"
              actionLabel="Préparer maintenant"
              accent="green"
            />
            <QuickLinkCard
              icon={<FaNewspaper />} number="04"
              title="Dernières nouveautés"
              description="Retrouve les annonces et les changements récents du royaume."
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
                className="flex items-center gap-2 border-b border-stone-800 px-2 py-3 text-left text-sm font-medium text-stone-400 transition hover:border-yellow-500/70 hover:text-white"
              >
                {item.icon} {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="relative z-20 bg-[#11110f] px-4 py-20">
        <div className="max-w-[1680px] mx-auto">
          <div className="mb-10 max-w-3xl sm:mb-14">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-yellow-400">La vie du royaume</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">Une place à prendre dans le royaume</h2>
          </div>

          <div className="grid grid-cols-1 gap-x-10 md:grid-cols-3 md:gap-8">
            <FeatureCard 
              icon={<FaMapMarkedAlt />} number="01"
              title="Explorer Renblood"
              description="Parcours les régions, découvre leurs villes et trouve ta place dans le royaume."
              delay={0.1}
            />
            <FeatureCard 
              icon={<FaUsers />} number="02"
              title="Faire vivre ta cité"
              description="Rejoins une communauté, participe à la vie de ta ville et aux décisions qui la façonnent."
              delay={0.2}
            />
            <FeatureCard 
              icon={<FaScroll />} number="03"
              title="Prendre part aux quêtes"
              description="Résous les quêtes du serveur et découvre les histoires qui se construisent au fil des sessions."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* --- LORE PREVIEW (Parallax) --- */}
      <section className="relative py-32 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center z-0 opacity-30"
          style={{ backgroundImage: "url('/accueil/carte-renblood-1154.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/10 to-gray-900 z-10" />
        
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">L'Histoire de Renblood</h2>
          <p className="mb-8 text-xl leading-relaxed text-stone-300">
            "Depuis l'aube des temps, les factions se déchirent pour le contrôle des ressources magiques. 
            Aujourd'hui, une nouvelle ère commence. Serez-vous le héros qui unifiera les peuples, 
            ou le conquérant qui les asservira ?"
          </p>
          <a 
            href="/histoire"
            className="inline-block rounded-full border-2 border-yellow-500 px-8 py-3 font-bold text-amber-300 transition-all duration-300 hover:bg-yellow-500 hover:text-gray-900"
          >
            Lire la suite
          </a>
        </div>
      </section>

          {selectedImage !== null && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-label={`Capture du royaume Renblood ${selectedImage + 1} agrandie`}
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative flex max-h-full w-full max-w-7xl flex-col items-center" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setSelectedImage(null)}
                  aria-label="Fermer l’image agrandie"
                  className="absolute -top-1 right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 sm:-top-5 sm:-right-5"
                >
                  <FaTimes aria-hidden="true" />
                </button>
                <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setSelectedImage((selectedImage + 7) % 8)}
                    aria-label="Afficher l’image précédente"
                    className="absolute left-1 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 sm:left-3 sm:h-12 sm:w-12"
                  >
                    <FaChevronLeft aria-hidden="true" />
                  </button>
                  <img
                    src={`/accueil/screen${selectedImage + 1}.png`}
                    alt={`Capture du royaume Renblood ${selectedImage + 1}`}
                    className="max-h-[78vh] max-w-full rounded-md object-contain shadow-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage((selectedImage + 1) % 8)}
                    aria-label="Afficher l’image suivante"
                    className="absolute right-1 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 sm:right-3 sm:h-12 sm:w-12"
                  >
                    <FaChevronRight aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-stone-300">Capture {selectedImage + 1} / 8 · Échap pour fermer</p>
              </div>
            </div>
          )}

      {/* --- CTA FINAL --- */}
      <section className="bg-gradient-to-b from-gray-900 to-black px-4 py-24 text-center">
        <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Prêt à écrire ta légende ?</h2>
        <p className="mx-auto mb-10 max-w-xl text-stone-400">
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
