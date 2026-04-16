export const capitalizeWords = (value = "") => {
    return value
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const trimValue = (value = "") => value.trim();