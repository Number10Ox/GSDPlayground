export function CharacterInfo() {
  // Placeholder data - will be connected to character system in Phase 4
  return (
    <div className="bg-surface rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2">
        Your Dog
      </h3>

      {/* Minimal stats - always visible */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Cycle</span>
          <span className="text-amber-400 font-medium">Day 1</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Dice Pool</span>
          <span className="text-gray-100 font-medium">4d6</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Fallout</span>
          <span className="text-green-400 font-medium">None</span>
        </div>
      </div>

      {/* View full sheet link */}
      <button className="w-full text-sm text-gray-400 hover:text-gray-200 transition-colors pt-2 border-t border-gray-700">
        View Character Sheet
      </button>
    </div>
  );
}
