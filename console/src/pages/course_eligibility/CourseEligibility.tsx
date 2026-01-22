import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { Column, DashboardOutletContextProps } from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { CourseEligibilityValidation } from "../../contexts/ValidationsSchemas";
import { useOutletContext } from "react-router-dom";
import {
	getErrorResponse,
	getFormikError,
	matchPermissions,
} from "../../contexts/Callbacks";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";
import Swal from "sweetalert2";

export interface CourseEligibilityProps extends Record<string, unknown> {
	_id: string;
	course_eligibility: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export default function CourseEligibility() {
	const [courseEligibility, setCourseEligibility] = useState<CourseEligibilityProps[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingCourseEligibility, setEditingCourseEligibility] =
		useState<CourseEligibilityProps | null>(null);
	const { authUser, authLoading } =
		useOutletContext<DashboardOutletContextProps>();

	const getAllCourseEligibility = useCallback(async () => {
		setLoading(true);
		try {
			const response = await API.get("/course-eligibility/all");
			setCourseEligibility(response.data || []);
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getAllCourseEligibility();
	}, [getAllCourseEligibility]);

	// ✅ Create Formik
	const formik = useFormik({
		initialValues: {
			course_eligibility: "",
		},
		validationSchema: CourseEligibilityValidation,
		onSubmit: async (values, { resetForm }) => {
			try {
				const response = await API.post("/course-eligibility", values);
				toast.success(response.data.message || "Created successfully");
				resetForm();
				getAllCourseEligibility();
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	// ✅ Update Formik
	const editFormik = useFormik({
		enableReinitialize: true,
		initialValues: {
			course_eligibility: editingCourseEligibility?.course_eligibility || "",
		},
		validationSchema: CourseEligibilityValidation,
		onSubmit: async (values, { resetForm }) => {
			if (!editingCourseEligibility) return;
			try {
				const response = await API.patch(
					`/course-eligibility/${editingCourseEligibility._id}`,
					values,
				);
				toast.success(response.data.message || "Updated successfully");
				resetForm();
				setEditingCourseEligibility(null);
				getAllCourseEligibility();
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	const setHandleDelete = useCallback(
		async (id: string) => {
			try {
				const result = await Swal.fire({
					title: "Are you sure?",
					text: "Once deleted, you will not be able to recover this!",
					icon: "warning",
					showCancelButton: true,
					confirmButtonColor: "#d33",
					cancelButtonColor: "#3085d6",
					confirmButtonText: "Yes, delete it!",
				});

				if (result.isConfirmed) {
					const response = await API.delete(`/course-eligibility/${id}`);

					toast.success(response.data.message || "Deleted successfully");
					getAllCourseEligibility();
				}
			} catch (error) {
				getErrorResponse(error);
			}
		},
		[getAllCourseEligibility],
	);

	// ✅ Columns
	const columns = useMemo<Column<CourseEligibilityProps>[]>(
		() => [
			{ value: "course_eligibility", label: "Course Eligibility" },
			{
				label: "Actions",
				value: (row: CourseEligibilityProps) => (
					<div className="flex space-x-2">
						{!authLoading &&
							matchPermissions(authUser?.permissions, "Update Requirement") && (
								<>
									<TableButton
										Icon={Edit2}
										color="green"
										size="sm"
										buttontype="button"
										onClick={() => setEditingCourseEligibility(row)}
									/>
									<TableButton
										Icon={Trash2}
										color="red"
										size="sm"
										buttontype="button"
										onClick={() => setHandleDelete(row._id)}
									/>
								</>
							)}
					</div>
				),
				key: "actions",
			},
		],
		[authLoading, authUser?.permissions],
	);

	if (loading) {
		return <TableSkeletonWithOutCards />;
	}

	return (
		<div>
			<Breadcrumbs
				title="Course Eligibility"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Course Eligibility" },
				]}
			/>

			{/* ✅ Create Course Eligibility Form */}
			<div className="bg-[var(--yp-primary)] p-4 sm:p-6 rounded-2xl shadow-sm mb-5">
				<h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[var(--yp-text-secondary)]">
					Create Course Eligibility
				</h3>
				<form
					onSubmit={formik.handleSubmit}
					className="flex flex-col sm:flex-row gap-3"
				>
					<label htmlFor="create_course_eligibility" className="sr-only">
						Course Eligibility
					</label>
					<input
						type="text"
						id="create_course_eligibility"
						name="course_eligibility"
						placeholder="Enter Course Eligibility"
						value={formik.values.course_eligibility}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
					/>
					<button
						type="submit"
						disabled={formik.isSubmitting}
						className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-text-primary)] bg-[var(--yp-secondary)]"
					>
						Add
					</button>
				</form>
				{getFormikError(formik, "course_eligibility")}
			</div>

			{/* ✅ Data Table */}
			<DataTable<CourseEligibilityProps> data={courseEligibility} columns={columns} />

			{/* ✅ Edit Modal */}
			{editingCourseEligibility && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-[var(--yp-primary)] p-6 rounded-xl shadow-sm w-full max-w-md">
						<h3 className="text-lg font-semibold text-[var(--yp-text-secondary)] mb-4">
							Edit Course Eligibility
						</h3>
						<form
							onSubmit={editFormik.handleSubmit}
							className="flex flex-col gap-4"
						>
							<label htmlFor="edit_course_eligibility" className="sr-only">
								Edit Course Eligibility
							</label>
							<input
								type="text"
								id="edit_course_eligibility"
								name="course_eligibility"
								placeholder="Enter Course Eligibility"
								value={editFormik.values.course_eligibility}
								onChange={editFormik.handleChange}
								onBlur={editFormik.handleBlur}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(editFormik, "course_eligibility")}

							<div className="flex justify-end gap-3">
								<button
									type="button"
									onClick={() => setEditingCourseEligibility(null)}
									className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-text-primary)] bg-[var(--yp-secondary)]"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={editFormik.isSubmitting}
									className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
								>
									Update
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
