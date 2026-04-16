import React, { memo } from "react";
import PropTypes from "prop-types";
import NotFound from "../../../assets/images/No_Image_Available.jpg";

/**
 * Resolve profile image URL safely.
 * Handles:
 *  - Absolute URLs (Google OAuth / external)
 *  - Relative local media paths
 *  - Fallback image
 */
const resolveProfileImage = (profileImage) => {
    if (!profileImage || typeof profileImage !== "string") {
        return null;
    }

    // Google OAuth image → force higher stable size
    if (/^https?:\/\/lh3\.googleusercontent\.com/i.test(profileImage)) {
        return profileImage.replace(/=s\d+-c$/, "=s256-c");
    }

    // Absolute external URL
    if (/^https?:\/\//i.test(profileImage)) {
        return profileImage;
    }

    // Local uploaded image
    const sanitizedPath = profileImage.replace(/\.\./g, "").trim();
    const baseUrl = (import.meta.env.VITE_MEDIA_URL || "").replace(/\/$/, "");
    return `${baseUrl}${sanitizedPath}`;
};

const getInitials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

function Avatar({
    name,
    src,
    size = 16, // tailwind size (w-16 h-16 default)
    className = "",
    textClass = "text-blue-600 font-bold",
    bgClass = "bg-blue-100",
    alt,
}) {
    const imageUrl = resolveProfileImage(src);
    const dimension = `w-${size} h-${size}`;

    return (
        <div
            className={`${dimension} ${bgClass} rounded-full flex items-center justify-center overflow-hidden ${className}`}
            role="img"
            aria-label={alt || `${name || "User"} avatar`}
        >
            {src ? (
                <img
                    src={imageUrl}
                    alt={alt || `${name || "User"} profile`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = NotFound;
                    }}
                />
            ) : (
                <span className={`${textClass} text-lg`}>
                    {getInitials(name) || "U"}
                </span>
            )}
        </div>
    );
}

Avatar.propTypes = {
    name: PropTypes.string,
    src: PropTypes.string,
    size: PropTypes.number, // 8,10,12,16,20 etc (Tailwind scale)
    className: PropTypes.string,
    textClass: PropTypes.string,
    bgClass: PropTypes.string,
    alt: PropTypes.string,
};

export default memo(Avatar);