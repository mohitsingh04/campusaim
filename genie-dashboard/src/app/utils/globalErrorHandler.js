import { reportError } from "./errorReporter";

export const initGlobalErrorHandler = () => {

    // Runtime JS errors
    window.addEventListener("error", (event) => {

        const error = {
            message: event.message,
            stack: event.error?.stack || null,
            file: event.filename,
            line: event.lineno,
            column: event.colno,
        };

        reportError(error);

    });

    // Unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {

        const error = {
            message: event.reason?.message || "Unhandled Promise Rejection",
            stack: event.reason?.stack || null,
        };

        reportError(error);

    });

};