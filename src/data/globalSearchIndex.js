import { wikiSearchResults, slug } from "../services/wiki.mjs";
import lois from "./lois";
import titres from "./titre";
import armee from "./armee";
import { categories, specials } from "./metiers";
const jobs = [...categories.flatMap(c => c.jobs), ...specials].map(job => ({
  label: job.name,
  description: job.description,
  path: `/histoires/metiers#${job.id}`,
  type: "Métier",
  keywords: "travail xp économie produire craft"
}));
const titles = titres.map(t => ({
  label: t.titre,
  description: t.description,
  path: `/histoires/titres#${slug(t.titre)}`,
  type: "Règle",
  keywords: "rang droit condition noblesse"
}));
const laws = lois.flatMap(l => [{
  label: l.titre,
  description: "Lois du royaume",
  path: `/histoires/lois#${slug(l.titre)}`,
  type: "Règle"
}, ...l.articles.map((a, i) => ({
  label: `${l.titre} · ${a.titre}`,
  description: a.contenu.join(" "),
  path: `/histoires/lois#${slug(l.titre)}-article-${i + 1}`,
  type: "Règle"
}))]);
const army = Object.entries(armee).filter(([, v]) => Array.isArray(v)).flatMap(([name, ranks]) => ranks.filter(Boolean).map(rank => ({
  label: rank,
  description: name,
  path: "/histoires/armee",
  type: "Règle",
  keywords: "grade militaire armée"
})));
export const getStaticContentResults = () => [...wikiSearchResults, ...jobs, ...titles, ...laws, ...army, {
  label: "Zeubillage n'est plus : vive Shaleton !",
  description: "Journal du Conseil, édition de l’an 336",
  path: "/histoires/journal",
  type: "Journal",
  keywords: "actualité nouvelle événement patch"
}];
