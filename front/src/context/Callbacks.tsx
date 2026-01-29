import { daysOfWeek } from "@/common/ExtraData";
import {
	PropertyCourseProps,
	PropertyReviewProps,
} from "@/types/PropertyTypes";
import {
	CourseProps,
	FieldDataSimple,
	WorkingHoursDataTypes,
} from "@/types/Types";
import { AxiosError, AxiosResponse } from "axios";
import { FormikProps } from "formik";
import { JSX } from "react";
import { toast } from "react-toastify";

export const generateSlug = (text: string): string => {
	return text
		?.toLowerCase()
		?.trim()
		?.replace(/[^a-z0-9\s-]/g, "")
		?.replace(/\s+/g, "-")
		?.replace(/-+/g, "-");
};

export const getAverageRating = (reviews?: { rating?: number }[]) => {
	if (!Array.isArray(reviews) || reviews.length === 0) return 0;
	const total = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
	return Number((total / reviews.length).toFixed(1)); // <— FIXED
};

export const getRatingDistribution = (reviews: PropertyReviewProps[]) => {
	if (!Array.isArray(reviews) || reviews.length === 0) {
		return [0, 0, 0, 0, 0];
	}

	const total = reviews.length;
	const distribution = [0, 0, 0, 0, 0];

	reviews.forEach((review) => {
		if ((review?.rating || 0) >= 1 && (review?.rating || 0) <= 5) {
			distribution[(review?.rating || 0) - 1]++;
		}
	});

	return distribution.map((count) =>
		total > 0 ? Math.round((count / total) * 100) : 0,
	);
};

export function extractKeywords(
	keywordObjects: ({ label?: string; value?: string } | string)[] = [],
): string[] {
	return keywordObjects
		.map((item) => {
			if (typeof item === "string") return item.trim();
			if (item && typeof item === "object") {
				return item.value?.trim() || item.label?.trim() || "";
			}
			return "";
		})
		.filter((v): v is string => v.length > 0)
		.slice(0, 2);
}

export function stripHtml(html: string, limit: number = 160): string {
	const text = html?.replace(/<[^>]+>/g, "").trim() || "";

	if (text.length > limit) {
		return text.slice(0, limit) + "...";
	}

	return text;
}
export function getFormikError<T>(
	formik: FormikProps<T>,
	field: keyof T,
): JSX.Element | null {
	const touched = formik.touched[field];
	const error = formik.errors[field];

	if (touched && typeof error === "string") {
		return (
			<div className="inline-flex">
				<p className="text-(--danger) bg-(--danger-subtle) rounded-custom px-2 py-1 text-xs mt-1">
					{error}
				</p>
			</div>
		);
	}

	return null;
}

export const getErrorResponse = (error: unknown, hide = false): void => {
	const err = error as AxiosError<{ error?: string; message?: string }>;

	if (!hide) {
		toast.error(
			err?.response?.data?.error ||
				err?.response?.data?.message ||
				err?.message ||
				"Failed To Process Your Request",
		);
	}

	console.error(
		err?.response?.data?.error ||
			err?.response?.data?.message ||
			err?.message ||
			error,
	);
};

export const getSuccessResponse = (response: unknown, hide = false): void => {
	const res = response as AxiosResponse<{ message: string }>;
	if (!hide) {
		toast.success(res?.data?.message || "Successfully Done Your Request");
	}
	console.log(res?.data?.message || res);
};
export const transformWorkingHours = (data: WorkingHoursDataTypes) => {
	return daysOfWeek.map((day) => {
		const key = day.toLowerCase() as keyof WorkingHoursDataTypes;

		const open = data?.[key]?.open || "";
		const close = data?.[key]?.close || "";

		return {
			day, // "Monday", "Tuesday"...
			openTime: open,
			closeTime: close,
			isOpen: !!(open && close),
		};
	});
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

export const isDateActive = (
	startDate: string | Date,
	endDate: string | Date,
): boolean => {
	const now = new Date();
	const start = new Date(startDate);
	const end = new Date(endDate);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

	return now >= start && now <= end;
};
export const isDateEnded = (endDate: string | Date): boolean => {
	const now = new Date();

	// CLONE the date (critical fix)
	const end = new Date(
		typeof endDate === "string" ? endDate : endDate.getTime(),
	);

	return now > end ? false : true;
};

export const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export const formatTime = (dateString: string) => {
	return new Date(dateString).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
};

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

export const mergeCourseData = (
	propertyCourses: PropertyCourseProps[],
	courses: CourseProps[],
) => {
	return propertyCourses.map((pc) => {
		const matchingCourse = courses.find((c) => c._id === pc.course_id);
		if (!matchingCourse) return pc;
		const merged = { ...pc };
		for (const key in matchingCourse) {
			if (!(key in pc)) {
				merged[key] = matchingCourse[key];
			}
		}
		return merged;
	});
};

export const safeArray = (data: any) => {
	if (!data) return [];

	if (Array.isArray(data)) return data;

	if (Array.isArray(data.data)) return data.data;

	if (Array.isArray(data.results)) return data.results;

	if (typeof data === "object") return Object.values(data);

	return [];
};
export const getUserAvatar = (images: string[]) => {
	const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;

	const avatarUrl = images?.[0]
		? images[0].startsWith("http")
			? images[0]
			: mediaUrl
				? `${mediaUrl}${images[0]}`
				: `/img/default-images/yp-user.webp` // fallback if no env
		: "/img/default-images/yp-user.webp";

	return avatarUrl;
};

export function getFieldDataSimple<T>(data: T[], field: keyof T): string[] {
	return Array.from(
		new Set(
			data
				.map((item) => item[field])
				.filter((v) => v !== null && v !== undefined && v !== "")
				.map(String),
		),
	);
}

export function calculateDuration(start: string, end: string) {
	if (!start || !end) return "-";

	const startDate = new Date(`2024-01-01T${start}`);
	const endDate = new Date(`2024-01-01T${end}`);

	const diff = (endDate.getTime() - startDate.getTime()) / 1000 / 60; // minutes
	if (diff <= 0) return "-";

	const hrs = Math.floor(diff / 60);
	const mins = diff % 60;

	if (mins === 0) return `${hrs} hours`;
	return `${hrs}h ${mins}m`;
}

export function getFieldDataSimpleWithCount<T>(
	data: T[],
	field: keyof T,
): FieldDataSimple[] {
	const uniqueValues = Array.from(
		new Set(data.map((item) => item[field]).filter(Boolean)),
	);

	return uniqueValues.map((val) => ({
		title: String(val),
		value: data.filter((item) => item[field] === val).length,
	}));
}

export function shuffleArray<T>(array: T[]): T[] {
	const result = [...array];

	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}

	return result;
}

export const getInitials = (name: string) => {
	if (!name) return "NA";
	const parts = name.trim().split(" ");
	// If one name, take first 2 chars. If multiple, take first char of first and last name.
	if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

export const handleCopy = (text: string, type: string) => {
	navigator.clipboard.writeText(text);
	toast.success(`${type} copied!`);
};
