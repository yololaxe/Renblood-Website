import { useState } from "react";

export const MoneyDisplay = ({ value }) => {
  const [isHovered, setIsHovered] = useState(false);

  const convertMoney = (amount) => {
    const or = Math.floor(amount / (64 * 64 * 64));
    const remainingAfterOr = amount % (64 * 64 * 64);
    const argent = Math.floor(remainingAfterOr / (64 * 64));
    const remainingAfterArgent = remainingAfterOr % (64 * 64);
    const bronze = Math.floor(remainingAfterArgent / 64);
    const fer = remainingAfterArgent % 64;

    return {
      or,
      argent,
      bronze,
      fer,
      tooltip: `${or > 0 ? `${or} pièce${or > 1 ? 's' : ''} d'or` : ''}${
        argent > 0 ? `${or > 0 ? ', ' : ''}${argent} pièce${argent > 1 ? 's' : ''} d'argent` : ''
      }${
        bronze > 0 ? `${or > 0 || argent > 0 ? ', ' : ''}${bronze} pièce${bronze > 1 ? 's' : ''} de bronze` : ''
      }${
        fer > 0 ? `${or > 0 || argent > 0 || bronze > 0 ? ', ' : ''}${fer} pièce${fer > 1 ? 's' : ''} de fer` : ''
      }`,
      display: `${or > 0 ? `${or}O ` : ''}${argent > 0 ? `${argent}A ` : ''}${bronze > 0 ? `${bronze}B ` : ''}${fer > 0 ? `${fer}F` : ''}`.trim(),
    };
  };

  const { display, tooltip } = convertMoney(value);

  return (
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {display || "0F"}
      {isHovered && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap">
          {tooltip || "0 pièce de fer"}
        </div>
      )}
    </span>
  );
};