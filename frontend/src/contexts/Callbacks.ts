import {
  AllDegreeAndInstituteProps,
  AllLanaguagesProps,
  AllSkillsProps,
  PropertyProps,
} from "@/types/types";

type WorkingHoursPerDay = {
  open?: string;
  close?: string;
};

type WorkingHoursData = {
  [day in
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"]?: WorkingHoursPerDay;
};
export function formatDateTime(dateString: string | Date) {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString("en-IN", { month: "short" });
  const year = date.getFullYear();

  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    day,
    month,
    year,
    time,
  };
}
export const stripHtmlAndLimit = (html: string, limit = 180) => {
  const tempDiv = document?.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
};
export const stripHtmlNoLimit = (html: string) => {
  const tempDiv = document?.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text;
};

export const getAverageRating = (reviews?: { rating?: number }[]) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  return (total / reviews.length).toFixed(1);
};
export const transformWorkingHours = (data: WorkingHoursData) => {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;

  return days
    .map((day) => {
      const open = data?.[day]?.open || "";
      const close = data?.[day]?.close || "";

      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        openTime: open,
        closeTime: close,
        isOpen: !!(open && close),
      };
    })
    .filter((item) => item.isOpen); // keep only open days
};

export const formatTo12Hour = (time: string) => {
  if (!time) return "";
  const [hourStr, minuteStr] = time?.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
export const formatDateWithTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true, // set false for 24-hour format
  });
};

export const generateSlug = (text: string): string => {
  return text
    ?.toLowerCase()
    ?.trim()
    ?.replace(/[^a-z0-9\s-]/g, "")
    ?.replace(/\s+/g, "-")
    ?.replace(/-+/g, "-");
};
export const generateSlugNonLowerCase = (text: string): string => {
  return text
    ?.trim()
    ?.replace(/[^a-zA-Z0-9\s-]/g, "")
    ?.replace(/\s+/g, "-")
    ?.replace(/-+/g, "-");
};

export const getLanguageNameById = (
  id: number,
  allLanguages: AllLanaguagesProps[]
) => {
  const language = allLanguages?.find(
    (item) => Number(item.uniqueId) === Number(id)
  );
  return language?.language;
};

export const getSkillNameById = (id: number, allSKills: AllSkillsProps[]) => {
  const skill = allSKills?.find((item) => Number(item.uniqueId) === Number(id));
  return skill?.skill;
};

export const getPropertyDetails = (id: number, properties: PropertyProps[]) => {
  const property = properties.find(
    (item) => Number(item?.uniqueId) === Number(id)
  );
  return property;
};

export const getDegreeById = (
  id: number,
  allDegreeAndInst: AllDegreeAndInstituteProps
) => {
  const degree = allDegreeAndInst?.degree?.find(
    (item) => Number(item?.uniqueId) === Number(id)
  );
  return degree?.degree_name;
};
export const getInstituteById = (
  id: number,
  allDegreeAndInst: AllDegreeAndInstituteProps
) => {
  const institute = allDegreeAndInst?.institute?.find(
    (item) => Number(item?.uniqueId) === Number(id)
  );
  return institute?.institute_name;
};

export const formatToMonthInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function extractKeywords(
  keywordObjects: ({ label?: string; value?: string } | string)[] = []
): string[] {
  return keywordObjects
    .map((item) => {
      if (typeof item === "string") return item.trim(); // handle ["yoga", "meditation"]
      if (item && typeof item === "object") {
        return item.value?.trim() || item.label?.trim() || ""; // handle [{label,value}]
      }
      return "";
    })
    .filter((v): v is string => v.length > 0)
    .slice(0, 2);
}

export function stripHtml(html: string, limit: number = 160): string {
  const text = html?.replace(/<[^>]+>/g, "").trim() || "";

  if (text.length > limit) {
    return text.slice(0, limit) + "..."; // optional ellipsis
  }

  return text;
}
export function maskSensitive(input?: string | null): string {
  if (!input) return "N/A"; // handle undefined, null, or empty string

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) {
      return localPart[0] + "*".repeat(localPart.length - 1) + "@" + domain;
    }
    return (
      localPart[0] +
      "*".repeat(localPart.length - 2) +
      localPart[localPart.length - 1] +
      "@" +
      domain
    );
  };

  const maskMobile = (str: string) => {
    const cleaned = str.startsWith("+") ? str.slice(1) : str;
    if (cleaned.length <= 4) {
      return "*".repeat(cleaned.length);
    }
    return "*".repeat(cleaned.length - 4) + cleaned.slice(-4);
  };

  const maskGeneric = (str: string) => {
    if (str.length <= 2)
      return str[0] + "*".repeat(Math.max(0, str.length - 1));
    return str[0] + "*".repeat(str.length - 2) + str.slice(-1);
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailPattern.test(input)) {
    return maskEmail(input);
  }

  const mobilePattern = /^\+?\d{10,15}$/;
  if (mobilePattern.test(input)) {
    return maskMobile(input);
  }

  return maskGeneric(input);
}
