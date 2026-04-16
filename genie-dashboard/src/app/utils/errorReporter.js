import { API } from "../services/API";

export const reportError = async (error) => {

    try {

        const message = error?.message || "";

        // ignore devtools & extensions
        if (
            message.includes("chrome-extension") ||
            message.includes("installHook") ||
            message.includes("react_devtools")
        ) {
            return;
        }

        await API.post("/error-logs", {
            message,
            stack: error.stack,
            page: window.location.pathname,
            browser: navigator.userAgent,
            timestamp: new Date().toISOString(),
        });

    } catch (err) {
        console.error("Error reporting failed", err);
    }

};