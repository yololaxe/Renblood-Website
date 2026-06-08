import familles from "./famille";
import guildes from "./guildes";
import lois from "./lois";
import titres from "./titre";
import politique from "./politique";
import armee from "./armee";
import { categories, specials } from "./metiers";
import comtes from "./comtes";

const familyMembers = (node, familyKey, familyName) => {
  if (!node) return [];
  return [
    {
      label: node.keyName || node.name,
      description: `Membre de la famille ${familyName}`,
      path: `/histoires/arbre/${familyKey}`,
      type: "Famille",
    },
    ...(node.children || []).flatMap(child => familyMembers(child, familyKey, familyName)),
  ];
};

const familyResults = Object.entries(familles).flatMap(([key, family]) => [
  {
    label: `Famille ${family.nom}`,
    description: family.description,
    path: `/histoires/arbre/${key}`,
    type: "Famille",
  },
  ...familyMembers(family.data, key, family.nom),
]);

const guildResults = guildes.map(guild => ({
  label: guild.name,
  description: `${guild.leader} · ${guild.location}`,
  path: "/histoires/guildes",
  type: "Guilde",
}));

const jobResults = [...categories.flatMap(category => category.jobs), ...specials].map(job => ({
  label: job.name,
  description: job.description,
  path: "/histoires/metiers",
  type: "Métier",
}));

const titleResults = titres.map(title => ({
  label: title.titre,
  description: title.description,
  path: "/histoires/titres",
  type: "Titre",
}));

const politicalResults = politique.data.map(role => ({
  label: role.titre,
  description: role.role,
  path: "/histoires/politique",
  type: "Politique",
}));

const lawResults = lois.flatMap(section => [
  {
    label: section.titre,
    description: "Section des lois du royaume",
    path: "/histoires/lois",
    type: "Loi",
  },
  ...section.articles.map(article => ({
    label: `${section.titre} · ${article.titre}`,
    description: article.contenu.join(" "),
    path: "/histoires/lois",
    type: "Loi",
  })),
]);

const armyResults = Object.entries(armee)
  .filter(([key, values]) => key.startsWith("Armée") && Array.isArray(values))
  .flatMap(([armyName, ranks]) => ranks.filter(Boolean).map(rank => ({
    label: rank,
    description: armyName,
    path: "/histoires/armee",
    type: "Armée",
  })));

const locationResults = Object.entries(comtes).flatMap(([county, cities]) => [
  {
    label: `Comté de ${county}`,
    description: `${cities.length} lieux répertoriés`,
    path: "/map",
    type: "Lieu",
  },
  ...cities.map(city => ({
    label: city.ville,
    description: `${city.type} · ${county} · ${city.chef || "Chef inconnu"}`,
    path: "/map",
    type: "Lieu",
  })),
]);

export const staticContentResults = [
  {
    label: "Zeubillage n'est plus : vive Shaleton !",
    description: "Edition speciale du Conseil de l'an 336, par Paul Mortadelle",
    path: "/histoires/journal",
    type: "Journal",
  },
  ...familyResults,
  ...guildResults,
  ...jobResults,
  ...titleResults,
  ...politicalResults,
  ...lawResults,
  ...armyResults,
  ...locationResults,
];
