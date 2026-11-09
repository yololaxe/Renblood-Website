import { motion, useReducedMotion } from "framer-motion";
import "./realm.css";

export default function RealmHeader({ eyebrow, title, description, children, image }) {
  const reduced = useReducedMotion();
  return <header className="realm-header">
    <div className={`realm-heading ${image ? "realm-heading--illustrated" : ""}`}>
      <motion.div initial={{ opacity: 0, y: reduced ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
        <p className="realm-eyebrow"><span />{eyebrow}</p>
        <h1>{title}<span className="realm-dot">.</span></h1>
        <p className="realm-intro">{description}</p>
        {children && <div className="realm-header-actions">{children}</div>}
      </motion.div>
      {image && <motion.figure initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }} className="realm-cover"><img src={image} alt="Vue du royaume de Renblood" /><figcaption>RENBLOOD / LES CHRONIQUES DU ROYAUME</figcaption></motion.figure>}
    </div>
  </header>;
}
