// src/components/AdBox.jsx
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * AdBox – Carte pub compacte, élégante, et déplaçable.
 *
 * Props:
 *  - patreon: undefined (loading) | null (invité) | number (0..3/4)
 *  - slot: string            → label UI (ex: "home-bottom-right")
 *  - adSlot: string          → AdSense slot id (ex: "6427840141")
 *  - adClient: string        → AdSense client id (ex: "ca-pub-XXXX")
 *  - className: string       → classes Tailwind supplémentaires
 *  - hideWhenAdFree: boolean → si true, masque la carte pour tier >= 1 (prod)
 *  - test: boolean           → data-adtest="on" en dev
 *  - size: "sm" | "md"       → format fixe de l’encart ("sm"=250×200, "md"=300×250)
 *  - storageKey: string      → clé localStorage pour persister la position
 */
export default function AdBox({
  patreon,
  slot = "home-right",
  adSlot = "6427840141",
  adClient = "ca-pub-5045755596441777",
  className = "",
  hideWhenAdFree = true,
  test = true,
  size = "sm",
  storageKey,
}) {
  // ----- Hooks (ordre stable)
  const insRef = useRef(null);
  const [pushed, setPushed] = useState(false);

  // Position draggable (relative au point d’ancrage où le composant est rendu)
  const key = storageKey || `adbox-pos:${slot}`;
  const [pos, setPos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  });

  // Normalisation des états AVANT tout return
  const isLoading = typeof patreon === "undefined";
  const tier = patreon === null ? 0 : Number(patreon ?? 0);
  const isAd = !isLoading && tier === 0;

  // Pousse l’annonce une fois que l’ins est présent et qu’on DOIT afficher une pub
  useEffect(() => {
    if (!isAd || !insRef.current || pushed) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setPushed(true);
    } catch {
      // adblock/script non prêt : on garde le fallback visuel
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAd, adSlot, adClient, insRef.current]);

  // ----- Rendu conditionnel (après hooks)
  if (isLoading) return null;                 // anti-flash
  if (!isAd && hideWhenAdFree) return null;   // ad-free : on masque en prod

  // Style/format de l’encart AdSense (compact)
  const adDims =
    size === "md"
      ? { w: 300, h: 250 } // rectangle moyen
      : { w: 250, h: 200 }; // compact par défaut

  // Carte élégante: verre fumé + liseré néon discret
  const cardClasses = [
    "relative select-none",
    "rounded-xl border shadow-xl",
    "bg-[rgba(10,10,12,0.86)] backdrop-blur-sm",
    "border-white/10",
    "ring-1 ring-blue-500/10 hover:ring-blue-400/20",
    "transition-shadow duration-200",
    "text-white",
    "p-3", // padding sobre
    className,
  ].join(" ");

  // Titre/Badges
  const headerText = isAd ? "Publicité" : "MERCI POUR LE SOUTIEN ❤️";
  const tierText = patreon === null ? "Invité (Tier 0)" : `Tier ${tier}`;

  // Gestion fin de drag → persistence
  const onDragEnd = (_e, info) => {
    const next = { x: pos.x + info.offset.x, y: pos.y + info.offset.y };
    setPos(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };

  return (
    <motion.div
      // Déplaçable en prenant la carte ENTIEREMENT
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragEnd={onDragEnd}
      style={{ x: pos.x, y: pos.y }}
      initial={{ opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cardClasses}
    >
      {/* Header élégant */}
        <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-white/60">
                {headerText}
            </div>
            <div className="mt-1 text-sm font-medium text-white/90">{tierText}</div>
        </div>

        {/* Titre/Tier */}


        {/* Corps: Pub ou carte "merci" */}
      {isAd ? (
        <>
          <div className="mt-2 rounded-lg overflow-hidden border border-white/5">
            <ins
              ref={insRef}
              className="adsbygoogle block"
              style={{
                display: "inline-block",
                width: `${adDims.w}px`,
                height: `${adDims.h}px`,
              }}
              data-ad-client={adClient}
              data-ad-slot={adSlot}
              data-ad-format="" // format fixe (évite les tailles énormes)
              data-full-width-responsive="false"
              {...(test ? { "data-adtest": "on" } : {})}
            />
            {/* Fallback discret si no-fill/adblock/script non prêt */}
            {!pushed && (
              <div
                className="flex items-center justify-center text-[11px] text-white/50"
                style={{
                  width: `${adDims.w}px`,
                  height: `${adDims.h}px`,
                  background:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 8px, rgba(255,255,255,0.03) 8px 16px)",
                }}
                aria-hidden
              >
                Publicité (fallback)
              </div>
            )}
          </div>

          {/* Hint micro (apparait au hover) */}
          <div className="mt-1 text-[10px] text-white/40 opacity-0 hover:opacity-100 transition">
            Astuce&nbsp;: maintenez et faites glisser la carte pour la déplacer.
          </div>
        </>
      ) : (
        <div className="mt-3 h-[96px] w-[220px] mx-auto rounded-lg bg-white/5 flex items-center justify-center text-xs text-white/70">
          Merci, aucune publicité ici.
        </div>
      )}
    </motion.div>
  );
}
