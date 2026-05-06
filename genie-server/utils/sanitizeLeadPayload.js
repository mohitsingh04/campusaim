export const sanitizePayload = (payload = {}) => {
    if (!payload || typeof payload !== "object") {
        return payload;
    }

    if (Array.isArray(payload)) {
        return payload.map((item) => sanitizePayload(item));
    }

    const cleaned = {};

    for (const [key, value] of Object.entries(payload)) {

        // Remove undefined
        if (value === undefined) {
            continue;
        }

        // Handle null
        if (value === null) {
            cleaned[key] = null;
            continue;
        }

        // Handle strings
        if (typeof value === "string") {
            const trimmed = value.trim();

            // Convert empty string -> null
            cleaned[key] = trimmed === "" ? null : trimmed;

            continue;
        }

        // Handle arrays
        if (Array.isArray(value)) {
            cleaned[key] = value
                .map((item) => sanitizePayload(item))
                .filter((item) => item !== undefined);

            continue;
        }

        // Handle nested objects
        if (typeof value === "object") {
            cleaned[key] = sanitizePayload(value);
            continue;
        }

        cleaned[key] = value;
    }

    return cleaned;
};