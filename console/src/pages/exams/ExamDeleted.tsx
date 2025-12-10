import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
	Column,
	ExamProps,
	DashboardOutletContextProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Eye, LucideArchiveRestore, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
	getErrorResponse,
	getScoreStatus,
	getStatusColor,
	matchPermissions,
} from "../../contexts/Callbacks";
import Badge from "../../ui/badge/Badge";
import { Link, useOutletContext } from "react-router-dom";
import { CircularProgress } from "../../ui/progress/CircularProgress";
import TableSkeletonWithCards from "../../ui/loadings/pages/TableSkeletonWithCards";

export default function ExamDeleted() {
	const [allExams, setAllExams] = useState<ExamProps[]>([]);
	const [loading, setLoading] = useState(true);
	const { authUser, authLoading, categories } =
		useOutletContext<DashboardOutletContextProps>();

	const getAllExams = useCallback(async () => {
		setLoading(true);
		try {
			const [examResult, seoResult] = await Promise.allSettled([
				API.get("/exam"),
				API.get("/all/seo?type=exam"),
			]);

			if (examResult.status === "fulfilled") {
				const finalData = examResult.value.data.filter(
					(item: ExamProps) => item.isDeleted
				);

				let exams = finalData;
				if (seoResult.status === "fulfilled") {
					const seoData = seoResult.value.data;

					exams = finalData.map((exam: any) => {
						const seoMatch = seoData.find(
							(seo: any) => seo.exam_id === exam._id
						);

						return {
							...exam,
							seo_score: seoMatch ? seoMatch.seo_score : 0,
							exam_trend: getScoreStatus(seoMatch ? seoMatch.seo_score : 0),
							certification_type:
								categories?.find((cat) => cat?._id === exam?.certification_type)
									?.category_name || "N/A",
							exam_type:
								categories?.find((cat) => cat?._id === exam?.exam_type)
									?.category_name || "N/A",
							exam_level:
								categories?.find((cat) => cat?._id === exam?.exam_level)
									?.category_name || "N/A",
						};
					});
				}

				setAllExams(exams);
			}
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, [categories]);

	useEffect(() => {
		getAllExams();
	}, [getAllExams]);

	const handleRestore = useCallback(
		async (id: string) => {
			try {
				const result = await Swal.fire({
					title: "Are you sure?",
					text: "You want to restore this exam?",
					icon: "warning",
					showCancelButton: true,
					confirmButtonColor: "#065f46",
					cancelButtonColor: "#3085d6",
					confirmButtonText: "Yes, Restore it!",
				});

				if (result.isConfirmed) {
					const response = await API.get(`/exam/restore/${id}`);

					toast.success(response.data.message || "Exam restored successfully.");
					getAllExams();
				}
			} catch (error) {
				getErrorResponse(error);
			}
		},
		[getAllExams]
	);

	const handleDelete = useCallback(
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
					const response = await API.delete(`/exam/${id}`);

					toast.success(response.data.message || "Deleted successfully");
					getAllExams();
				}
			} catch (error) {
				getErrorResponse(error);
			}
		},
		[getAllExams]
	);

	const columns = useMemo<Column<ExamProps>[]>(
		() => [
			{
				value: (row: ExamProps) => (
					<div className="flex gap-3">
						<div className="w-10 h-10">
							<img
								src={
									row?.image?.[0]
										? `${import.meta.env.VITE_MEDIA_URL}/exam/${
												row?.image?.[0]
										  }`
										: "/img/default-images/yp-course.webp"
								}
								alt={row?.exam_name}
								className="w-10 h-10 rounded-full shadow-sm"
							/>
						</div>
						<div className="flex items-center">
							<Link
								to={`/dashboard/exam/${row._id}`}
								className="font-semibold text-md"
							>
								{row?.exam_name}
							</Link>
						</div>
					</div>
				),
				label: "Property",
				key: "property",
				sortingKey: "property_name",
			},
			{
				value: (row: ExamProps) => (
					<div>
						{!authLoading && (
							<>
								{matchPermissions(authUser?.permissions, "Read Exam Seo") ? (
									<Link to={`/dashboard/exam/${row?._id}/seo`}>
										<CircularProgress value={row?.seo_score || 0} />
									</Link>
								) : (
									<CircularProgress value={row?.seo_score || 0} />
								)}
							</>
						)}
					</div>
				),
				sortingKey: "seo_score",
				label: "SEO SCORE",
				key: "seo_score",
			},
			{
				value: (row: ExamProps) => (
					<Badge label={row?.status} color={getStatusColor(row?.status)} />
				),
				label: "Status",
				key: "status",
				sortingKey: "status",
			},
			{
				label: "Actions",
				value: (row: ExamProps) => (
					<div className="flex space-x-2">
						{!authLoading && (
							<>
								{matchPermissions(authUser?.permissions, "Read Exam") && (
									<TableButton
										Icon={Eye}
										color="blue"
										size="sm"
										buttontype="link"
										href={`/dashboard/exam/${row._id}`}
									/>
								)}

								{matchPermissions(authUser?.permissions, "Restore Exam") && (
									<TableButton
										Icon={LucideArchiveRestore}
										color="green"
										size="sm"
										tooltip="Restore Exam"
										buttontype="button"
										onClick={() => handleRestore(row._id)}
									/>
								)}

								{matchPermissions(authUser?.permissions, "Delete Exam") && (
									<TableButton
										Icon={Trash2}
										color="red"
										size="sm"
										buttontype="button"
										onClick={() => handleDelete(row._id)}
									/>
								)}
							</>
						)}
					</div>
				),
				key: "actions",
			},
		],
		[authLoading, authUser?.permissions, handleRestore]
	);

	const tabFilters = useMemo(() => {
		const uniqueOptions = (field: keyof ExamProps) =>
			Array.from(
				new Set(
					allExams
						.map((u) => u[field])
						.filter(Boolean)
						.map((v) => String(v))
				)
			);

		return [
			{
				label: "Certification Type",
				columns: columns.map((c) => c.label),
				filterField: "certification_type" as keyof ExamProps,
				options: uniqueOptions("certification_type"),
			},
			{
				label: "Status",
				columns: columns.map((c) => c.label),
				filterField: "status" as keyof ExamProps,
				options: uniqueOptions("status"),
			},
			{
				label: "Top Exams",
				columns: columns.map((c) => c.label),
				filterField: "exam_trend" as keyof ExamProps,
				options: uniqueOptions("exam_trend"),
			},
		];
	}, [allExams, columns]);

	if (loading) {
		return <TableSkeletonWithCards />;
	}

	return (
		<div className="space-y-6">
			<Breadcrumbs
				title="Archives Exams"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Exam", path: "/dashboard/Exam" },
					{ label: "Archives" },
				]}
				extraButtons={[
					{
						label: "Create Exam",
						path: "/dashboard/exam/create",
						icon: Plus,
					},
				]}
			/>

			<DataTable<ExamProps>
				data={allExams}
				columns={columns}
				tabFilters={tabFilters}
				includeExportFields={[
					"exam_name",
					"exam_short_name",
					"upcoming_exam_date",
					"result_date",
					"application_form_date",
					"youtube_link",
					"application_form_link",
					"exam_mode",
				]}
			/>
		</div>
	);
}
