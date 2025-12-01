import { AxiosError } from "axios";
import { CategoryProps, ReviewProps, StatusProps } from "../types/types";
import toast from "react-hot-toast";
import { FormikProps } from "formik";

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "green";
    case "published":
      return "green";
    case "pending":
      return "yellow";
    case "suspended":
      return "red";
    case "drafted":
      return "red";
    default:
      return "blue";
  }
};

export const getAverageRating = (reviews: ReviewProps[]): string => {
  if (!reviews || reviews.length === 0) return "0.0";
  const sum = reviews.reduce((acc, review) => acc + (review?.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
};

export const timeAgo = (dateString: string) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  const seconds = diffMs / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const months = days / 30;
  const years = days / 365;

  if (seconds < 60) {
    return { value: Math.floor(seconds), type: "sec" };
  } else if (minutes < 60) {
    return { value: Math.floor(minutes), type: "min" };
  } else if (hours < 24) {
    return { value: Math.floor(hours), type: "hour" };
  } else if (days < 30) {
    return { value: Math.floor(days), type: "day" };
  } else if (months < 12) {
    return { value: parseFloat(months.toFixed(1)), type: "month" };
  } else {
    return { value: parseFloat(years.toFixed(1)), type: "year" };
  }
};

export const matchPermissions = (
  userPermissions: string[] = [],
  requiredPermissions: string
) => {
  const hasPermission =
    userPermissions?.some((item) => item === requiredPermissions) || false;
  return hasPermission;
};

interface FieldDataSimple {
  title: string;
  value: number;
}

export function getFieldDataSimple<T>(
  data: T[],
  field: keyof T
): FieldDataSimple[] {
  const uniqueValues = Array.from(
    new Set(data.map((item) => item[field]).filter(Boolean))
  );

  return uniqueValues.map((val) => ({
    title: String(val),
    value: data.filter((item) => item[field] === val).length,
  }));
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

export const getStatusAccodingToField = (
  allStatus: StatusProps[],
  field: string
) => {
  return allStatus.filter(
    (status) => status.name?.toLowerCase() === field.toLowerCase()
  );
};
export const getCategoryAccodingToField = (
  allCategories: CategoryProps[],
  field: string
) => {
  return allCategories.filter(
    (category) =>
      category.parent_category?.toLowerCase() === field.toLowerCase()
  );
};
export const formatToAmPm = (input: string | Date): string => {
  if (!input) return "";

  let date: Date;

  // Case 1: Already a Date object
  if (input instanceof Date) {
    date = input;
  }
  // Case 2: "HH:mm" format
  else if (/^\d{1,2}:\d{2}$/.test(input)) {
    const [hours, minutes] = input.split(":").map(Number);
    date = new Date();
    date.setHours(hours, minutes, 0, 0);
  } else {
    date = new Date(input);
  }

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;

  return `${h}:${minutes} ${ampm}`;
};

export const isEndTimeAfterStartTime = (start: string, end: string) => {
  if (!start || !end) return false;
  const startDate = new Date(`1970-01-01T${start}`);
  const endDate = new Date(`1970-01-01T${end}`);
  return endDate > startDate;
};

export function to12Hour(time: string) {
  if (!time) return "";

  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";

  const hour12 = hour % 12 || 12;

  return `${hour12}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateWithoutTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
export const formatDateToFormik = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  if (dateString.startsWith("+275760")) return "";

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const year = d.getUTCFullYear();
  if (year > 9999 || year < 1) return "";

  return d.toISOString().split("T")[0];
};
export function stripHtml(html: string) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.replace(/\s+/g, " ").trim(); // ✅ collapse multiple spaces/newlines into one
}

export const getErrorResponse = (error: unknown, hide = false): void => {
  const err = error as AxiosError<{ error?: string; message?: string }>;

  if (!hide) {
    toast.error(
      err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed To Process Your Request"
    );
  }

  console.error(
    err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      error
  );
};
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getScoreStatus = (score: number) => {
  const status =
    score <= 0
      ? "Very Poor"
      : score <= 30
      ? "Poor"
      : score <= 60
      ? "Fair"
      : score <= 90
      ? "Good"
      : score <= 100
      ? "Excellent"
      : "Poor";

  return status;
};
export const getPercentageColor = (value: number) => {
  if (value <= 30) return "red";
  if (value <= 60) return "blue";
  if (value <= 90) return "green";
  return "yellow";
};

export function getFormikError<T>(
  formik: FormikProps<T>,
  field: keyof T
): JSX.Element | null {
  const error =
    formik.touched[field] && typeof formik.errors[field] === "string"
      ? (formik.errors[field] as string)
      : null;

  return error ? (
    <div className="inline-flex">
      <p className="text-[var(--yp-error)] bg-[var(--yp-red-bg)] rounded px-2 py-1 text-xs mt-1">
        {error}
      </p>
    </div>
  ) : null;
}
