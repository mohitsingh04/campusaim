export const detectLeadSource = (req = {}) => {
    try {
        const query = req.query || {};
        const referrer = req.headers?.referer || "";

        const utmSource = query.utm_source || "";
        const utmMedium = query.utm_medium || "";
        const utmCampaign = query.utm_campaign || "";

        /* -------- Platform Detection -------- */
        let platform = "website";
        let source = "direct";

        if (utmSource) {
            source = utmSource;
        }

        if (/facebook/i.test(referrer) || utmSource === "facebook") {
            platform = "facebook";
            source = "facebook";
        } else if (/instagram/i.test(referrer) || utmSource === "instagram") {
            platform = "instagram";
            source = "instagram";
        } else if (/google/i.test(referrer) || utmSource === "google") {
            platform = "google";
            source = "google";
        } else if (/linkedin/i.test(referrer)) {
            platform = "linkedin";
            source = "linkedin";
        } else if (/youtube/i.test(referrer)) {
            platform = "youtube";
            source = "youtube";
        }

        /* -------- Medium Detection -------- */

        let medium = utmMedium || "";

        if (!medium) {
            if (/google/i.test(referrer)) medium = "organic";
            if (/facebook/i.test(referrer)) medium = "social";
        }

        return {
            platform,
            source,
            campaign: utmCampaign || "",
            medium,
            referrer,
            utm: {
                source: utmSource || "",
                medium: utmMedium || "",
                campaign: utmCampaign || "",
                term: query.utm_term || "",
                content: query.utm_content || "",
            },
        };
    } catch {
        return {
            platform: "website",
            source: "direct",
            campaign: "",
            medium: "",
            referrer: "",
            utm: {},
        };
    }
};