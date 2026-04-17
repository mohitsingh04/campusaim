const normalizeHeader = (header) => {
    if (!header || typeof header !== "string") return "";
    return header.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "");
};

const headerMap = {
    name: "name",
    email: "email",
    mobile: "contact",
    contact: "contact",
    mobilecontact: "contact",
    city: "city",
    state: "state",
    address: "address",
    pincode: "pincode",
    course: "preferences.courseName",
    percentage: "academics.percentage",
};

export const mapRowToLead = (row, user) => {
    try {
        const lead = {
            createdBy: user._id,
            source: "import",
            lastActivity: new Date(),
            preferences: {},
            academics: {},
        };

        if (!row || typeof row !== "object") return lead;

        for (const key of Object.keys(row)) {
            if (!key) continue; // guard

            const safeKey = normalizeHeader(key);
            const mappedPath = headerMap[safeKey];
            if (!mappedPath) continue;

            let value = row[key];

            if (typeof value === "string") {
                value = value.trim();
                if (value === "") value = undefined;
            }

            // Excel percentage: 0.60 -> 60
            if (safeKey === "percentage") {
                let num = Number(value);
                if (num > 0 && num <= 1) num *= 100;
                value = Number.isFinite(num) ? Math.round(num) : undefined;
            }

            if (mappedPath.includes(".")) {
                const [parent, child] = mappedPath.split(".");
                lead[parent] = lead[parent] || {};
                lead[parent][child] = value;
            } else {
                lead[mappedPath] = value;
            }
        }

        // Normalize phone
        if (lead.contact) {
            const digits = String(lead.contact).replace(/\D/g, "");
            lead.contact =
                digits.length === 12 && digits.startsWith("91")
                    ? digits.slice(2)
                    : digits;
        }

        if (lead.email) lead.email = String(lead.email).toLowerCase();

        return lead;
    } catch (e) {
        console.error("Mapper crash:", e);
        return {}; // never throw
    }
};