import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./editorial.css";

export default function PageTransition({ children }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("editorial-entered"); observer.unobserve(entry.target); } });
    }, { threshold: .08 });
    const scan = () => ref.current?.querySelectorAll("section > h2, section > div > h2, .reveal-block").forEach(el => observer.observe(el));
    scan();
    const mutation = new MutationObserver(scan);
    mutation.observe(ref.current, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutation.disconnect(); };
  }, [reduced]);
  return <motion.div ref={ref} className="site-page" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced ? .1 : .28}}>{children}</motion.div>;
}
