import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import {
  FaBars,
  FaBookOpen,
  FaCompass,
  FaDiscord,
  FaGem,
  FaHome,
  FaMapMarkedAlt,
  FaNewspaper,
  FaScroll,
  FaTimes,
  FaUserAstronaut,
  FaUsers,
} from "react-icons/fa";

const testNavigation = [
  { id: "gate", label: "Porte", kicker: "Entree", icon: <FaHome />, type: "section" },
  { id: "signal", label: "Campagne", kicker: "Table", icon: <FaCompass />, type: "section" },
  { id: "hub", label: "Hub", kicker: "Actions", icon: <FaGem />, type: "section" },
  { id: "/map", label: "Carte", kicker: "Explorer", icon: <FaMapMarkedAlt />, type: "link" },
  { id: "/histoire", label: "Guide", kicker: "Lore", icon: <FaBookOpen />, type: "link" },
  { id: "/histoires/journal", label: "Journal", kicker: "Chroniques", icon: <FaNewspaper />, type: "link" },
  { id: "/players", label: "Joueurs", kicker: "Population", icon: <FaUsers />, type: "link" },
];

const signalLines = [
  "Commerce joueur contre joueur",
  "Villes, lois et familles",
  "Metiers et progression",
  "Quetes suivies en session",
  "Politique de royaume",
  "Exploration de la carte",
];

const acts = [
  {
    title: "Choisir une allegence",
    text: "Le joueur entre par une interface qui ressemble a une table de strategie: chaque choix ouvre une vraie page utile.",
    image: "/accueil/ville2.png",
    tone: "from-red-500/35",
  },
  {
    title: "Lire le territoire",
    text: "La carte devient un objet central, pas une simple image posee dans une section. Elle installe le monde des le premier ecran.",
    image: "/accueil/carte-renblood.png",
    tone: "from-cyan-400/30",
  },
  {
    title: "Entrer en chronique",
    text: "Le contenu narratif arrive comme des transmissions: journal, lore, joueurs et metiers restent accessibles sans casser l'immersion.",
    image: "/accueil/screen6.png",
    tone: "from-amber-400/30",
  },
];

function AnimatedRealmCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.45 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let raf = 0;
    let width = 0;
    let height = 0;
    let particles = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(70, Math.min(150, Math.floor((width * height) / 11500)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: (Math.sin(index * 91.7) * 0.5 + 0.5) * width,
        y: (Math.cos(index * 53.1) * 0.5 + 0.5) * height,
        vx: Math.sin(index * 12.17) * 0.34,
        vy: Math.cos(index * 7.93) * 0.24,
        r: 0.8 + ((index * 17) % 10) / 10,
        hue: index % 3,
      }));
    };

    const onPointerMove = (event) => {
      mouseRef.current = { x: event.clientX / width, y: event.clientY / height };
    };

    const draw = () => {
      frame += reduced ? 0.2 : 1;
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        width * mouseRef.current.x,
        height * mouseRef.current.y,
        0,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.78,
      );
      gradient.addColorStop(0, "rgba(120, 22, 28, 0.34)");
      gradient.addColorStop(0.35, "rgba(11, 54, 74, 0.22)");
      gradient.addColorStop(1, "rgba(7, 7, 8, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width * 0.5, height * 0.52);
      ctx.rotate(frame * 0.0009);
      for (let ring = 0; ring < 5; ring += 1) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 130 + ring * 92, 54 + ring * 39, ring * 0.38, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ring % 2 ? "221, 69, 83" : "90, 190, 205"}, ${0.09 + ring * 0.012})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      particles.forEach((p, index) => {
        p.x += p.vx + (mouseRef.current.x - 0.5) * 0.12;
        p.y += p.vy + (mouseRef.current.y - 0.5) * 0.08;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        for (let j = index + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 92) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(214, 168, 79, ${0.12 * (1 - dist / 92)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 0 ? "rgba(255, 220, 145, .82)" : p.hue === 1 ? "rgba(93, 218, 232, .62)" : "rgba(236, 80, 96, .58)";
        ctx.fill();
      });

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 h-screen w-screen" aria-hidden="true" />;
}

function RealmNavigator({ activeSection, isOpen, onClose, onJump, onOpen }) {
  const sections = testNavigation.filter((item) => item.type === "section");
  const links = testNavigation.filter((item) => item.type === "link");

  const handleSelect = (item) => {
    if (item.type === "section") {
      onJump(item.id);
      onClose();
      return;
    }
    window.location.href = item.id;
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1rem)] max-w-3xl -translate-x-1/2 md:bottom-auto md:left-auto md:right-5 md:top-24 md:w-auto md:max-w-none md:translate-x-0">
        <div className="flex items-center justify-between gap-2 rounded-[1.4rem] border border-white/12 bg-black/50 p-2 shadow-none shadow-black/45 backdrop-blur-2xl md:flex-col">
          <button
            type="button"
            onClick={onOpen}
            className="flex min-h-12 items-center gap-3 rounded-sm bg-amber-200 px-4 font-black text-[#130e08] transition hover:bg-white md:w-full md:justify-start"
            title="Ouvrir la navigation"
          >
            <FaBars />
            <span className="hidden sm:inline md:inline">Navigation</span>
          </button>
          <div className="flex flex-1 justify-end gap-1 md:grid md:w-full md:grid-cols-1">
            {sections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`group flex min-h-12 min-w-12 items-center justify-center rounded-sm px-3 transition md:justify-start md:gap-3 ${
                  activeSection === item.id
                    ? "bg-white text-[#130e08] shadow-none shadow-white/10"
                    : "text-stone-300 hover:bg-white/10 hover:text-white"
                }`}
                title={item.label}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden text-sm font-black uppercase tracking-widest md:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] bg-[#050506]/92 p-4 backdrop-blur-2xl md:p-8"
        >
          <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-none shadow-black/60">
            <div className="flex items-center justify-between border-b border-white/10 p-4 md:p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-200">command deck</p>
                <h2 className="mt-1 text-2xl font-black text-white md:text-4xl">Choisir une destination</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-sm border border-white/10 bg-white/5 text-white transition hover:bg-white/12"
                title="Fermer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-[1.1fr_.9fr] md:p-6">
              <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/35 p-5 md:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(214,168,79,.22),transparent_32%),radial-gradient(circle_at_72%_24%,rgba(59,190,205,.16),transparent_28%)]" />
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/15 md:h-96 md:w-96" />
                <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/15 md:h-64 md:w-64" />
                <div className="relative z-10 grid h-full content-center gap-3 sm:grid-cols-3">
                  {sections.map((item, index) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      onClick={() => handleSelect(item)}
                      className={`group min-h-40 rounded-[1.35rem] border p-5 text-left backdrop-blur-xl transition hover:-translate-y-1 ${
                        activeSection === item.id
                          ? "border-amber-200/55 bg-amber-200/16"
                          : "border-white/10 bg-black/35 hover:border-white/25 hover:bg-white/8"
                      }`}
                    >
                      <span className="text-3xl text-amber-200 transition group-hover:scale-110">{item.icon}</span>
                      <span className="mt-8 block text-xs font-black uppercase tracking-[0.24em] text-stone-400">{item.kicker}</span>
                      <span className="mt-1 block text-2xl font-black text-white">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid content-start gap-3">
                <p className="px-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-200">portes directes</p>
                {links.map((item, index) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => handleSelect(item)}
                    className="group flex min-h-20 items-center gap-4 rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-cyan-200/10"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-cyan-200/12 text-xl text-cyan-100">{item.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-black uppercase tracking-[0.22em] text-stone-400">{item.kicker}</span>
                      <span className="block text-xl font-black text-white">{item.label}</span>
                    </span>
                    <span className="text-amber-200 transition group-hover:translate-x-1">-&gt;</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

function HeroCompass({ onJump, onOpen }) {
  const compassItems = testNavigation.slice(0, 4);

  return (
    <div className="relative mx-auto aspect-square w-[min(86vw,560px)]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[5%] rounded-full border border-dashed border-amber-200/18"
      />
      <div className="absolute inset-[17%] rounded-full border border-cyan-200/12 shadow-[0_0_90px_rgba(34,211,238,.08)_inset]" />
      <div className="absolute inset-[31%] rounded-full border border-red-200/12" />
      <button
        type="button"
        onClick={onOpen}
        className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-amber-200/35 bg-black/50 text-center shadow-none shadow-red-950/40 backdrop-blur-2xl transition hover:scale-105 hover:bg-amber-200/10 md:h-48 md:w-48"
      >
        <img src="/accueil/logo.png" alt="Renblood" className="w-28 md:w-36" />
        <span className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-200">ouvrir carte</span>
      </button>
      {compassItems.map((item, index) => {
        const angle = -90 + index * 90;
        const radius = 42;
        const left = 50 + Math.cos((angle * Math.PI) / 180) * radius;
        const top = 50 + Math.sin((angle * Math.PI) / 180) * radius;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.type === "section" ? onJump(item.id) : (window.location.href = item.id))}
            className="group absolute flex min-h-20 min-w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[1.4rem] border border-white/12 bg-white/[0.065] p-3 text-white shadow-xl shadow-black/30 backdrop-blur-xl transition hover:-translate-y-[54%] hover:border-amber-200/50 hover:bg-amber-200/14"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <span className="text-xl text-amber-200">{item.icon}</span>
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SignalTicker() {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-black/35 py-3 backdrop-blur">
      <motion.div
        className="flex w-max gap-8 text-sm font-black uppercase tracking-[0.24em] text-stone-300"
        animate={{ x: [0, -720] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        {[...signalLines, ...signalLines, ...signalLines].map((line, index) => (
          <span key={`${line}-${index}`} className="flex items-center gap-8">
            {line}
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_16px_rgba(248,113,113,.8)]" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function HomeTest() {
  const [activeAct, setActiveAct] = useState(0);
  const [activeSection, setActiveSection] = useState("gate");
  const [navOpen, setNavOpen] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 70, damping: 22 });
  const smoothY = useSpring(y, { stiffness: 70, damping: 22 });
  const { scrollYProgress } = useScroll();
  const veil = useTransform(scrollYProgress, [0, 0.45], [0, 0.55]);

  const portals = useMemo(
    () => [
      { href: "/histoire", label: "Guide", icon: <FaBookOpen /> },
      { href: "/map", label: "Carte", icon: <FaMapMarkedAlt /> },
      { href: "/histoires/journal", label: "Journal", icon: <FaScroll /> },
      { href: "/auth", label: "Connexion", icon: <FaUserAstronaut /> },
    ],
    [],
  );

  useEffect(() => {
    document.title = "Renblood - Prototype vivant";
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] },
    );

    ["gate", "signal", "hub"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main
      className="relative -mt-16 min-h-screen overflow-hidden bg-[#070708] text-stone-100"
      onPointerMove={(event) => {
        x.set((event.clientX / window.innerWidth - 0.5) * 28);
        y.set((event.clientY / window.innerHeight - 0.5) * 28);
      }}
    >
      <AnimatedRealmCanvas />
      <motion.div className="pointer-events-none fixed inset-0 z-[1] bg-black" style={{ opacity: veil }} />
      <RealmNavigator
        activeSection={activeSection}
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        onJump={jump}
        onOpen={() => setNavOpen(true)}
      />

      <section id="gate" className="relative z-10 min-h-screen px-4 pb-24 pt-24 md:px-8 md:pb-10">
        <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85 }}
            className="relative"
          >
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-red-300/20 bg-red-950/25 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-red-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,.9)]" />
              prototype vivant
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.86] text-white md:text-7xl lg:text-8xl editorial-title">
              Renblood comme une interface de royaume.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-300 md:text-xl">
              Plus une page d'accueil classique: une porte interactive, un fond vivant, une navigation en command deck et une narration qui se deploie comme une carte de campagne.
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {portals.map((portal) => (
                <a
                  key={portal.href}
                  href={portal.href}
                  className="group flex min-h-24 flex-col justify-between rounded-sm border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:border-amber-200/45 hover:bg-white/[0.09]"
                >
                  <span className="text-xl text-amber-200 transition group-hover:scale-110">{portal.icon}</span>
                  <span className="text-sm font-black uppercase tracking-widest text-white">{portal.label}</span>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div style={{ x: smoothX, y: smoothY }} className="relative">
            <HeroCompass onJump={jump} onOpen={() => setNavOpen(true)} />
          </motion.div>
        </div>
      </section>

      <div className="relative z-20">
        <SignalTicker />
      </div>

      <section id="signal" className="relative z-10 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-cyan-200">table de campagne</p>
              <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">Le contenu se pilote, il ne se consomme pas seulement.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-stone-300 lg:justify-self-end">
              Clique une transmission: l'image, le texte et l'ambiance changent instantanement. L'objectif est de sentir que le site est un objet vivant du serveur.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <div className="grid gap-3">
              {acts.map((act, index) => (
                <button
                  key={act.title}
                  type="button"
                  onClick={() => setActiveAct(index)}
                  className={`relative overflow-hidden rounded-sm border p-5 text-left transition ${
                    activeAct === index
                      ? "border-amber-200/50 bg-amber-200/12 shadow-none shadow-amber-950/20"
                      : "border-white/10 bg-white/[0.045] hover:border-white/25 hover:bg-white/[0.075]"
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-[0.26em] text-stone-400">0{index + 1}</span>
                  <h3 className="mt-2 text-2xl font-black text-white">{act.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-300">{act.text}</p>
                </button>
              ))}
            </div>

            <motion.div
              key={activeAct}
              initial={{ opacity: 0, scale: 0.96, rotateX: 7 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.55 }}
              className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-none shadow-black/40"
            >
              <img src={acts[activeAct].image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-br ${acts[activeAct].tone} via-black/20 to-black/85`} />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:46px_46px] opacity-30" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <div className="max-w-2xl rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-xl">
                  <div className="mb-3 flex items-center gap-3 text-amber-200">
                    <FaGem />
                    <span className="text-xs font-black uppercase tracking-[0.26em]">transmission active</span>
                  </div>
                  <h3 className="text-4xl font-black text-white md:text-5xl">{acts[activeAct].title}</h3>
                  <p className="mt-4 text-lg leading-8 text-stone-200">{acts[activeAct].text}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="hub" className="relative z-10 px-4 pb-28 pt-8 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[1.2fr_.8fr]">
          <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/35">
            <img src="/accueil/screen9.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-transparent" />
            <div className="relative z-10 flex min-h-[460px] max-w-xl flex-col justify-end p-7 md:p-10">
              <FaCompass className="mb-5 text-4xl text-cyan-200" />
              <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">Une page qui peut devenir un vrai hub.</h2>
              <p className="mt-5 text-lg leading-8 text-stone-300">
                On peut ensuite brancher les vraies donnees: prochaine session, dernier journal, joueurs connectes, prix du marche ou quetes disponibles.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <a href="https://discord.gg/uwNy5tM8jU" target="_blank" rel="noopener noreferrer" className="flex min-h-40 flex-col justify-between rounded-[2rem] border border-red-300/20 bg-red-500/10 p-6 transition hover:-translate-y-1 hover:bg-red-500/16">
              <FaDiscord className="text-3xl text-red-100" />
              <span className="text-3xl font-black text-white">Rejoindre le Discord</span>
            </a>
            <a href="/histoire" className="flex min-h-40 flex-col justify-between rounded-[2rem] border border-cyan-200/20 bg-cyan-500/10 p-6 transition hover:-translate-y-1 hover:bg-cyan-500/16">
              <FaScroll className="text-3xl text-cyan-100" />
              <span className="text-3xl font-black text-white">Entrer dans le guide</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}