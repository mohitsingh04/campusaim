
import React from "react";

export function Badge({
    label,
    color = "gray",
    size = "sm",
}) {
    const colors = {
        // Base palette
        green: "var(--yp-success-subtle) var(--yp-success-emphasis)",
        red: "var(--yp-danger-subtle) var(--yp-danger-emphasis)",
        blue: "var(--yp-blue-subtle) var(--yp-blue-emphasis)",
        yellow: "var(--yp-warning-subtle) var(--yp-warning-emphasis)",
        gray: "var(--yp-gray-subtle) var(--yp-gray-emphasis)",

        // 🔥 Semantic aliases (used in Sentiment & Status)
        success: "var(--yp-success-subtle) var(--yp-success-emphasis)",
        danger: "var(--yp-danger-subtle) var(--yp-danger-emphasis)",
        warning: "var(--yp-warning-subtle) var(--yp-warning-emphasis)",
        info: "var(--yp-blue-subtle) var(--yp-blue-emphasis)",
    };

    const sizes = {
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
    };

    const colorValue = colors[color] ?? colors.gray;
    const [bgColor, textColor] = colorValue.split(" ");

    return (
        <span
            className={`inline-flex items-center rounded-full font-bold ${sizes[size]}`}
            style={{
                backgroundColor: bgColor,
                color: textColor,
            }}
        >
            {label}
        </span>
    );
}

export default Badge;