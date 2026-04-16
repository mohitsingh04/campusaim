// Masks phone number and auto-prefixes +91 if it's a valid Indian mobile (starts with 9/8/7/6 and 10 digits)
// Security: strips all non-digits to avoid injection/format issues

export function maskPhone(phone = "") {
    try {
        if (!phone) return "—";

        // Keep digits only
        let digits = String(phone).replace(/\D/g, "");

        // If Indian mobile (10 digits starting with 9/8/7/6), prefix country code
        if (/^[6-9]\d{9}$/.test(digits)) {
            digits = `91${digits}`;
        }

        // If already has 91 prefix and total 12 digits, keep as-is
        // (e.g., 919876543210)

        if (digits.length < 6) {
            return digits.replace(/.(?=..)/g, "*");
        }

        const start = digits.slice(0, 2);
        const end = digits.slice(-2);
        const masked = "*".repeat(digits.length - 4);

        return `+${start}${masked}${end}`;
    } catch (error) {
        console.error("maskPhone error:", error);
        return "—";
    }
}
