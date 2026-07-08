import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaBalanceScale,
  FaBook,
  FaBookOpen,
  FaChessRook,
  FaFileContract,
  FaHammer,
  FaLandmark,
  FaMapMarkedAlt,
  FaMedal,
  FaNewspaper,
  FaQuestionCircle,
  FaSearch,
  FaShieldAlt,
  FaStore,
  FaTasks,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";

const GlobalSearch = lazy(() => import("../components/GlobalSearch"));

const guideGroups = [
  {
    title: "Je débute",
    desc: "Les premières pages à ouvrir avant de franchir les portes du royaume.",
    icon: <FaQuestionCircle />,
    tone: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    links: [
      { to: "/histoires/lois", label: "Règles de base", desc: "Lois, sanctions et cadre RP." },
      { to: "/quests", label: "Premières quêtes", desc: "Objectifs disponibles et progression." },
      { to: "/histoires/metiers", label: "Choisir un métier", desc: "Activités, XP et spécialités." },
      { href: "https://discord.gg/uwNy5tM8jU", label: "Discord", desc: "Rejoindre la communauté." },
    ],
  },
  {
    title: "Mon personnage",
    desc: "Fiche, progression, titres et capacités réunis comme dans un registre de cité.",
    icon: <FaUserTie />,
    tone: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    links: [
      { to: "/character", label: "Personnage", desc: "Stats, argent, traits, actions et licences." },
      { to: "/talents", label: "Talents", desc: "Arbres de talents et spécialisations." },
      { to: "/histoires/metiers", label: "Métiers", desc: "Métiers disponibles et progression." },
      { to: "/histoires/titres", label: "Titres", desc: "Rangs, distinctions et hiérarchie." },
    ],
  },
  {
    title: "Le monde",
    desc: "Territoires, lignées, pouvoirs et armées qui façonnent Renblood.",
    icon: <FaMapMarkedAlt />,
    tone: "text-green-400 border-green-500/30 bg-green-500/10",
    links: [
      { to: "/map", label: "Carte", desc: "Villes, comtés et territoires." },
      { to: "/histoires/familles", label: "Familles", desc: "Lignées, alliances et arbres." },
      { to: "/histoires/politique", label: "Politique", desc: "Pouvoirs, responsabilités et gouvernance." },
      { to: "/histoires/armee", label: "Armée", desc: "Forces militaires et défense." },
    ],
  },
  {
    title: "Règles importantes",
    desc: "À consulter avant une décision risquée, marchande, judiciaire ou politique.",
    icon: <FaBalanceScale />,
    tone: "text-red-300 border-red-500/30 bg-red-500/10",
    links: [
      { to: "/histoires/lois", label: "Lois", desc: "Infractions, justice et sanctions." },
      { to: "/market-prices", label: "Prix des marchés", desc: "Prix publics pratiqués dans les villes." },
      { to: "/histoires/metiers", label: "Économie et métiers", desc: "Gagner de l'argent et produire." },
      { to: "/histoires/titres", label: "Rangs et droits", desc: "Statuts, titres et permissions RP." },
    ],
  },
  {
    title: "À qui parler ?",
    desc: "Retrouver les figures utiles, les guildes et les autorités du royaume.",
    icon: <FaUsers />,
    tone: "text-purple-300 border-purple-500/30 bg-purple-500/10",
    links: [
      { to: "/histoires/npcs", label: "PNJ", desc: "Personnages rencontrés et lieux associés." },
      { to: "/histoires/guildes", label: "Guildes", desc: "Organisations, chefs et objectifs." },
      { to: "/players", label: "Joueurs", desc: "Citoyens et personnages du serveur." },
      { to: "/histoires/politique", label: "Autorités", desc: "Rôles politiques et responsables." },
    ],
  },
  {
    title: "Actualités",
    desc: "Journal, événements, annonces et changements récents consignés par écrit.",
    icon: <FaNewspaper />,
    tone: "text-stone-200 border-stone-500/30 bg-stone-500/10",
    links: [
      { to: "/histoires/journal", label: "Journal", desc: "Nouvelles, événements et patch notes." },
      { to: "/histoires/livres", label: "Livres", desc: "Chroniques, récits et archives." },
      { to: "/histoires/guildes", label: "Vie des guildes", desc: "Organisations et mouvements." },
      { to: "/histoires/familles", label: "Familles nobles", desc: "Alliances et changements d'influence." },
    ],
  },
];

