import Link from "next/link";
import React from "react";
import { IconType } from "react-icons";
import { LuSend } from "react-icons/lu";
import { TbLoader } from "react-icons/tb";

interface ButtonGroupProps {
  label?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
  href?: string;
  onClick?: any;
  disable: boolean;
}

export const ButtonGroup = ({
  label = "Save Changes",
  type = "button",
  onClick,
  className = "",
  href,
  disable,
}: ButtonGroupProps) => {
  const baseClasses = `mt-1 btn-shine px-4 py-2 rounded-custom ${className} `;
  if (href && href.trim() !== "") {
    return (
      <Link href={href} className={`${baseClasses} block text-center`}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={baseClasses}
      disabled={disable}
    >
      {label}
    </button>
  );
};
// button 2

interface ButtonGroupSecondaryProps {
  label?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}

export const ButtonGroupSecondary: React.FC<ButtonGroupSecondaryProps> = ({
  label = "Save Changes",
  type = "button",
  onClick,
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`mt-1 border-2 border-(--main) text-(--main)
      px-4 py-2 rounded-custom cursor-pointer 
      hover:shadow-custom hover:scale-102 active:scale-95 
      transition-all duration-300 ${className}`}
  >
    {label}
  </button>
);

interface ButtonGroup2Props {
  label: string;
  type?: "button" | "submit" | "reset";
  onClick?: any;
  disable: boolean;
  isSubmitting?: boolean;
  className?: string;
  Icon?: IconType;
}

export default function ButtonGroupSend({
  label = "Save Changes",
  type = "button",
  onClick,
  className = "",
  disable,
  isSubmitting = false,
  Icon = LuSend,
}: ButtonGroup2Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disable}
      className={`btn-shine text-shadow py-2 px-4 rounded-custom flex items-center justify-center gap-2  ${className}`}
    >
      {isSubmitting ? (
        <>
          <TbLoader className="w-5 h-5 animate-spin" />
          <span>Sending...</span>
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
