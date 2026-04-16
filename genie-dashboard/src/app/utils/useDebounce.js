import { useEffect, useState } from "react";

/**
 * Debounces any fast-changing value.
 * @param {any} value
 * @param {number} delay - ms
 */
export default function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        try {
            const timer = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => clearTimeout(timer); // 🔒 prevents stale updates
        } catch (err) {
            console.error("Debounce error:", err);
        }
    }, [value, delay]);

    return debouncedValue;
}