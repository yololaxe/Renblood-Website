import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FaSearchPlus, FaSearchMinus, FaCompress, FaSearch, FaLocationArrow, FaTimes, FaArrowLeft } from "react-icons/fa";
import RealmHeader from "../components/RealmHeader";
import { Link, useSearchParams } from "react-router-dom";
import { PersonLink, LinkedText } from "../components/wiki/WikiLink";
import { slug } from "../services/wiki.mjs";
import "../components/wiki/wiki.css";
import comtes from "../data/comtes";
import "./map.css";

const WIDTH = 1154, HEIGHT = 1608, MIN = .2, MAX = 4;
const clamp = scale => Math.max(MIN, Math.min(MAX, scale));
const iconFor = city => `/kit/${city.type.toLowerCase().replace(/ /g, "-")}.png`;

export default function Map() {
  const reduced = useReducedMotion();
  const [wikiParams] = useSearchParams();
  const canvas = useRef(null);
  const drag = useRef(null);
  const [camera, setCamera] = useState({x:0,y:0,scale:1});
  const [dragging, setDragging] = useState(false);
  const [touchExplore, setTouchExplore] = useState(false);
  const [minecraft, setMinecraft] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const cities = useMemo(() => Object.entries(comtes).flatMap(([county,items]) => items.map(city => ({...city,county}))), []);
  const matches = useMemo(() => cities.filter(city => `${city.ville} ${city.county} ${city.type}`.toLocaleLowerCase("fr").includes(query.trim().toLocaleLowerCase("fr"))), [cities,query]);
  useEffect(() => {
    const target = wikiParams.get("lieu");
    if (!target) return;
    const place = cities.find(city => city.ville.toLocaleLowerCase("fr") === target.toLocaleLowerCase("fr"));
    if (place) setSelected(place);
  }, [cities, wikiParams]);
  const types = useMemo(() => [...new Set(cities.map(city=>city.type))], [cities]);
  const zoom = useCallback((factor, point={x:0,y:0}) => {
    setCamera(current => {
      const scale = clamp(current.scale * factor), ratio = scale/current.scale;
      return {scale,x:point.x-(point.x-current.x)*ratio,y:point.y-(point.y-current.y)*ratio};
    });
  }, []);
  const fit = useCallback(() => {
    if (!canvas.current) return;
    const {width,height} = canvas.current.getBoundingClientRect();
    setCamera({x:0,y:0,scale:clamp(Math.min(width/WIDTH,height/HEIGHT)*.92)});
  }, []);
  useEffect(() => {
    const element = canvas.current;
    // A non-passive native listener cancels only intentional map zoom.
    const wheel = event => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
      zoom(Math.exp(-Math.max(-100,Math.min(100,delta))*.003), {x:event.clientX-rect.left-rect.width/2,y:event.clientY-rect.top-rect.height/2});
    };
    element.addEventListener("wheel",wheel,{passive:false});
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => {element.removeEventListener("wheel",wheel);observer.disconnect();};
  }, [zoom,fit]);
  const focusCity = city => {
    setSelected(city);
    if (city.Coords) setCamera({scale:1.15,x:-(city.Coords[0]-WIDTH/2)*1.15,y:-(city.Coords[1]-HEIGHT/2)*1.15});
  };
  const pointerDown = event => {
    if (event.button !== 0 || (event.pointerType === "touch" && !touchExplore)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,origin:camera};
    setDragging(true);
  };
  const pointerMove = event => {
    if (!drag.current || drag.current.id!==event.pointerId) return;
    const start = drag.current;
    setCamera({...start.origin,x:start.origin.x+event.clientX-start.x,y:start.origin.y+event.clientY-start.y});
  };
  const pointerUp = event => {
    if (drag.current?.id!==event.pointerId) return;
    drag.current=null;setDragging(false);
  };
  const keys = event => {
    if (event.target.closest("input,textarea,select,button,a")) return;
    if (["+","=","-","0","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) event.preventDefault();
    if (event.key==="+" || event.key==="=") zoom(1.2);
    if (event.key==="-") zoom(1/1.2);
    if (event.key==="0") fit();
    if (event.key.toLowerCase()==="m") {setLoaded(false);setMinecraft(v=>!v);}
    if (event.key==="Escape") {setSelected(null);setTouchExplore(false);}
    const moves={ArrowLeft:[80,0],ArrowRight:[-80,0],ArrowUp:[0,80],ArrowDown:[0,-80]};
    if (moves[event.key]) setCamera(c=>({...c,x:c.x+moves[event.key][0],y:c.y+moves[event.key][1]}));
  };
  return <main className="realm-page atlas-page">
    <RealmHeader eyebrow="L’atlas / Territoires" title="Le royaume, à votre portée" description="Suivez les frontières, retrouvez une cité et découvrez ceux qui la font vivre." />
    <section className="atlas-workspace" aria-label="Atlas interactif" onKeyDown={keys}>
      <div className="atlas-topline"><Link className="realm-action" to="/cadastre">Cadastre & propriétés ↗</Link><p><span /> ATLAS DE RENBLOOD <span className="atlas-edition">/ TERRITOIRES & CITÉS</span></p><div className="atlas-modes" aria-label="Fond de carte">{[[false,"Illustrée"],[true,"Minecraft"]].map(([value,label])=><button key={label} aria-pressed={minecraft===value} onClick={()=>{if(minecraft!==value){setLoaded(false);setImageError(false);setMinecraft(value);}}}>{label}</button>)}</div></div>
      <div className="atlas-layout">
        <div className="atlas-stage-wrap">
          <div ref={canvas} className={`atlas-canvas ${dragging?"is-dragging":""}`} style={{touchAction:touchExplore?"none":"pan-y"}} tabIndex={0} role="region" aria-label="Carte du royaume. Boutons pour zoomer, flèches pour déplacer." onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onLostPointerCapture={pointerUp}>
            <div className="atlas-compass" aria-hidden="true"><span>N</span><i>✧</i><span>S</span></div>
            <div className="atlas-crosshair" aria-hidden="true" />
            <motion.div className="atlas-map" animate={{x:camera.x,y:camera.y,scale:camera.scale}} transition={dragging || reduced ? {duration:0} : {type:"spring",stiffness:160,damping:30}} style={{width:WIDTH,height:HEIGHT}}>
              <img className="atlas-image" width={WIDTH} height={HEIGHT} src={minecraft?"/map/carte-minecraft.png":"/map/carte-renblood.png"} alt={minecraft?"Territoires Minecraft de Renblood":"Carte illustrée du royaume de Renblood"} draggable={false} onLoad={()=>{setLoaded(true);setImageError(false);fit();}} onError={()=>setImageError(true)} />
              {loaded && cities.filter(city=>city.Coords).map(city=><motion.button key={`${city.county}-${city.ville}`} className={`atlas-marker ${selected?.ville===city.ville?"is-selected":""}`} style={{left:city.Coords[0],top:city.Coords[1]}} aria-label={`Découvrir ${city.ville}`} aria-pressed={selected?.ville===city.ville} onPointerDown={e=>e.stopPropagation()} onClick={()=>focusCity(city)} whileHover={reduced?{}:{scale:1.18}} whileTap={reduced?{}:{scale:.95}}><img src={iconFor(city)} alt="" draggable={false}/><span>{city.ville}</span></motion.button>)}
            </motion.div>
            {!loaded && <p className="atlas-loading" role="status">{imageError?"La carte n’a pas pu être chargée.":"Ouverture de l’atlas…"}</p>}
          </div>
          <div className="atlas-map-controls"><button aria-label="Zoomer" title="Zoomer (+)" onClick={()=>zoom(1.2)}><FaSearchPlus /></button><output aria-label="Niveau de zoom">{Math.round(camera.scale*100)}%</output><button aria-label="Dézoomer" title="Dézoomer (-)" onClick={()=>zoom(1/1.2)}><FaSearchMinus /></button><span /><button aria-label="Voir toute la carte" title="Voir toute la carte (0)" onClick={fit}><FaCompress /></button></div>
          <button className="atlas-touch-toggle" aria-pressed={touchExplore} onClick={()=>setTouchExplore(v=>!v)}>{touchExplore?"Terminer le déplacement":"Déplacer au toucher"}</button>
          <p className="atlas-map-hint">Glisser pour explorer <span>·</span> Ctrl / ⌘ + molette pour zoomer</p>
        </div>
        <aside className="atlas-sidebar" aria-label="Lieux du royaume">
          <AnimatePresence mode="wait" initial={false}>
            {selected?<motion.div key={`${selected.county}-${selected.ville}`} initial={{opacity:0,y:reduced?0:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.22}} className="atlas-city-details">
              <button className="atlas-back" onClick={()=>setSelected(null)}><FaArrowLeft /> Tous les lieux</button>
              <div className="atlas-city-heading"><img src={iconFor(selected)} alt=""/><p>{selected.type} / {selected.county}</p><h2>{selected.ville}</h2></div>
              <dl>{[["Dirigeant",selected.chef],["Population",selected.habitant],["Garnison",selected.soldat],["Environnement",selected.environnement],["Guilde",selected.guilde]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{label === "Dirigeant" && value ? <PersonLink name={value} /> : value ?? "Non renseigné"}</dd></div>)}</dl>
              {selected.conseil && <div className="atlas-council"><h3>Conseil municipal</h3><dl>{Object.entries(selected.conseil).map(([role,value])=><div key={role}><dt><LinkedText text={role}/></dt><dd>{Array.isArray(value)?value.filter(Boolean).join(", ") || "—":value || "—"}</dd></div>)}</dl></div>}
              <Link className="realm-action" to={`/histoires/lieux/${slug(selected.ville)}`}>Le lieu et ses personnages ↗</Link><button className="realm-action" onClick={()=>focusCity(selected)}><FaLocationArrow /> Recentrer sur cette ville</button>
            </motion.div>:<motion.div key="directory" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="atlas-directory">
              <div className="atlas-directory-heading"><p>LE CARNET DES LIEUX</p><h2>Où allez-vous ?</h2></div>
              <label className="atlas-search"><FaSearch /><span className="sr-only">Chercher une ville ou un comté</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ville, comté, type…" />{query && <button aria-label="Effacer la recherche" onClick={()=>setQuery("")}><FaTimes /></button>}</label>
              <p className="atlas-results" aria-live="polite">{matches.length} lieu{matches.length>1?"x":""}</p>
              <div className="atlas-city-list">{matches.map(city=><button key={`${city.county}-${city.ville}`} className="atlas-city-row" onClick={()=>focusCity(city)}><img src={iconFor(city)} alt="" loading="lazy"/><span><strong>{city.ville}</strong><small>{city.county} · {city.type}</small></span><FaLocationArrow /></button>)}{!matches.length&&<p className="atlas-no-results">Aucun lieu ne correspond à votre recherche.</p>}</div>
            </motion.div>}
          </AnimatePresence>
        </aside>
      </div>
      <div className="atlas-bottomline"><p>LES REPÈRES DU ROYAUME</p><ul>{types.map(type=><li key={type}><img src={iconFor({type})} alt=""/><span>{type}</span></li>)}</ul></div>
    </section>
  </main>;
}
