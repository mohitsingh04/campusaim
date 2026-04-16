// utils/normalizePhone.js

export const normalizeIndianPhone = (input) => {
    if (!input) return null;

    // remove everything except digits
    let digits = String(input).replace(/\D/g, "");

    // remove leading country code (91)
    if (digits.startsWith("91") && digits.length > 10) {
        digits = digits.slice(2);
    }

    // remove leading 0 if present
    if (digits.startsWith("0") && digits.length > 10) {
        digits = digits.slice(1);
    }

    // final validation: must be exactly 10 digits
    if (!/^[6-9]\d{9}$/.test(digits)) {
        return null;
    }

    return digits;
};