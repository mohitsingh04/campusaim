import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
}

const ToggleButton: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  const handleToggle = () => {
    if (disabled) return;
    onChange();
  };

  return (
    <label
      className={`inline-block cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      onClick={handleToggle}
    >
      <div
        className={`
          w-11 h-6 rounded-full relative transition-colors duration-200
          ${checked ? "bg-(--success)" : "bg-(--gray)"}
        `}
      >
        <div
          className={`
            w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5
            transition-transform duration-200
            ${checked ? "translate-x-5" : "translate-x-0.5"}
          `}
        ></div>
      </div>
    </label>
  );
};

export default ToggleButton;
