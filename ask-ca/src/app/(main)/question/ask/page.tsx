"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import { API } from "@/services/api";
import QuestionSkeleton from "@/components/common/Skeleton/QuestionSkeleton";
import { AxiosError } from "axios";
import dynamic from "next/dynamic";
import { getEditorConfig } from "@/config/JoditEditorConfig";
import { FaHome } from "react-icons/fa";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
import Select from "react-select";

type Category = {
	_id: string;
	category_name: string;
	parent_category?: string;
};

type Question = {
	_id: string;
	title: string;
	description: string;
	createdAt: string;
	slug: string;
};

type Answer = {
	_id: string;
	question: string;
};

type FormValues = {
	category: string[];
	title: string;
	description: string;
};

function toDatetimeLocal(date: Date) {
	// Converts a Date to yyyy-MM-ddTHH:mm for input[type="datetime-local"]
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

export default function AskQuestion() {
	const router = useRouter();
	const editorConfig = useMemo(() => getEditorConfig(), []);

	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [questionList, setQuestionList] = useState<Question[]>([]);
	const [answerList, setAnswerList] = useState<Answer[]>([]);
	const [suggestions, setSuggestions] = useState<Question[]>([]);

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const [categoryRes, questionRes, answerRes] = await Promise.all([
				API.get("/category"),
				API.get("/questions"),
				API.get("/answers"),
			]);

			const categories = (categoryRes?.data ?? []) as Category[];
			const filteredCategory = categories.filter(
				(a) => a.parent_category === "Ask"
			);

			setCategoryList(filteredCategory || []);
			setQuestionList(((questionRes?.data?.data ?? []) as Question[]) || []);
			setAnswerList(((answerRes?.data ?? []) as Answer[]) || []);
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const getAnswerCount = (questionId: string): number => {
		return answerList.filter((a) => a.question === questionId).length;
	};

	const initialDate = toDatetimeLocal(new Date());

	const initialValues: FormValues = {
		category: [],
		title: "",
		description: "",
	};

	const validationSchema = Yup.object({
		category: Yup.array().min(1, "At least one category is required."),
		title: Yup.string()
			.required("Title is required.")
			.min(2, "Title must contain at least 2 characters"),
	});

	const handleSubmit = async (values: FormValues) => {
		const toastId = toast.loading("Asking Question......");
		try {
			const response = await API.post("/questions", values);
			toast.success(
				(response?.data?.message as string) || "Question posted successfully!",
				{ id: toastId }
			);
			router.push("/");
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Failed to post question.");
			toast.dismiss(toastId);
		}
	};

	const formik = useFormik<FormValues>({
		initialValues,
		validationSchema,
		onSubmit: handleSubmit,
	});

	// update suggestions when title changes
	useEffect(() => {
		const term = formik.values.title.trim().toLowerCase();
		if (!term || term.length < 2) {
			setSuggestions([]);
			return;
		}
		const matched = questionList
			.filter((q) => q.title.toLowerCase().includes(term))
			.slice(0, 5);
		setSuggestions(matched);
	}, [formik.values.title, questionList]);

	const formatDate = (date: string | number | Date): string => {
		return new Date(date).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	if (isLoading) {
		return <QuestionSkeleton />;
	}

	return (
		<div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow space-y-5">
			{/* Breadcrumb */}
			<nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
				<ol className="inline-flex items-center space-x-1 md:space-x-2">
					<li className="inline-flex items-center">
						<Link
							href="/"
							className="inline-flex items-center text-gray-700 hover:text-purple-600"
						>
							<FaHome className="h-4 w-4 me-1" />
							Home
						</Link>
					</li>
					<li>
						<span className="mx-2 text-gray-400">/</span>
						<span className="text-gray-700 font-medium">Ask Question</span>
					</li>
				</ol>
			</nav>
			<form onSubmit={formik.handleSubmit}>
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
							"border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500",
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

					{/* Suggestions */}
					{suggestions.length > 0 && (
						<div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
							<ul className="divide-y divide-gray-100">
								{suggestions.map((s) => (
									<li key={s._id} className="p-2 hover:bg-gray-50 text-sm">
										<Link
											href={`/question/${s.slug}`}
											className="block text-purple-600 hover:underline"
											target="_blank"
											rel="noopener noreferrer"
										>
											<span className="text-purple-600 hover:underline">
												{s.title}
											</span>
											<span className="ml-2 text-gray-500 text-xs italic">
												Asked on: {formatDate(s.createdAt)}
											</span>
											<div>
												{getAnswerCount(s._id)}{" "}
												{getAnswerCount(s._id) === 1 ? "Answer" : "Answers"}
											</div>
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				{/* Description */}
				<div className="relative">
					<label
						htmlFor="description"
						className="block text-sm font-medium text-gray-700 mb-1 mt-3"
					>
						Question Description
					</label>
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

				{/* Category */}
				<div>
					<label
						htmlFor="category"
						className="block text-sm font-medium text-gray-700 mt-3"
					>
						Category
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
						className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
						disabled={formik.isSubmitting}
					>
						{formik.isSubmitting ? "Asking Question..." : "Ask Question"}
					</button>
				</div>
			</form>
		</div>
	);
}
