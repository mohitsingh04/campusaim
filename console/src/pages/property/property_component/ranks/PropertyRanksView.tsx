import { BiBarChartAlt2, BiEditAlt } from "react-icons/bi";
import type { RankItem } from "./PropertyRanks";

interface ViewProps {
  ranks: RankItem[];
  onEdit: () => void;
}

export default function PropertyRanksView({ ranks, onEdit }: ViewProps) {
  return (
    <div className="bg-[var(--yp-primary)] p-6 rounded-lg shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-[var(--yp-text-primary)]">
          <div className="p-2 bg-[var(--yp-blue-text)] text-[var(--yp-blue-bg)] rounded-lg">
            <BiBarChartAlt2 size={20} />
          </div>
          <p className="font-bold">Property Ranks</p>
        </div>
        <button
          onClick={onEdit}
          className="bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] p-1 rounded-md"
        >
          <BiEditAlt className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ranks.length > 0 ? (
          ranks.map((rank, index) => (
            <div
              key={index}
              className="p-4 bg-[var(--yp-secondary)] rounded-lg border border-[var(--yp-border-primary)] flex justify-between items-center"
            >
              <span className="capitalize font-medium text-sm text-[var(--yp-text-primary)]">
                {rank?.rank_name?.replace(/_/g, " ")}
              </span>
              <span className="text-lg font-bold text-[var(--yp-main)]">
                {rank.value_name}
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-[var(--yp-text-primary)] italic bg-[var(--yp-secondary)] rounded-lg border border-dashed border-[var(--yp-border-primary)]">
            No ranking data available.
          </div>
        )}
      </div>
    </div>
  );
}
