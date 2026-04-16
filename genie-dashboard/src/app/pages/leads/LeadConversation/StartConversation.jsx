import { FaPlay } from "react-icons/fa";
import { LuPhone } from "react-icons/lu";

export default function StartConversation({
  hasHistory,
  handleStart,
}) {
  return (
    <div className="text-center max-w-md mt-10">
      <div className="w-20 h-20 bg-[var(--yp-main-subtle)] rounded-full flex items-center justify-center mx-auto mb-6">
        <LuPhone className="w-10 h-10 text-[var(--yp-main)]" />
      </div>

      <h2 className="text-2xl font-bold mb-2">
        {hasHistory ? "Conversation History" : "Ready to Start?"}
      </h2>

      <p className="text-[var(--yp-muted)] mb-8">
        {hasHistory
          ? "Previous answers found. You can use them as reference and start a new session."
          : "Begin the admission counseling session. Ensure you have the student's details handy."}
      </p>

      <button
        onClick={handleStart}
        className="bg-[var(--yp-main-subtle)] text-[var(--yp-main)] px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
      >
        <FaPlay className="w-4 h-4" />
        {hasHistory ? "Continue Conversation" : "Start Conversation"}
      </button>
    </div>
  );
}
