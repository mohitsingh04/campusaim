"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import { API } from "../../services/api";
import * as Yup from "yup";
import { useFormik, type FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getEditorConfig } from "@/config/JoditEditorConfig";
import { AxiosError } from "axios";

// Jodit isn't SSR-safe; load it only on the client
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

type Answer = {
	_id: string;
	content: string;
	createdAt?: string;
	updatedAt?: string;
};

type FormValues = {
	content: string;
};

type AnswerFormProps = {
	questionId?: string;
	answerId?: string;
	isEditing?: boolean;
	initialData?: Partial<Answer>;
	onClose?: () => void;
};

export default function AnswerForm({
	questionId,
	answerId,
	isEditing = false,
	initialData = {},
	onClose,
}: AnswerFormProps) {
	const router = useRouter();
	const editorConfig = useMemo(() => getEditorConfig(), []);
	const [answer, setAnswer] = useState<Partial<Answer>>(initialData);

	useEffect(() => {
		if (isEditing && answerId && !initialData?._id) {
			const fetchData = async () => {
				try {
					const response = await API.get(`/answers/${answerId}`);
					setAnswer(response.data);
				} catch (error) {
					console.error(error);
				}
			};
			fetchData();
		}
	}, [answerId, isEditing, initialData]);

	const validationSchema = Yup.object({
		content: Yup.string().required("Answer is required."),
	});

	const handleSubmit = async (
		values: FormValues,
		{ setSubmitting }: FormikHelpers<FormValues>
	) => {
		const toastId = toast.loading(
			isEditing ? "Updating Answer..." : "Submitting Answer..."
		);
		try {
			let response;
			if (isEditing && answerId) {
				response = await API.patch(`/answers/${answerId}`, {
					content: values.content,
				});
			} else {
				if (!questionId) {
					toast.error("Missing question id.");
					toast.dismiss(toastId);
					setSubmitting(false);
					return;
				}
				response = await API.post(`/answers/${questionId}`, {
					content: values.content,
				});
			}

			toast.success(
				response?.data?.message ||
					(isEditing
						? "Answer updated successfully."
						: "Answer posted successfully!"),
				{ id: toastId }
			);

			setSubmitting(false);

			if (onClose) {
				onClose();
			} else {
				router.refresh();
			}
			window.location.reload();
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err?.response?.data?.error || "Something went wrong.");
			toast.dismiss(toastId);
			setSubmitting(false);
		}
	};

	const formik = useFormik<FormValues>({
		initialValues: {
			content: (answer?.content as string) || "",
		},
		validationSchema,
		onSubmit: handleSubmit,
		// enableReinitialize: true,
	});

	return (
		<form onSubmit={formik.handleSubmit} className="space-y-2 mt-2">
			{/* Answer Content */}
			<div className="mb-4">
				<div
					className={[
						"rounded-md overflow-hidden mt-1",
						"border bg-white",
						formik.touched.content && formik.errors.content
							? "border-red-500"
							: "border-gray-200",
					].join(" ")}
				>
					<JoditEditor
						value={formik.values.content}
						config={editorConfig}
						onBlur={(content: string) =>
							formik.setFieldValue("content", content)
						}
						onChange={(content: string) =>
							formik.setFieldValue("content", content)
						}
					/>
				</div>
				{formik.errors.content && formik.touched.content && (
					<p className="mt-1 text-sm text-red-600">{formik.errors.content}</p>
				)}
			</div>

			{/* Button */}
			<div className="pt-2 flex gap-3">
				<button
					type="submit"
					disabled={formik.isSubmitting}
					className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50 transition"
				>
					{formik.isSubmitting
						? isEditing
							? "Updating..."
							: "Submitting..."
						: isEditing
						? "Update Answer"
						: "Submit Answer"}
				</button>

				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 transition"
					>
						Cancel
					</button>
				)}
			</div>
		</form>
	);
}
