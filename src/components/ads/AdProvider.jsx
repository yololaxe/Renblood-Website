import { useEffect } from "react";

export default function AdProvider() {
  useEffect(() => {
    // Si déjà injecté (navigations SPA), ne rien faire
    if (document.querySelector('script[data-adsbygoogle]')) return;

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5045755596441777";
    s.crossOrigin = "anonymous";
    s.setAttribute("data-adsbygoogle", "true");
    document.head.appendChild(s);
  }, []);
  return null;
}
