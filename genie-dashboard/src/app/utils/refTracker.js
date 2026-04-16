const REF_KEY = "ref_data";
const REF_EXPIRY = 30 * 60 * 1000; // 30 minutes
// const REF_EXPIRY = 1 * 60 * 1000; // 30 minute for testing

// ✅ Capture ref from URL → store in sessionStorage
export const captureRefFromURL = () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get("ref");

        if (!ref) return;

        const existing = sessionStorage.getItem(REF_KEY);

        // ✅ First-touch only
        if (!existing) {
            const data = {
                ref,
                timestamp: Date.now(),
            };

            sessionStorage.setItem(REF_KEY, JSON.stringify(data));
        }
    } catch (err) {
        console.error("Ref capture error:", err);
    }
};

// ✅ Get valid ref (with expiry check)
export const getValidRef = () => {
    try {
        const stored = sessionStorage.getItem(REF_KEY);
        if (!stored) return null;

        const data = JSON.parse(stored);

        // ❌ invalid structure
        if (!data?.ref || !data?.timestamp) {
            sessionStorage.removeItem(REF_KEY);
            return null;
        }

        const isExpired = Date.now() - data.timestamp > REF_EXPIRY;

        if (isExpired) {
            sessionStorage.removeItem(REF_KEY);
            return null;
        }

        return data.ref;
    } catch (err) {
        console.error("Ref read error:", err);
        sessionStorage.removeItem(REF_KEY);
        return null;
    }
};

// ✅ Optional: clear after conversion
export const clearRef = () => {
    sessionStorage.removeItem(REF_KEY);
};