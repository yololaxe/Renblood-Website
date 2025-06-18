import React, { useState } from "react";

const Tooltip = ({ text, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <span  className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2
                        px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap">
          {text}
        </span >
      )}
    </span>
  );
};

export default Tooltip;
