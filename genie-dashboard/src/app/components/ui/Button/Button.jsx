import React from "react";
import clsx from "clsx";

/**
 * Reusable Button Component
 *
 * Props:
 * - children: ReactNode
 * - variant: "primary" | "success" | "danger" | "outline" | "ghost"
 * - size: "sm" | "md" | "lg"
 * - loading: boolean
 * - Icon: Lucide icon component
 * - type: "button" | "submit" | "reset"
 * - disabled: boolean
 * - onClick: function
 */
export default function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    Icon,
    type = "button",
    disabled = false,
    onClick,
    className = "",
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary:
            "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        success:
            "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
        danger:
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline:
            "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
        ghost:
            "text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {loading && (
                <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}

            {!loading && Icon && <Icon className="w-4 h-4 mr-2" />}

            {loading ? "Processing..." : children}
        </button>
    );
}