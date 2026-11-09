import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import "./immersive.css";

function KingdomTile({index,progress,onSelect}) {
  const column=index%4, row=Math.floor(index/4);
  const rotateY=useTransform(progress,[0,.7],[(column-1.5)*-18,0]);
  const rotateX=useTransform(progress,[0,.7],[row===0?12:-12,0]);
  const z=useTransform(progress,[0,.7],[-100-Math.abs(column-1.5)*100,0]);
  const y=useTransform(progress,[0,.7],[(row===0?-1:1)*(40+column*12),0]);
  return <motion.button type="button" className="kingdom-scene-tile" style={{rotateY,rotateX,z,y}} onClick={() => onSelect(index)} aria-label={`Agrandir la vue du royaume ${index+1}`}><img src={`/accueil/screen${index+1}-640.jpg`} srcSet={`/accueil/screen${index+1}-640.jpg 640w, /accueil/screen${index+1}-1280.jpg 1280w`} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 48vw, 32vw" alt={`Vue du royaume ${index+1}`} loading="lazy" /><span>RENBLOOD / {String(index+1).padStart(2,"0")} <b aria-hidden="true">↗</b></span></motion.button>;
}

export default function ImmersiveKingdom({onSelect}) {
  const ref=useRef(null);
  const reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target:ref,offset:["start end","end end"]});
  const progress=useSpring(scrollYProgress,{stiffness:90,damping:28});
  const scale=useTransform(progress,[0,.65],[.8,1]);
  const opacity=useTransform(progress,[0,.3],[.3,1]);
  return <section ref={ref} className={`kingdom-scene ${reduced?"kingdom-scene--still":""}`} aria-labelledby="kingdom-scene-title">
    <div className="kingdom-scene-stage">
      <div className="kingdom-scene-copy"><p>UN ROYAUME À HABITER</p><h2 id="kingdom-scene-title">Des lieux.<br/>Vos histoires<span>.</span></h2><p>Chaque rue, chaque rencontre, une nouvelle voie à explorer.</p></div>
      <motion.div className="kingdom-scene-grid" style={reduced?{}:{scale,opacity}}>
        {Array.from({length:8},(_,index) => reduced ? <button key={index} className="kingdom-scene-tile" onClick={()=>onSelect(index)} aria-label={`Agrandir la vue du royaume ${index+1}`}><img src={`/accueil/screen${index+1}-640.jpg`} srcSet={`/accueil/screen${index+1}-640.jpg 640w, /accueil/screen${index+1}-1280.jpg 1280w`} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 48vw, 32vw" alt={`Vue du royaume ${index+1}`} loading="lazy" /></button> : <KingdomTile key={index} index={index} progress={progress} onSelect={onSelect} />)}
      </motion.div>
      <p className="kingdom-scene-caption">EXPLOREZ LES VUES DU ROYAUME <span>Cliquer pour agrandir ↗</span></p>
    </div>
  </section>;
}
