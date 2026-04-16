export const scrollToTop = (behavior = "smooth") => {
    try {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, left: 0, behavior });
        }
    } catch (error) {
        console.error("ScrollToTop Error:", error);
    }
};