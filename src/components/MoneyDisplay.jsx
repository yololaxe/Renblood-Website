import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { formatMoney, compactMoney } from "../utils/money";

export const MoneyDisplay = ({ value, amount = value }) => {
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, offsetX: 0 });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      left: rect.left + rect.width / 2,
      top: rect.top - 8,
      offsetX: 0,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isHovered) return undefined;

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isHovered, updatePosition]);

  useLayoutEffect(() => {
    if (!isHovered || !tooltipRef.current) return;

    const viewportPadding = 8;
    const rect = tooltipRef.current.getBoundingClientRect();
    const unshiftedLeft = rect.left - position.offsetX;
    const unshiftedRight = rect.right - position.offsetX;
    let offsetX = 0;

    if (unshiftedLeft < viewportPadding) {
      offsetX = viewportPadding - unshiftedLeft;
    } else if (unshiftedRight > window.innerWidth - viewportPadding) {
      offsetX = window.innerWidth - viewportPadding - unshiftedRight;
    }

    if (offsetX !== position.offsetX) {
      setPosition((current) => ({ ...current, offsetX }));
    }
  }, [isHovered, position.left, position.top, position.offsetX]);

  const display = compactMoney(amount);
  const tooltip = formatMoney(amount);
  const tooltipElement = (
    <AnimatePresence>
      {isHovered && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] pointer-events-none max-w-[calc(100vw-16px)]"
          style={{
            left: position.left,
            top: position.top,
            transform: `translate(calc(-50% + ${position.offsetX}px), -100%)`,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="relative px-3 py-2 text-xs font-medium text-white bg-gray-900 border border-gray-700 rounded-lg shadow-xl whitespace-nowrap"
            style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5))" }}
          >
            {tooltip}
            <div
              className="absolute top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"
              style={{ left: `calc(50% - ${position.offsetX}px)` }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => {
        updatePosition();
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {display || "0F"}
      {typeof document !== "undefined" && createPortal(tooltipElement, document.body)}
    </span>
  );
};
