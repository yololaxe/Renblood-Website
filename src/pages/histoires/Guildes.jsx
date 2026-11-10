import { Link, useParams, useSearchParams } from 'react-router-dom';
import { registry, guildsById, findLocation, guildPath } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiNav, WikiMissing } from '../../components/wiki/WikiShell';
import { WikiLink, PersonLink, LinkedText } from '../../components/wiki/WikiLink';
const summaries = {
  'guilde-des-artisans': 'Les savoir-faire, la fabrication et les grands chantiers.',
  'guilde-des-commercants': 'Le commerce et la représentation des marchands.',
  'guilde-mystique': 'Les savoirs magiques, les artefacts et les traditions mystiques.',
  'guilde-des-creatures': 'Les créatures et les spécialistes qui les connaissent.',
  'guilde-de-la-lettre': 'Les lettres, le crédit et les institutions du savoir.',
  'guilde-des-explorateurs': 'Les voyages et la découverte des terres lointaines.',
  'guilde-des-mineurs': 'Les ressources du sous-sol et la vie des carrières.',
  'guilde-maritime': 'La navigation, les navires et les métiers de la mer.',
  'guilde-de-la-table': 'Les auberges, les festins et les métiers de la table.'
};
export default function Guildes() {
  const {
      guildId
    } = useParams(),
    [params] = useSearchParams(),
    guild = guildsById.get(guildId || params.get('guilde'));
  if (guildId && !guild) return <WikiMissing kind="Cette guilde" />;
  if (guild) {
    const place = findLocation(guild.location);
    return <WikiPage><WikiHeader section="Guildes" title={guild.name.replace(/^La /, '')} intro={summaries[guild.id]} aside={<img src={guild.image} alt="" className="wiki-guild-detail-image" />} />
    <div className="wiki-content"><WikiNav /><div className="wiki-profile-layout"><div><section className="wiki-section"><p className="wiki-kicker">L’organisation</p><h2>Son rôle dans le royaume</h2><p className="wiki-prose">Les guildes réunissent les savoir-faire du royaume. Elles représentent leurs activités et sont consultées sur les questions économiques et professionnelles.</p>
      <p className="wiki-prose">Leur influence ne leur donne pas automatiquement une voix au Conseil du Peuple. Un membre doit y exercer une charge officielle pour participer au vote.</p>
      <Link className="wiki-text-link" to="/histoires/politique">Comprendre les institutions ↗</Link></section>
      <section className="wiki-section"><h2>Avantages et accès documentés</h2><ul className="wiki-benefits">{guild.benefits.map((benefit, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span><LinkedText text={benefit} /></li>)}</ul>
      <p className="wiki-muted">Ces éléments décrivent les règles du registre RP. Les conditions d’accès et leur mise en œuvre en jeu sont à vérifier auprès de la guilde.</p></section>
    </div><aside className="wiki-profile-aside"><section className="wiki-section"><h2>Les liens de la guilde</h2><dl className="wiki-facts"><div><dt>Direction actuelle</dt><dd><PersonLink id={guild.leaderId} name={guild.leaderLabel} /></dd></div><div><dt>Siège</dt><dd>{place ? <WikiLink kind="place" id={place.id} /> : guild.location}</dd></div><div><dt>Membres documentés</dt><dd>{guild.members}</dd></div><div><dt>Bâtiments documentés</dt><dd>{guild.buildings}</dd></div></dl>
      <Link className="wiki-text-link" to="/histoires/metiers">Découvrir les métiers ↗</Link></section><Link className="wiki-text-link" to="/histoires/guildes">← Toutes les guildes</Link></aside></div></div></WikiPage>;
  }
  return <WikiPage><WikiHeader section="Guildes" title="Neuf guildes, un royaume." intro="Des organisations, des métiers et des personnes. Découvrez les liens qui font leur influence." />
    <div className="wiki-content"><WikiNav /><div className="wiki-guild-grid">{registry.guilds.map((g, index) => <article className="wiki-guild-entry" key={g.id}><Link to={guildPath(g.id)} className="wiki-guild-cover"><img src={g.image} alt="" loading="lazy" /><span>{String(index + 1).padStart(2, '0')}</span></Link><div><h2><Link to={guildPath(g.id)}>{g.name.replace(/^La /, '')}</Link></h2><p>{summaries[g.id]}</p><dl><div><dt>Direction</dt><dd><PersonLink id={g.leaderId} name={g.leaderLabel} /></dd></div><div><dt>Siège</dt><dd>{findLocation(g.location) ? <WikiLink kind="place" id={findLocation(g.location).id} /> : g.location}</dd></div></dl><Link className="wiki-text-link" to={guildPath(g.id)}>Découvrir la guilde ↗</Link></div></article>)}</div></div></WikiPage>;
}
