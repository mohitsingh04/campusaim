/**
 * Standard Email Validation (RFC 5322 compliant regex)
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;

    // Performance-optimized regex for standard email formats
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return emailRegex.test(email.trim());
};

/**
 * Validates Indian Mobile Numbers
 * Supports: 10 digits starting with 6-9
 * @param {string|number} phone 
 * @returns {boolean}
 */
export const isValidIndianPhone = (phone) => {
    const digits = String(phone).replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(digits);
};