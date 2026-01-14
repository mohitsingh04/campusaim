import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
	Column,
	CourseProps,
	DashboardOutletContextProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import {
	Eye,
	FileBadge,
	GraduationCap,
	Library,
	LucideArchiveRestore,
	LucideIcon,
	Medal,
	Plus,
	Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
	getErrorResponse,
	getFieldDataSimple,
	getScoreStatus,
	getStatusColor,
	matchPermissions,
} from "../../contexts/Callbacks";
import Badge from "../../ui/badge/Badge";
import { Link, useOutletContext } from "react-router-dom";
import { colorsData } from "../../common/ExtraData";
import DashboardCard from "../../ui/cards/DashboardCard";
import { CircularProgress } from "../../ui/progress/CircularProgress";
import TableSkeletonWithCards from "../../ui/loadings/pages/TableSkeletonWithCards";

export function CourseDeleted() {
	const [allCourses, setAllCourses] = useState<CourseProps[]>([]);
	const [loading, setLoading] = useState(true);
	const { authUser, authLoading, categories } =
		useOutletContext<DashboardOutletContextProps>();

	const getAllCourses = useCallback(async () => {
		setLoading(true);
		try {
			const [courseResult, seoResult] = await Promise.allSettled([
				API.get("/course"),
				API.get("/all/seo?type=course"),
			]);

			if (courseResult.status === "fulfilled") {
				const finalData = courseResult.value.data.filter(
					(item: CourseProps) => item.isDeleted
				);

				let courses = finalData;
				if (seoResult.status === "fulfilled") {
					const seoData = seoResult.value.data;

					courses = finalData.map((course: any) => {
						const seoMatch = seoData.find(
							(seo: any) => seo.course_id === course._id
						);

						return {
							...course,
							seo_score: seoMatch ? seoMatch.seo_score : 0,
							course_trend: getScoreStatus(seoMatch ? seoMatch.seo_score : 0),
							course_type:
								categories?.find((cat) => cat?._id === course?.course_type)
									?.category_name || "N/A",
						};
					});
				}

				setAllCourses(courses);
			}
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, [categories]);

	useEffect(() => {
		getAllCourses();
	}, [getAllCourses]);

	const cardIcons: LucideIcon[] = [GraduationCap, Library, FileBadge, Medal];
	const cardData = getFieldDataSimple(allCourses, "course_type").map(
		(item, index) => ({
			title: item.title,
			value: item.value,
			icon: cardIcons[index % cardIcons.length],
			iconColor: colorsData[index % colorsData.length],
			percentage: Math.round((item?.value / (allCourses?.length || 1)) * 100),
		})
	);

	const handleRestore = useCallback(
		async (id: string) => {
			try {
				const result = await Swal.fire({
					title: "Are you sure?",
					text: "You want to restore this course?",
					icon: "warning",
					showCancelButton: true,
					confirmButtonColor: "#065f46",
					cancelButtonColor: "#3085d6",
					confirmButtonText: "Yes, Restore it!",
				});

				if (result.isConfirmed) {
					const response = await API.get(`/course/restore/${id}`);

					toast.success(response.data.message || "Recover successfully");
					getAllCourses();
				}
			} catch (error) {
				getErrorResponse(error);
			}
		},
		[getAllCourses]
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
					const response = await API.delete(`/course/${id}`);

					toast.success(response.data.message || "Deleted successfully");
					getAllCourses();
				}
			} catch (error) {
				getErrorResponse(error);
			}
		},
		[getAllCourses]
	);

	const columns = useMemo<Column<CourseProps>[]>(
		() => [
			{
				value: (row: CourseProps) => (
					<div className="flex gap-3">
						<div className="w-10 h-10">
							<img
								src={
									row?.image?.[0]
										? `${import.meta.env.VITE_MEDIA_URL}/course/${
												row?.image?.[0]
										  }`
										: "/img/default-images/ca-course.png"
								}
								alt={row?.course_name}
								className="w-10 h-10 rounded-full shadow-sm"
							/>
						</div>
						<div className="flex items-center">
							<Link
								to={`/dashboard/course/${row._id}`}
								className="font-semibold text-md"
							>
								{row?.course_name}
							</Link>
						</div>
					</div>
				),
				label: "Property",
				key: "property",
				sortingKey: "property_name",
			},
			{
				value: (row: CourseProps) => (
					<div>
						{!authLoading && (
							<>
								{matchPermissions(authUser?.permissions, "Read Course Seo") ? (
									<Link to={`/dashboard/course/${row?._id}/seo`}>
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
				value: (row: CourseProps) => <p>{row?.course_type}</p>,
				label: "Course Type",
				key: "course-type",
				sortingKey: "course_type",
			},
			{
				value: (row: CourseProps) => (
					<Badge label={row?.status} color={getStatusColor(row?.status)} />
				),
				label: "Status",
				key: "status",
				sortingKey: "status",
			},
			{
				label: "Actions",
				value: (row: CourseProps) => (
					<div className="flex space-x-2">
						{!authLoading && (
							<>
								{matchPermissions(authUser?.permissions, "Read Course") && (
									<TableButton
										Icon={Eye}
										color="blue"
										size="sm"
										buttontype="link"
										href={`/dashboard/course/${row._id}`}
									/>
								)}

								{matchPermissions(authUser?.permissions, "Restore Course") && (
									<TableButton
										Icon={LucideArchiveRestore}
										color="green"
										size="sm"
										buttontype="button"
										onClick={() => handleRestore(row._id)}
									/>
								)}

								{matchPermissions(authUser?.permissions, "Delete Course") && (
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
		const uniqueOptions = (field: keyof CourseProps) =>
			Array.from(
				new Set(
					allCourses
						.map((u) => u[field])
						.filter(Boolean)
						.map((v) => String(v))
				)
			);

		return [
			{
				label: "Course Type",
				columns: columns.map((c) => c.label),
				filterField: "course_type" as keyof CourseProps,
				options: uniqueOptions("course_type"),
			},
			{
				label: "Status",
				columns: columns.map((c) => c.label),
				filterField: "status" as keyof CourseProps,
				options: uniqueOptions("status"),
			},
			{
				label: "Top Courses",
				columns: columns.map((c) => c.label),
				filterField: "course_trend" as keyof CourseProps,
				options: uniqueOptions("course_trend"),
			},
		];
	}, [allCourses, columns]);

	if (loading) {
		return <TableSkeletonWithCards />;
	}

	return (
		<div className="space-y-6">
			<Breadcrumbs
				title="Archives Courses"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Course", path: "/dashboard/course" },
					{ label: "Archives" },
				]}
				extraButtons={[
					{
						label: "Create Course",
						path: "/dashboard/course/create",
						icon: Plus,
					},
				]}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{cardData.map((card, index) => (
					<DashboardCard
						key={index}
						title={card?.title}
						value={card?.value}
						iconColor={card?.iconColor}
						percentage={card?.percentage}
						icon={card?.icon}
					/>
				))}
			</div>

			<DataTable<CourseProps>
				data={allCourses}
				columns={columns}
				tabFilters={tabFilters}
				includeExportFields={[
					"course_name",
					"course_short_name",
					"course_type",
					"duration",
					"course_type",
				]}
			/>
		</div>
	);
}