const archiveLinks = [
  { to: "/histoires/livres", icon: <FaBook />, label: "Les Livres", desc: "Chroniques et légendes anciennes." },
  { to: "/histoires/familles", icon: <FaLandmark />, label: "Les Familles", desc: "Lignées nobles et alliances." },
  { to: "/histoires/lois", icon: <FaBalanceScale />, label: "Les Lois", desc: "Code pénal et règles de vie." },
  { to: "/histoires/politique", icon: <FaChessRook />, label: "La Politique", desc: "Intrigues et gouvernance." },
  { to: "/histoires/armee", icon: <FaShieldAlt />, label: "L'Armée", desc: "Forces militaires et défense." },
  { to: "/histoires/titres", icon: <FaMedal />, label: "Les Titres", desc: "Rangs et distinctions." },
  { to: "/histoires/guildes", icon: <FaUsers />, label: "Les Guildes", desc: "Organisations et confréries." },
  { to: "/histoires/metiers", icon: <FaHammer />, label: "Les Métiers", desc: "Savoir-faire et artisanat." },
  { to: "/histoires/npcs", icon: <FaUserTie />, label: "Les PNJ", desc: "Habitants et figures locales." },
  { to: "/histoires/journal", icon: <FaNewspaper />, label: "Le Journal", desc: "Nouvelles et chroniques de Shaleton." },
  { to: "/market-prices", icon: <FaStore />, label: "Prix des marchés", desc: "Prix publics pratiqués dans les villes." },
];

const quickTools = [
  { to: "/quests", icon: <FaTasks />, label: "Quêtes" },
  { to: "/map", icon: <FaMapMarkedAlt />, label: "Carte" },
  { to: "/character", icon: <FaFileContract />, label: "Mon personnage" },
  { to: "/histoires/journal", icon: <FaNewspaper />, label: "Journal" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function SmartLink({ link, children, className }) {
  if (link.href) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={link.to} className={className}>
      {children}
    </Link>
  );
}

export default function Information() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="relative flex min-h-[46vh] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: "url('/accueil/carte-renblood.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/45 via-gray-900/82 to-gray-900" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-yellow-400"
          >
            Archives royales
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4 text-4xl font-extrabold text-white drop-shadow-lg md:text-6xl"
          >
            Guide de Renblood
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mx-auto mb-7 max-w-2xl text-lg font-light text-gray-300 md:text-xl"
          >
            Ouvre le bon registre, trouve la bonne règle, puis retourne jouer.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            onClick={() => setSearchOpen(true)}
            className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-xl border border-yellow-500/40 bg-gray-950/80 px-5 py-4 text-left text-gray-300 shadow-2xl backdrop-blur-sm transition hover:border-yellow-400 hover:bg-gray-900"
          >
            <FaSearch className="text-yellow-400" />
            <span className="flex-1">Rechercher une info, un métier, une loi, un joueur...</span>
            <span className="hidden rounded border border-gray-600 px-2 py-1 text-xs text-gray-500 sm:inline">Ctrl K</span>
          </motion.button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20">
        <div className="-mt-7 mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickTools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="relative z-20 flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-200 shadow-lg transition hover:border-yellow-500 hover:text-white"
            >
              {tool.icon} {tool.label}
            </Link>
          ))}
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {guideGroups.map((group) => (
            <motion.section
              key={group.title}
              variants={item}
              className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800/80 p-6 shadow-lg transition hover:-translate-y-1 hover:border-yellow-500/40"
            >
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
              <div className="mb-5 flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-xl transition group-hover:scale-105 ${group.tone}`}>
                  {group.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{group.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400">{group.desc}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {group.links.map((link) => (
                  <SmartLink
                    key={`${group.title}-${link.label}`}
                    link={link}
                    className="rounded-lg border border-gray-700 bg-gray-900/70 p-4 transition hover:border-gray-500 hover:bg-gray-900"
                  >
                    <span className="block font-semibold text-white">{link.label}</span>
                    <span className="mt-1 block text-sm text-gray-400">{link.desc}</span>
                  </SmartLink>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>

        <section className="mt-16">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">Rayonnages complets</p>
              <h2 className="text-3xl font-bold text-white">Toutes les informations</h2>
            </div>
            <p className="max-w-2xl text-sm text-gray-400">
              Les registres ci-dessus guident les joueurs. Cette section garde toutes les entrées historiques actuelles.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {archiveLinks.map(({ to, icon, label, desc }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-lg border border-gray-700 bg-gray-800 p-5 transition hover:-translate-y-1 hover:border-yellow-500/70 hover:bg-gray-800/90"
              >
                <div className="mb-3 text-2xl text-yellow-400 transition group-hover:scale-110">{icon}</div>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-300">{label}</h3>
                <p className="mt-1 text-sm text-gray-400">{desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {searchOpen && (
        <Suspense fallback={null}>
          <GlobalSearch open onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
