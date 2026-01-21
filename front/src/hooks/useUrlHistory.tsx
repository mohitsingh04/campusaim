"use client";

import { useEffect } from "react";

type StoredUrl = {
  origin: string;
  path: string;
  fullUrl: string;
};

export default function UrlHistoryTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const getCurrentUrl = (): StoredUrl => {
      const { origin, pathname, search, hash } = window.location;
      const path = pathname + search + hash;

      return {
        origin,
        path,
        fullUrl: origin + path,
      };
    };

    const safeParse = (value: string | null): StoredUrl | null => {
      if (!value) return null;

      try {
        const parsed = JSON.parse(value);
        if (
          parsed &&
          typeof parsed.origin === "string" &&
          typeof parsed.path === "string" &&
          typeof parsed.fullUrl === "string"
        ) {
          return parsed;
        }
        return null;
      } catch {
        return null;
      }
    };

    const saveHistory = () => {
      const current = getCurrentUrl();
      const storedCurrent = safeParse(
        sessionStorage.getItem("currentUrl")
      );

      if (!storedCurrent) {
        sessionStorage.setItem(
          "currentUrl",
          JSON.stringify(current)
        );
        return;
      }

      if (storedCurrent.fullUrl !== current.fullUrl) {
        sessionStorage.setItem(
          "previousUrl",
          JSON.stringify(storedCurrent)
        );
        sessionStorage.setItem(
          "currentUrl",
          JSON.stringify(current)
        );
      }
    };

    // Initial load / refresh / manual URL edit
    saveHistory();

    // Patch history API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args as any);
      saveHistory();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args as any);
      saveHistory();
    };

    window.addEventListener("popstate", saveHistory);

    // Clean ONLY on real tab close
    const handlePageHide = (event: any) => {
      if (!event.persisted && document.visibilityState === "hidden") {
        sessionStorage.removeItem("currentUrl");
        sessionStorage.removeItem("previousUrl");
      }
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", saveHistory);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return null;
}
