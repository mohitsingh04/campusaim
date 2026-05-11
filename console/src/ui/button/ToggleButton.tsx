import { useState } from "react";

interface ToggleButtonProps {
  label?: string;
  enabled?: boolean;
  onToggle?: (newState: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export default function ToggleButton({
  label = "",
  enabled: externalEnabled,
  onToggle,
  disabled,
  className = "",
}: ToggleButtonProps) {
  const [internalEnabled, setInternalEnabled] = useState(false);
  const enabled =
    typeof externalEnabled === "boolean" ? externalEnabled : internalEnabled;

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!enabled);
    } else {
      setInternalEnabled(!enabled);
    }
  };

  return (
    <label
      className={`flex items-center gap-3 cursor-pointer select-none ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out outline-none ring-2  ring-offset-2
        ${enabled ? "bg-green-500 ring-green-500" : "bg-red-500 ring-red-500"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      >
        <span
          className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--yp-primary)] shadow ring-0 
          transition duration-200 ease-in-out
          ${enabled ? "translate-x-5" : "translate-x-0"}
        `}
        />
      </button>
      {label && <span className="text-[var(--yp-text-primary)]">{label}</span>}
    </label>
  );
}
