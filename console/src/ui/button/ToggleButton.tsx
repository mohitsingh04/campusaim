import { useState } from "react";

interface ToggleButtonProps {
  label?: string;
  enabled?: boolean; // controlled state
  onToggle?: (newState: boolean) => void; // callback for toggle
  activeColor?: string;
  inactiveColor?: string;
  knobColor?: string;
  className?: string;
}

export default function ToggleButton({
  label = "",
  enabled: externalEnabled,
  onToggle,
  activeColor = "bg-green-500",
  inactiveColor = "bg-[var(--yp-muted)]",
  knobColor = "bg-[var(--yp-primary)]",
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
        className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none ${
          enabled ? activeColor : inactiveColor
        }`}
      >
        <span
          className={`inline-block w-5 h-5 transform ${knobColor} rounded-full shadow-md transition-transform duration-300 ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {label && <span className="text-[var(--yp-text-primary)]">{label}</span>}
    </label>
  );
}
