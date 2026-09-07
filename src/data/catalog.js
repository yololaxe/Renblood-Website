import guildesData from "./guildes";
import nodes from "./nodes";
import { categories, specials } from "./metiers";

const jobCatalog = [...categories.flatMap((category) => category.jobs), ...specials];

const catalog = {
  jobs: jobCatalog,
  guildes: Array.isArray(guildesData) ? guildesData : guildesData.guildes || [],
  guildRoles: guildesData.globalRoles || [],
  nodes,
};

const catalogByType = {
  jobs: catalog.jobs,
  guildes: catalog.guildes,
  guildRoles: catalog.guildRoles,
  nodes: catalog.nodes,
};

export const getStaticCatalog = (type) => {
  if (!catalogByType[type]) return [];
  return catalogByType[type];
};

export const getStaticJobs = () => catalog.jobs;
export const getStaticGuilds = () => catalog.guildes;
export const getStaticNodes = () => catalog.nodes;

export default catalog;
