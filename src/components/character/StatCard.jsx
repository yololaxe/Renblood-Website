import ToolTip from "../Tooltip";

export default function StatCard({ icon, label, value, bonus, tooltip }) {
  return (
    <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xl text-gray-400">{icon}</span>
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-lg font-bold text-white">{value}</span>
        {bonus > 0 && (
          <ToolTip text={tooltip}>
            <span className="text-xs font-bold text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">
              +{bonus}
            </span>
          </ToolTip>
        )}
      </div>
    </div>
  );
}
