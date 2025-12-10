import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
	Column,
	ScholarshipProps,
	DashboardOutletContextProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
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

export default function AllScholarship() {
	const [allScholarships, setAllScholarships] = useState<ScholarshipProps[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const { authUser, authLoading, categories } =
		useOutletContext<DashboardOutletContextProps>();

	const getAllScholarship = useCallback(async () => {
		setLoading(true);
		try {
			const [scholarshipResult, seoResult] = await Promise.allSettled([
				API.get("/scholarship"),
				API.get("/all/seo?type=scholarship"),
			]);

			if (scholarshipResult.status === "fulfilled") {
				const finalData = scholarshipResult.value.data.filter(
					(item: ScholarshipProps) => !item.isDeleted
				);

				let scholarships = finalData;
				if (seoResult.status === "fulfilled") {
					const seoData = seoResult.value.data;

					scholarships = finalData.map((scholarship: any) => {
						const seoMatch = seoData.find(
							(seo: any) => seo.scholarship_id === scholarship._id
						);

						return {
							...scholarship,
							seo_score: seoMatch ? seoMatch.seo_score : 0,
							scholarship_trend: getScoreStatus(
								seoMatch ? seoMatch.seo_score : 0
							),
						};
					});
				}
				console.log(scholarships);

				setAllScholarships(scholarships);
			}
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, [categories]);

	useEffect(() => {
		getAllScholarship();
	}, [getAllScholarship]);

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
					const response = await API.delete(`/scholarship/${id}`);

					toast.success(response.data.message || "Deleted successfully");
					getAllScholarship();
				}
			} catch (error) {
				getErrorResponse(error);
			}
		},
		[getAllScholarship]
	);

	const columns = useMemo<Column<ScholarshipProps>[]>(
		() => [
			{
				value: (row: ScholarshipProps) => (
					<div className="flex gap-3">
						<div className="flex items-center">
							<Link
								to={`/dashboard/scholarship/${row._id}`}
								className="font-semibold text-md"
							>
								{row?.scholarship_title}
							</Link>
						</div>
					</div>
				),
				label: "Scholarship Title",
				key: "scholarship",
				sortingKey: "scholarship_title",
			},
			{
				value: (row: ScholarshipProps) => (
					<div>
						{!authLoading && (
							<>
								{matchPermissions(
									authUser?.permissions,
									"Read Scholarship Seo"
								) ? (
									<Link to={`/dashboard/scholarship/${row?._id}/seo`}>
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
				value: (row: ScholarshipProps) => (
					<Badge label={row?.status} color={getStatusColor(row?.status)} />
				),
				label: "Status",
				key: "status",
				sortingKey: "status",
			},
			{
				label: "Actions",
				value: (row: ScholarshipProps) => (
					<div className="flex space-x-2">
						{!authLoading && (
							<>
								{matchPermissions(
									authUser?.permissions,
									"Read Scholarship"
								) && (
									<TableButton
										Icon={Eye}
										color="blue"
										size="sm"
										buttontype="link"
										href={`/dashboard/scholarship/${row._id}`}
									/>
								)}

								{matchPermissions(
									authUser?.permissions,
									"Update Scholarship"
								) && (
									<TableButton
										Icon={Edit2}
										color="green"
										size="sm"
										buttontype="link"
										href={`/dashboard/scholarship/${row._id}/edit`}
									/>
								)}

								{matchPermissions(
									authUser?.permissions,
									"Delete Scholarship"
								) && (
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
		[authLoading, authUser?.permissions, handleDelete]
	);

	const tabFilters = useMemo(() => {
		const uniqueOptions = (field: keyof ScholarshipProps) =>
			Array.from(
				new Set(
					allScholarships
						.map((u) => u[field])
						.filter(Boolean)
						.map((v) => String(v))
				)
			);

		return [
			{
				label: "Status",
				columns: columns.map((c) => c.label),
				filterField: "status" as keyof ScholarshipProps,
				options: uniqueOptions("status"),
			},
			{
				label: "Seo Score",
				columns: columns.map((c) => c.label),
				filterField: "scholarship_trend" as keyof ScholarshipProps,
				options: uniqueOptions("scholarship_trend"),
			},
		];
	}, [allScholarships, columns]);

	if (loading) {
		return <TableSkeletonWithCards />;
	}

	return (
		<div className="space-y-6">
			<Breadcrumbs
				title="All Scholarships"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Scholarship" },
				]}
				extraButtons={[
					{
						label: "Create Scholarship",
						path: "/dashboard/scholarship/create",
						icon: Plus,
					},
				]}
			/>

			<DataTable<ScholarshipProps>
				data={allScholarships}
				columns={columns}
				tabFilters={tabFilters}
				includeExportFields={[
					"scholarship_title",
					"age_criteria",
					"qualification",
					"marks",
					"location",
					"card",
					"sports_quotas",
					"scholarship_description",
				]}
				searchFields={["scholarship_title"]}
			/>
		</div>
	);
}
