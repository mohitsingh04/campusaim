import { FaUser } from "react-icons/fa";
import { GiPhone } from "react-icons/gi";
import { LuEye } from "react-icons/lu";
import Badge from "../../../components/ui/Badge/Badge";
import { getStatusColor } from "../../../context/Callbacks";

export default function ConversationHeader({
  lead,
  hasHistory,
  isStarted,
}) {
  return (
    <div className="p-4 border-b border-[var(--yp-border-primary)] text-[var(--yp-text-secondary)] flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--yp-main-subtle)] flex items-center justify-center text-[var(--yp-main)]">
          <FaUser size={20} />
        </div>

        <div>
          <h2 className="font-bold">{lead?.name || "Student Name"}</h2>

          {lead?.contact && (
            <p className="text-xs text-[var(--yp-muted)] flex items-center gap-1">
              <GiPhone size={12} />
              {lead?.contact}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {hasHistory && !isStarted && (
          <span className="flex items-center gap-1 text-xs bg-[var(--yp-gray-subtle)] text-[var(--yp-gray)] px-2 py-1 rounded">
            <LuEye /> View Mode
          </span>
        )}

        <Badge
          label={lead?.status}
          color={getStatusColor(lead?.status || "")}
        />
      </div>
    </div>
  );
}