import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { Column, DashboardOutletContextProps } from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { BestForValidation } from "../../contexts/ValidationsSchemas";
import { useOutletContext } from "react-router-dom";
import {
	getErrorResponse,
	getFormikError,
	matchPermissions,
} from "../../contexts/Callbacks";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";
import Swal from "sweetalert2";

export interface BestForProps extends Record<string, unknown> {
	_id: string;
	best_for: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export default function BestFor() {
	const [bestFor, setBestFor] = useState<BestForProps[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingBestFor, setEditingBestFor] = useState<BestForProps | null>(
		null,
	);
	const { authUser, authLoading } =
		useOutletContext<DashboardOutletContextProps>();

	const getAllBestFor = useCallback(async () => {
		setLoading(true);
		try {
			const response = await API.get("/best-for/all");
			setBestFor(response.data || []);
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getAllBestFor();
	}, [getAllBestFor]);

	// ✅ Create Formik
	const formik = useFormik({
		initialValues: {
			best_for: "",
		},
		validationSchema: BestForValidation,
		onSubmit: async (values, { resetForm }) => {
			try {
				const response = await API.post("/best-for", values);
				toast.success(response.data.message || "Created successfully");
				resetForm();
				getAllBestFor();
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	// ✅ Update Formik
	const editFormik = useFormik({
		enableReinitialize: true,
		initialValues: {
			best_for: editingBestFor?.best_for || "",
		},
		validationSchema: BestForValidation,
		onSubmit: async (values, { resetForm }) => {
			if (!editingBestFor) return;
			try {
				const response = await API.patch(
					`/best-for/${editingBestFor._id}`,
					values,
				);
				toast.success(response.data.message || "Updated successfully");
				resetForm();
				setEditingBestFor(null);
				getAllBestFor();
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
					const response = await API.delete(`/best-for/${id}`);

					toast.success(response.data.message || "Deleted successfully");
					getAllBestFor();
				}
			} catch (error) {
				getErrorResponse(error);
			}
		},
		[getAllBestFor],
	);

	// ✅ Columns
	const columns = useMemo<Column<BestForProps>[]>(
		() => [
			{ value: "best_for", label: "Best For" },
			{
				label: "Actions",
				value: (row: BestForProps) => (
					<div className="flex space-x-2">
						{!authLoading &&
							matchPermissions(authUser?.permissions, "Update Requirement") && (
								<>
									<TableButton
										Icon={Edit2}
										color="green"
										size="sm"
										buttontype="button"
										onClick={() => setEditingBestFor(row)}
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
				title="Best For"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Best For" },
				]}
			/>

			{/* ✅ Create Best For Form */}
			<div className="bg-[var(--yp-primary)] p-4 sm:p-6 rounded-2xl shadow-sm mb-5">
				<h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[var(--yp-text-secondary)]">
					Create Best For
				</h3>
				<form
					onSubmit={formik.handleSubmit}
					className="flex flex-col sm:flex-row gap-3"
				>
					<label htmlFor="create_best_for" className="sr-only">
						Best For
					</label>
					<input
						type="text"
						id="create_best_for"
						name="best_for"
						placeholder="Enter Best For"
						value={formik.values.best_for}
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
				{getFormikError(formik, "best_for")}
			</div>

			{/* ✅ Data Table */}
			<DataTable<BestForProps> data={bestFor} columns={columns} />

			{/* ✅ Edit Modal */}
			{editingBestFor && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-[var(--yp-primary)] p-6 rounded-xl shadow-sm w-full max-w-md">
						<h3 className="text-lg font-semibold text-[var(--yp-text-secondary)] mb-4">
							Edit Best For
						</h3>
						<form
							onSubmit={editFormik.handleSubmit}
							className="flex flex-col gap-4"
						>
							<label htmlFor="edit_best_for" className="sr-only">
								Edit Best For
							</label>
							<input
								type="text"
								id="edit_best_for"
								name="best_for"
								placeholder="Enter Best For"
								value={editFormik.values.best_for}
								onChange={editFormik.handleChange}
								onBlur={editFormik.handleBlur}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(editFormik, "best_for")}

							<div className="flex justify-end gap-3">
								<button
									type="button"
									onClick={() => setEditingBestFor(null)}
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
