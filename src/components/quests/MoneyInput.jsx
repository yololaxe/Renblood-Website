import { useEffect, useState } from "react";

export default function MoneyInput({ value, onChange }) {
  const [parts, setParts] = useState({ or: 0, argent: 0, bronze: 0, fer: 0 });

  useEffect(() => {
    const or = Math.floor(value / 262144);
    const remOr = value % 262144;
    const argent = Math.floor(remOr / 4096);
    const remArgent = remOr % 4096;
    const bronze = Math.floor(remArgent / 64);
    const fer = remArgent % 64;
    setParts({ or, argent, bronze, fer });
  }, [value]);

  const handleChange = (part, rawValue) => {
    const newParts = { ...parts, [part]: Number(rawValue) || 0 };
    setParts(newParts);
    onChange((newParts.or * 262144) + (newParts.argent * 4096) + (newParts.bronze * 64) + newParts.fer);
  };

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Argent</label>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(parts).map(([part, amount]) => (
          <div key={part}>
            <label className="text-xs text-gray-500 capitalize">{part}</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(event) => handleChange(part, event.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
