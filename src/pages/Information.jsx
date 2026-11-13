import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaBalanceScale, FaBook, FaBookOpen, FaChessRook, FaFileContract, FaHammer, FaLandmark, FaMapMarkedAlt, FaMedal, FaNewspaper, FaSearch, FaShieldAlt, FaStore, FaTasks, FaUserTie, FaUsers } from "react-icons/fa";
const GlobalSearch = lazy(() => import("../components/GlobalSearch"));
const guideGroups = [{
  title: "Je débute",
  desc: "Les premières étapes pour prendre tes repères.",
  links: [{
    to: "/histoires/lois",
    label: "Règles de base",
    desc: "Lois, sanctions et cadre RP."
  }, {
    to: "/quests",
    label: "Premières quêtes",
    desc: "Objectifs et progression."
  }, {
    to: "/histoires/metiers",
    label: "Choisir un métier",
    desc: "Activités, XP et spécialités."
  }, {
    href: "https://discord.gg/uwNy5tM8jU",
    label: "Discord",
    desc: "Rejoindre la communauté."
  }]
}, {
  title: "Mon personnage",
  desc: "Fiche, progression et capacités.",
  links: [{
    to: "/character",
    label: "Personnage",
    desc: "Stats, argent, traits et licences."
  }, {
    to: "/talents",
    label: "Talents",
    desc: "Arbres et spécialisations."
  }, {
    to: "/histoires/metiers",
    label: "Métiers",
    desc: "Métiers disponibles et progression."
  }, {
    to: "/histoires/titres",
    label: "Titres",
    desc: "Rangs et distinctions."
  }]
}, {
  title: "Le monde",
  desc: "Territoires, lignées et pouvoirs.",
  links: [{
    to: "/histoires/chronologie",
    label: "Chronologie",
    desc: "Les âges, événements et parcours du royaume."
  }, {
    to: "/histoires/reperes",
    label: "Mes repères",
    desc: "Mes fiches, passages et notes personnelles."
  }, {
    to: "/map",
    label: "Carte",
    desc: "Villes, comtés et territoires."
  }, {
    to: "/histoires/personnages",
    label: "Registre des personnages",
    desc: "Personnes, fonctions et liens familiaux."
  }, {
    to: "/histoires/familles",
    label: "Familles",
    desc: "Lignées, alliances et arbres."
  }, {
    to: "/histoires/politique",
    label: "Politique",
    desc: "Pouvoirs et gouvernance."
  }, {
    to: "/histoires/armee",
    label: "Armée",
    desc: "Forces militaires et défense."
  }]
}, {
  title: "Règles importantes",
  desc: "Les repères utiles avant d’agir.",
  links: [{
    to: "/histoires/lois",
    label: "Lois",
    desc: "Infractions, justice et sanctions."
  }, {
    to: "/market-prices",
    label: "Prix des marchés",
    desc: "Prix pratiqués dans les villes."
  }, {
    to: "/histoires/metiers",
    label: "Économie et métiers",
    desc: "Gagner de l’argent et produire."
  }, {
    to: "/histoires/titres",
    label: "Rangs et droits",
    desc: "Statuts et permissions RP."
  }]
}, {
  title: "À qui parler ?",
  desc: "Les figures, guildes et autorités du royaume.",
  links: [{
    to: "/histoires/npcs",
    label: "PNJ",
    desc: "Personnages et lieux associés."
  }, {
    to: "/histoires/guildes",
    label: "Guildes",
    desc: "Organisations et objectifs."
  }, {
    to: "/players",
    label: "Joueurs",
    desc: "Citoyens et personnages."
  }, {
    to: "/histoires/politique",
    label: "Autorités",
    desc: "Responsables et rôles politiques."
  }]
}, {
  title: "Actualités",
  desc: "Les événements et changements du royaume.",
  links: [{
    to: "/histoires/journal",
    label: "Journal",
    desc: "Nouvelles, événements et mises à jour."
  }, {
    to: "/histoires/livres",
    label: "Livres",
    desc: "Chroniques, récits et archives."
  }, {
    to: "/histoires/guildes",
    label: "Vie des guildes",
    desc: "Organisations et mouvements."
  }, {
    to: "/histoires/familles",
    label: "Familles et notables",
    desc: "Grandes maisons et familles secondaires."
  }]
}];
const archiveLinks = [{
  to: "/histoires/personnages",
  icon: <FaUsers />,
  label: "Les Personnages",
  desc: "Fiches, conjoints, fonctions et généalogies."
}, {
  to: "/histoires/livres",
  icon: <FaBook />,
  label: "Les Livres",
  desc: "Chroniques et légendes anciennes."
}, {
  to: "/histoires/familles",
  icon: <FaLandmark />,
  label: "Les Familles",
  desc: "Lignées nobles et alliances."
}, {
  to: "/histoires/lois",
  icon: <FaBalanceScale />,
  label: "Les Lois",
  desc: "Code pénal et règles de vie."
}, {
  to: "/histoires/politique",
  icon: <FaChessRook />,
  label: "La Politique",
  desc: "Intrigues et gouvernance."
}, {
  to: "/histoires/armee",
  icon: <FaShieldAlt />,
  label: "L’Armée",
  desc: "Forces militaires et défense."
}, {
  to: "/histoires/titres",
  icon: <FaMedal />,
  label: "Les Titres",
  desc: "Rangs et distinctions."
}, {
  to: "/histoires/guildes",
  icon: <FaUsers />,
  label: "Les Guildes",
  desc: "Organisations et confréries."
}, {
  to: "/histoires/metiers",
  icon: <FaHammer />,
  label: "Les Métiers",
  desc: "Savoir-faire et artisanat."
}, {
  to: "/histoires/npcs",
  icon: <FaUserTie />,
  label: "Les PNJ",
  desc: "Habitants et figures locales."
}, {
  to: "/histoires/journal",
  icon: <FaNewspaper />,
  label: "Le Journal",
  desc: "Nouvelles et chroniques."
}, {
  to: "/market-prices",
  icon: <FaStore />,
  label: "Prix des marchés",
  desc: "Prix publics des villes."
}];
const quickTools = [{
  to: "/quests",
  icon: <FaTasks />,
  label: "Quêtes"
}, {
  to: "/map",
  icon: <FaMapMarkedAlt />,
  label: "Carte"
}, {
  to: "/character",
  icon: <FaFileContract />,
  label: "Mon personnage"
}, {
  to: "/histoires/journal",
  icon: <FaNewspaper />,
  label: "Journal"
}];
function GuideLink({
  link
}) {
  const className = "group flex min-h-16 items-center justify-between gap-4 border-b border-stone-700/70 py-3 transition-colors hover:border-amber-300/70";
  const content = <>
      <span className="min-w-0">
        <span className="block font-semibold text-stone-100 transition-colors group-hover:text-amber-200">{link.label}</span>
        <span className="mt-0.5 block text-sm leading-snug text-stone-400">{link.desc}</span>
      </span>
      <FaArrowRight aria-hidden="true" className="shrink-0 text-sm text-stone-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-300" />
    </>;
  if (link.href) {
    return <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
  }
  return <Link to={link.to} className={className}>{content}</Link>;
}
export default function Information() {
  const [searchOpen, setSearchOpen] = useState(false);
  return <main className="min-h-screen overflow-x-hidden bg-[#11110f] text-stone-100">
      <header className="border-b border-stone-700/70">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <h1 className="font-semibold text-stone-50">Guide</h1>
          <button type="button" onClick={() => setSearchOpen(true)} className="flex min-h-11 w-full items-center gap-3 border border-stone-600 px-4 py-2 text-left text-sm text-stone-300 transition-colors hover:border-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 sm:w-auto sm:min-w-80" aria-label="Rechercher dans le guide">
            <FaSearch aria-hidden="true" className="shrink-0 text-amber-300" />
            <span className="min-w-0 flex-1 truncate">Une règle, un métier, un joueur…</span>
            <span className="hidden shrink-0 text-xs text-stone-500 sm:inline">Ctrl K</span>
          </button>
        </div>
      </header>

      <nav aria-label="Accès rapides" className="border-b border-stone-700/70 bg-[#171715]">
        <div className="mx-auto grid w-full max-w-[1680px] grid-cols-2 px-5 sm:px-8 md:grid-cols-4 lg:px-12">
          {quickTools.map((tool, index) => <Link key={tool.to} to={tool.to} className="group flex min-h-16 items-center gap-3 border-b border-r border-stone-700/70 px-3 py-3 transition-colors hover:bg-white/[0.035] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 sm:px-5 md:border-b-0">
              <span className="text-xs tabular-nums text-stone-500">0{index + 1}</span>
              <span className="text-amber-300">{tool.icon}</span>
              <span className="text-sm font-semibold text-stone-200 group-hover:text-white sm:text-base">{tool.label}</span>
              <FaArrowRight aria-hidden="true" className="ml-auto hidden text-xs text-stone-500 transition-transform group-hover:translate-x-1 sm:block" />
            </Link>)}
        </div>
      </nav>

      <section id="aide-economie" className="mx-auto w-full max-w-[1680px] scroll-mt-24 px-5 py-10 sm:px-8 lg:px-12" aria-labelledby="aide-economie-title">
        <h2 id="aide-economie-title" className="text-2xl font-bold text-stone-100">Premiers gestes en jeu</h2>
        <div className="mt-5 grid gap-x-10 md:grid-cols-2">
          {[["Commencer avec Nagaki", "Dans Minecraft, utilise /mc tuto start. La même commande reprend l’étape en cours. /mc tuto guide active ou masque le guidage."], ["Ouvrir un comptoir", "Maj + clic droit sur ton comptoir. Dans Stock, sélectionne les piles de ton inventaire, puis envoie-les. Dans Prix, active la vente et applique ton tarif."], ["Faire un échange marchand", "Lis les objets et quantités demandés, puis dépose-les dans les cases voisines. Le paiement est remis en pièces après validation. Survole les boutons pour lire leur aide. Annuler abandonne l’offre ; Échap ferme la fenêtre pour y revenir plus tard. Attends le résultat du règlement avant une autre action."], ["Servir à l’auberge", "Clique sur le client pour lire sa commande. Prends le bon plat en main, puis fais Maj + clic droit sur le client. /ms auberge status <nom> indique l’état et le prochain essai de ton auberge."], ["Une case de stock est réservée", "Sélectionne la case dans Stock pour voir les objets disponibles, réservés ou en cours de dépôt. Le bouton Copier le reçu permet de transmettre sa référence à l’équipe. Choisis une autre case pendant la vérification."], ["Pourquoi une case n’accepte plus d’objets ?", "Chaque case respecte la taille des piles de l’objet : un équipement à l’unité, certains objets par 16, les autres jusqu’à 64. Les objets réservés ou en cours de dépôt occupent aussi de la place. Choisis une autre case si la première est pleine."], ["Un coffre est resté en exploration", "Garde libre le coffre d’origine avant le retour. Si le transfert est impossible, le coffre du camp est conservé : contacte l’équipe pour récupérer son contenu. /ms exploration tuto rappelle ces repères dans le jeu."], ["Retrouver un reçu", "Ouvre Mes finances sur le site et cherche l’opération. Si le jeu demande une vérification, garde la référence du reçu pour la transmettre à l’équipe."]].map(([title, description]) => <details key={title} className="border-b border-stone-700 py-4 text-stone-200">
            <summary className="cursor-pointer font-medium">{title}</summary>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-stone-400">{description}</p>
          </details>)}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1680px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20" aria-labelledby="guide-sections-title">
        <div className="mb-8 flex flex-col gap-3 border-b border-stone-700 pb-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Par où commencer</p>
            <h2 id="guide-sections-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Les registres essentiels</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-stone-400 sm:text-right">Six portes d’entrée pour trouver rapidement l’information utile à ta prochaine session.</p>
        </div>

        <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2 xl:grid-cols-3 xl:gap-x-12">
          {guideGroups.map((group, index) => <motion.section key={group.title} initial={{
          opacity: 0,
          y: 14
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-40px"
        }} transition={{
          duration: 0.35,
          delay: index % 3 * 0.04
        }} className="border-t border-stone-500/80 py-5 sm:py-7" aria-labelledby={`guide-group-${index}`}>
              <div className="mb-3 flex items-start gap-4">
                <span className="pt-1 text-sm font-semibold tabular-nums text-amber-300">0{index + 1}</span>
                <div>
                  <h3 id={`guide-group-${index}`} className="text-2xl font-bold tracking-tight text-stone-50">{group.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-400">{group.desc}</p>
                </div>
              </div>
              <div className="ml-9">
                {group.links.map(link => <GuideLink key={`${group.title}-${link.label}`} link={link} />)}
              </div>
            </motion.section>)}
        </div>
      </section>

      <section className="border-y border-stone-700/70 bg-[#171715]" aria-labelledby="archive-title">
        <div className="mx-auto w-full max-w-[1680px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="mb-8 grid gap-3 border-b border-stone-700 pb-5 md:grid-cols-[1fr_auto] md:items-end sm:mb-10">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Index complet · {archiveLinks.length} rubriques</p>
              <h2 id="archive-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Toutes les archives</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-400 md:text-right">Explore les chroniques, les institutions et les ressources pratiques du royaume.</p>
          </div>
          <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-14">
            {archiveLinks.map(({
            to,
            icon,
            label,
            desc
          }, index) => <Link key={to} to={to} className="group flex min-h-20 items-center gap-4 border-b border-stone-700/70 py-4 transition-colors hover:border-amber-300/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
                <span className="w-7 shrink-0 text-xs tabular-nums text-stone-500">{String(index + 1).padStart(2, "0")}</span>
                <span className="shrink-0 text-lg text-amber-300">{icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-stone-100 group-hover:text-amber-200">{label}</span>
                  <span className="mt-0.5 block text-sm text-stone-400">{desc}</span>
                </span>
                <FaArrowRight aria-hidden="true" className="shrink-0 text-sm text-stone-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-300" />
              </Link>)}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-5 py-8 text-sm text-stone-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span className="flex items-center gap-2 text-stone-200"><FaBookOpen className="text-amber-300" /> Le guide de Renblood</span>
        <span>Besoin d’un autre repère ? Utilise la recherche globale avec Ctrl K.</span>
      </footer>

      {searchOpen && <Suspense fallback={null}>
          <GlobalSearch open onClose={() => setSearchOpen(false)} />
        </Suspense>}
    </main>;
}
