import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
const positions = new Map();
export default function useWikiPosition() {
  const location = useLocation(),
    navigation = useNavigationType(),
    previousPath = useRef(null);
  useLayoutEffect(() => {
    const key = location.key,
      position = positions.get(key),
      changed = previousPath.current !== location.pathname;
    previousPath.current = location.pathname;
    const frame = requestAnimationFrame(() => {
      if (navigation === 'POP' && position !== undefined) window.scrollTo({
        top: position
      });else if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({
        block: 'start'
      });else if (changed) window.scrollTo({
        top: 0
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      positions.set(key, window.scrollY);
      if (positions.size > 80) positions.delete(positions.keys().next().value);
    };
  }, [location.key, location.pathname, location.hash, navigation]);
}
