export const sanitizeEnum = (value, allowedValues = []) => {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    return allowedValues.includes(trimmed)
        ? trimmed
        : null;
};