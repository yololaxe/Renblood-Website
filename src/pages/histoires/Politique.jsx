import { Link, useSearchParams } from 'react-router-dom';
import { registry, rolesById, rolePath } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiNav } from '../../components/wiki/WikiShell';
import { PersonLink, WikiLink, LinkedText } from '../../components/wiki/WikiLink';
export default function Politique() {
  const [params, setParams] = useSearchParams(),
    roleId = params.get('fonction'),
    view = roleId ? 'functions' : params.get('vue') || 'overview',
    territory = params.get('territoire') || '';
  const role = rolesById.get(roleId) || registry.roles.find(r => r.id === 'magistrat');
  const setView = value => setParams(value === 'overview' ? {} : {
    vue: value
  });
  const filtered = registry.roles.filter(r => !territory || r.territories.some(t => t.toLocaleLowerCase('fr').includes(territory.toLocaleLowerCase('fr'))));
  return <WikiPage><WikiHeader section="Politique" title="Qui gouverne Renblood ?" intro="Comprendre les institutions, retrouver une autorité et suivre les liens du pouvoir." />
    <div className="wiki-content"><WikiNav /><div className="wiki-tabs wiki-section-tabs" role="group" aria-label="Explorer la politique">{[['overview', 'Les institutions'], ['council', 'Le Conseil du Peuple'], ['functions', 'Fonctions & territoires']].map(([key, label]) => <button type="button" key={key} aria-pressed={view === key} onClick={() => setView(key)}>{label}</button>)}</div>
    {view === 'overview' && <>
      <div className="wiki-government-overview"><section className="wiki-power-section"><p className="wiki-kicker">01 / La Couronne</p><h2>Le Roi & le Conseil Royal</h2><p>La défense, la guerre, les alliances stratégiques et l’unité du royaume. Le Roi conserve un droit de veto sur les décisions civiles.</p>
        <ul className="wiki-government-roster">{registry.government.map((entry, index) => <li key={`${entry.office}-${index}`}><span>{entry.office}</span><PersonLink id={entry.personId} name={entry.personLabel} /></li>)}</ul>
      </section><section className="wiki-power-section"><p className="wiki-kicker">02 / La représentation civile</p><h2>Le Conseil du Peuple</h2><p>Les <WikiLink kind="role" id="magistrat">magistrats</WikiLink> débattent et votent les affaires civiles. Les deux <WikiLink kind="role" id={registry.roles.find(r => r.name.toLowerCase().startsWith('consul'))?.id}>consuls</WikiLink> organisent les débats et portent la voix du Conseil.</p>
        <div className="wiki-seat-summary"><strong>13</strong><span>sièges de magistrat<br />6 pour les marquisats · 5 pour les grandes villes · 2 pour les peuples non humains</span></div>
        <p className="wiki-muted">La répartition des sièges et la reconnaissance de leurs titulaires sont deux choses distinctes.</p><button type="button" className="wiki-action" onClick={() => setView('council')}>Voir les sièges et leurs titulaires ↗</button>
      </section></div>
      <div className="wiki-government-lower"><section><p className="wiki-kicker">03 / Les territoires</p><h2>L’autorité locale</h2><p>Maires, préfets et autorités de terrain exercent des fonctions différentes selon le statut du lieu. Une charge peut être élue ou nommée.</p><button className="wiki-text-link" type="button" onClick={() => setView('functions')}>Comparer les fonctions ↗</button></section>
        <section><p className="wiki-kicker">04 / Les influences</p><h2>Guildes & grandes maisons</h2><p>Les guildes conseillent sur l’économie et les métiers. Les maisons exercent leur influence par leurs terres et leurs alliances. Elles n’ont pas de vote automatique au Conseil du Peuple.</p><div className="wiki-actions"><Link className="wiki-text-link" to="/histoires/guildes">Les guildes ↗</Link><Link className="wiki-text-link" to="/histoires/familles">Les maisons ↗</Link></div></section>
      </div><section className="wiki-section wiki-how-power"><h2>Comment une décision circule</h2><ol><li><strong>Débat civil</strong><span>Magistrats et Conseil du Peuple</span></li><li><strong>Accord des consuls</strong><span>Organisation et validation du Conseil</span></li><li><strong>Contrôle royal</strong><span>Veto du Roi et sécurité du royaume</span></li></ol><Link className="wiki-text-link" to="/histoires/lois#organisation-du-conseil-du-peuple">Lire les règles du Conseil ↗</Link></section>
    </>}
    {view === 'council' && <section className="wiki-section"><p className="wiki-kicker">Le Conseil du Peuple</p><h2>Treize sièges, une situation mouvante.</h2><p className="wiki-prose">Deux sièges par marquisat, un par grande ville et deux pour les peuples non humains. Valentine est désormais une grande ville.</p>
      <div className="wiki-seat-legend"><span>6 / Marquisats</span><span>5 / Grandes villes</span><span>2 / Peuples non humains</span></div>
      <div className="wiki-seats">{registry.seats.map((seat, index) => <article className="wiki-seat" key={seat.id}><span className="wiki-seat-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{seat.label}</h3><PersonLink id={seat.personId} name={seat.personLabel} />{seat.note && <p>{seat.note}</p>}</div><span className={`wiki-seat-state is-${seat.state}`}>{seat.state === 'deceased' ? 'Titulaire décédé' : seat.state === 'contested' ? 'Reconnaissance contestée' : 'Titulaire documenté'}</span></article>)}</div>
      <p className="wiki-muted">Le remplacement du magistrat de The Verdict n’est pas renseigné. La contestation des représentants Chalk et Goodbrook ne supprime pas leurs sièges.</p>
    </section>}
    {view === 'functions' && <section className="wiki-function-workspace" id="fonction"><aside><label className="wiki-function-filter">Territoire<select value={territory} onChange={event => setParams({
              vue: 'functions',
              ...(event.target.value ? {
                territoire: event.target.value
              } : {})
            })}><option value="">Tous les niveaux</option>{[...new Set(registry.roles.flatMap(r => r.territories))].map(t => <option value={t} key={t}>{t}</option>)}</select></label>
      <nav aria-label="Fonctions politiques">{filtered.map(r => <Link key={r.id} to={rolePath(r.id)} aria-current={r.id === role?.id ? 'page' : undefined}>{r.name}<span aria-hidden="true">↗</span></Link>)}</nav>
    </aside>{role && <article className="wiki-function-detail"><p className="wiki-kicker">La fonction</p><h2>{role.name}</h2><p className="wiki-prose">{role.description}</p>
      <dl className="wiki-facts wiki-facts--columns"><div><dt>Accès à la fonction</dt><dd>{role.access || 'Non renseigné'}</dd></div><div><dt>Durée</dt><dd>{role.duration || 'Non renseignée'}</dd></div><div><dt>Territoires</dt><dd>{role.territories.join(' · ')}</dd></div><div><dt>Revenu RP documenté</dt><dd>{role.income || 'Non renseigné'}</dd></div></dl>
      <div className="wiki-function-lists"><section><h3>Attributions et prérogatives RP</h3><ul>{role.privileges.map((text, i) => <li key={i}><LinkedText text={text} /></li>)}</ul></section><section><h3>Conditions documentées</h3><ul>{role.requirements.map((text, i) => <li key={i}><LinkedText text={text} /></li>)}</ul></section></div>
      {registry.people.some(p => p.roleIds.includes(role.id)) && <section className="wiki-section"><h3>Personnages liés à cette fonction</h3><div className="wiki-inline-people">{registry.people.filter(p => p.roleIds.includes(role.id)).map(p => <PersonLink key={p.id} id={p.id} />)}</div></section>}
      <Link className="wiki-text-link" to="/histoires/lois">Consulter les lois du royaume ↗</Link>
    </article>}</section>}
    </div></WikiPage>;
}
