"use client";

import { toast } from "react-hot-toast";
import { API } from "@/services/api";
import * as Yup from "yup";
import { useFormik, type FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import dynamic from "next/dynamic";
import { getEditorConfig } from "@/config/JoditEditorConfig";
import { useEffect, useMemo, useState } from "react";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
import Select from "react-select";

type Category = {
	_id: string;
	category_name: string;
	parent_category?: string;
};

type QuestionSummary = {
	_id: string;
	title: string;
	description: string;
	category: (string | Category)[];
};

type FormValues = {
	title: string;
	description: string;
	category: string[]; // always array of IDs for Formik/API
};

type QuestionFormProps = {
	questionId: string;
	initialData?: Partial<
		Pick<QuestionSummary, "title" | "description" | "category">
	>;
	onClose?: () => void;
};

// Helper to format date for datetime-local input
function toDatetimeLocal(date: Date) {
	const pad = (n: number) => n.toString().padStart(2, "0");
	return (
		date.getFullYear() +
		"-" +
		pad(date.getMonth() + 1) +
		"-" +
		pad(date.getDate()) +
		"T" +
		pad(date.getHours()) +
		":" +
		pad(date.getMinutes())
	);
}

export default function QuestionForm({
	questionId,
	initialData = {},
	onClose,
}: QuestionFormProps) {
	const router = useRouter();
	const editorConfig = useMemo(() => getEditorConfig(), []);

	const [categoryList, setCategoryList] = useState<Category[]>([]);

	const fetchData = async () => {
		try {
			const [categoryRes] = await Promise.all([API.get("/category")]);
			const categories = (categoryRes?.data ?? []) as Category[];
			const filteredCategory = categories.filter(
				(a) => a.parent_category === "Ask"
			);
			setCategoryList(filteredCategory || []);
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong.");
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const initialValues: FormValues = {
		title: initialData?.title ?? "",
		description: initialData?.description ?? "",
		category: initialData?.category
			? initialData.category.map((cat) =>
					typeof cat === "string" ? cat : cat._id
			  )
			: [],
	};

	const validationSchema = Yup.object({
		title: Yup.string()
			.required("Title is required.")
			.min(2, "Title must contain at least 2 characters"),
		category: Yup.array().min(1, "At least one category is required."),
	});

	const handleSubmit = async (
		values: FormValues,
		{ setSubmitting }: FormikHelpers<FormValues>
	) => {
		const toastId = toast.loading("Updating question...");
		try {
			const response = await API.patch(`/questions/${questionId}`, {
				title: values.title,
				description: values.description,
				category: values.category, // array of IDs
			});

			toast.success(
				response?.data?.message || "Question updated successfully!",
				{ id: toastId }
			);

			if (onClose) {
				onClose();
			} else {
				router.refresh();
			}
			window.location.reload();
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong.");
			toast.dismiss(toastId);
		} finally {
			setSubmitting(false);
		}
	};

	const formik = useFormik<FormValues>({
		initialValues,
		validationSchema,
		onSubmit: handleSubmit,
		// enableReinitialize: true,
	});

	return (
		<form onSubmit={formik.handleSubmit} className="mt-2 space-y-2">
			{/* Title */}
			<div className="relative">
				<label
					htmlFor="title"
					className="block text-sm font-medium text-gray-700"
				>
					Question Title
				</label>
				<input
					id="title"
					name="title"
					type="text"
					placeholder="Question Title"
					className={[
						"mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm",
						"border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
						formik.touched.title && formik.errors.title
							? "border-red-500 focus:ring-red-500 focus:border-red-500"
							: "",
					].join(" ")}
					value={formik.values.title}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					aria-invalid={Boolean(formik.touched.title && formik.errors.title)}
					aria-describedby="title-error"
				/>
				{formik.errors.title && formik.touched.title && (
					<p id="title-error" className="mt-1 text-sm text-red-600">
						{formik.errors.title}
					</p>
				)}
			</div>

			{/* Description */}
			<div className="relative">
				<label
					htmlFor="description"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Question Description
				</label>
				<div className="rounded-md border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition">
					<JoditEditor
						value={formik.values.description}
						config={editorConfig}
						onBlur={(description: string) =>
							formik.setFieldValue("description", description)
						}
						onChange={(description: string) =>
							formik.setFieldValue("description", description)
						}
					/>
				</div>
			</div>

			{/* Category */}
			<div>
				<label
					htmlFor="category"
					className="block text-sm font-medium text-gray-700 mt-3"
				>
					Categories
				</label>
				<Select
					isMulti
					name="category"
					options={categoryList.map((cat) => ({
						value: cat._id,
						label: cat.category_name,
					}))}
					value={categoryList
						.filter((cat) => formik.values.category.includes(cat._id))
						.map((cat) => ({ value: cat._id, label: cat.category_name }))}
					onChange={(selected) => {
						formik.setFieldValue(
							"category",
							selected.map((option) => option.value)
						);
					}}
				/>
				{formik.errors.category && formik.touched.category && (
					<p id="category-error" className="mt-1 text-sm text-red-600">
						{formik.errors.category}
					</p>
				)}
			</div>

			{/* Submit */}
			<div className="pt-2">
				<button
					type="submit"
					className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={formik.isSubmitting}
				>
					{formik.isSubmitting ? "Updating..." : "Update"}
				</button>

				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="ms-3 inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-300"
					>
						Cancel
					</button>
				)}
			</div>
		</form>
	);
}
