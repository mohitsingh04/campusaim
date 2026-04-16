export const getDateRange = (query = {}) => {
    const now = new Date();

    /* ---------- Custom Range ---------- */
    if (query.from && query.to) {
        const start = new Date(query.from);
        const end = new Date(query.to);

        if (isNaN(start) || isNaN(end)) {
            throw new Error("Invalid custom date range");
        }

        // normalize boundaries
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return { start, end };
    }

    /* ---------- Preset Range ---------- */
    const range = query.range || "30d";
    const start = new Date(now);

    switch (range) {
        case "7d":
            start.setDate(now.getDate() - 6);
            break;

        case "30d":
            start.setDate(now.getDate() - 29);
            break;

        case "90d":
            start.setDate(now.getDate() - 89);
            break;

        case "month":
            start.setDate(1);
            break;

        case "year":
            start.setMonth(0, 1);
            break;

        default:
            start.setDate(now.getDate() - 29);
    }

    /* Normalize boundaries */
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};