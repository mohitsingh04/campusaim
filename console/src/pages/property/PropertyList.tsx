import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
	Column,
	DashboardOutletContextProps,
	PropertyProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import {
	Building2,
	Eye,
	FileBadge,
	GraduationCap,
	Library,
	LucideIcon,
	LucideTrendingDown,
	LucideTrendingUp,
	Medal,
	Plus,
	Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Badge from "../../ui/badge/Badge";
import {
	generateSlug,
	getErrorResponse,
	getFieldDataSimple,
	getScoreStatus,
	getStatusColor,
	matchPermissions,
} from "../../contexts/Callbacks";
import { Link, useOutletContext } from "react-router-dom";
import { CircularProgress } from "../../ui/progress/CircularProgress";
import { colorsData } from "../../common/ExtraData";
import DashboardCard from "../../ui/cards/DashboardCard";
import TableSkeletonWithCards from "../../ui/loadings/pages/TableSkeletonWithCards";

export function PropertyList() {
	const [allProperties, setAllProperties] = useState<PropertyProps[]>([]);
	const [loading, setLoading] = useState(true);
	const { authUser, authLoading, categories } =
		useOutletContext<DashboardOutletContextProps>();

	const getAllProperties = useCallback(async () => {
		setLoading(true);
		try {
			// Run all requests in parallel
			const [propertyRes, locationRes, scoreRes, rankRes] =
				await Promise.allSettled([
					API.get("/property"),
					API.get("/locations"),
					API.get("/property/all/score"),
					API.get("/ranks"),
				]);

			if (propertyRes.status !== "fulfilled") throw propertyRes.reason;

			const properties = propertyRes.value.data;
			const locations =
				locationRes.status === "fulfilled" ? locationRes.value.data : [];
			const scores =
				scoreRes?.status === "fulfilled" ? scoreRes?.value?.data : [];
			const ranks = rankRes?.status === "fulfilled" ? rankRes?.value?.data : [];

			const finalData = properties?.map((item: PropertyProps) => {
				const matchedLocation = locations.find(
					(loc: any) => Number(loc?.property_id) === Number(item?.uniqueId)
				);

				const matchedScore = scores?.find(
					(sc: any) => sc?.property_id === item?._id
				);
				const matchedRank = ranks?.find(
					(sc: any) => sc?.property_id === item?._id
				);

				const matchedCategory = categories?.find(
					(cat: any) => cat?._id === item?.academic_type
				);
				const matchedPropertyType = categories?.find(
					(cat: any) => Number(cat?.uniqueId) === Number(item?.property_type)
				);

				return {
					_id: item?._id,
					rank: matchedRank?.rank ?? null,
					lastRank: matchedRank?.lastRank ?? null,
					property_logo: item?.property_logo,
					property_name: item?.property_name,
					category: matchedCategory?.category_name,
					status: item?.status,
					city: matchedLocation?.property_city ?? "",
					state: matchedLocation?.property_state ?? "",
					country: matchedLocation?.property_country ?? "",
					score: matchedScore?.property_score ?? 0,
					property_trend: getScoreStatus(matchedScore?.property_score ?? 0),
					createdAt: item?.createdAt,
					property_website: item?.property_website,
					property_mobile_no: item?.property_mobile_no,
					property_email: item?.property_email,
					property_type: matchedPropertyType?.category_name,
					property_url: `${import.meta.env.VITE_MAIN_URL}/${generateSlug(
						matchedCategory?.category_name || ""
					)}/${item?.property_slug}/overview`,
				};
			});

			const safeData = finalData
				?.map((item: any) => ({
					...item,
					rank: item?.rank ?? null,
				}))
				?.sort((a: any, b: any) => {
					if (a.rank == null && b.rank != null) return 1;
					if (a.rank != null && b.rank == null) return -1;
					return (a.rank ?? 0) - (b.rank ?? 0);
				});

			setAllProperties(safeData);
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, [categories]);

	useEffect(() => {
		getAllProperties();
	}, [getAllProperties]);

	const cardIcons: LucideIcon[] = [GraduationCap, Library, FileBadge, Medal];
	const cardData = getFieldDataSimple(allProperties, "category").map(
		(item, index) => ({
			title: item.title,
			value: item.value,
			icon: cardIcons[index % cardIcons.length],
			iconColor: colorsData[index % colorsData.length],
			percentage: Math.round((item?.value / (allProperties.length || 1)) * 100),
		})
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
					const response = await API.delete(`/property/${id}`);
					toast.success(response.data.message || "Deleted successfully");
					getAllProperties();
				}
			} catch (error) {
				getErrorResponse(error);
			}
		},
		[getAllProperties]
	);

	const columns = useMemo<Column<PropertyProps>[]>(
		() => [
			{
				value: (row: PropertyProps) => (
					<div className="flex gap-3">
						<div className="w-10 h-10">
							<img
								src={
									row?.property_logo?.[0]
										? `${import.meta.env.VITE_MEDIA_URL}/${
												row?.property_logo?.[0]
										  }`
										: "/img/default-images/yp-property-logo.webp"
								}
								alt={row?.property_name}
								className="w-10 h-10 rounded-full border border-[var(--yp-border-primary)]"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Link
								to={`/dashboard/property/${row._id}`}
								className="font-semibold"
							>
								{row?.property_name}
							</Link>
							<p className="text-xs">
								{row?.city} {row?.state} {row?.country}
							</p>
						</div>
					</div>
				),
				label: "Property",
				key: "property",
				sortingKey: "property_name",
			},
			{
				value: (row: PropertyProps) => (
					<div className="flex items-center gap-1">
						<p className="font-semibold">{row?.rank ?? "—"}</p>
						{row?.rank != null && row?.lastRank != null ? (
							row.rank < row.lastRank ? (
								<LucideTrendingUp className="w-5 h-5 text-green-500" />
							) : (
								<LucideTrendingDown className="w-5 h-5 text-red-500" />
							)
						) : null}
					</div>
				),
				sortingKey: "rank",
				label: "Rank",
				key: "rank",
			},
			{
				value: (row: PropertyProps) => (
					<Link to={`/dashboard/property/${row?._id}/analytics`}>
						<CircularProgress value={row?.score} />
					</Link>
				),
				sortingKey: "score",
				label: "Property SCORE",
				key: "property-score",
			},
			{
				value: (row: PropertyProps) => (
					<div className="flex gap-3">{row?.category}</div>
				),
				label: "Academic Type",
				key: "academic-type",
				sortingKey: "category",
			},
			{
				value: (row: PropertyProps) => (
					<Badge label={row?.status} color={getStatusColor(row?.status)} />
				),
				label: "Status",
				key: "status",
				sortingKey: "status",
			},
			{
				label: "Actions",
				value: (row: PropertyProps) => (
					<div className="flex space-x-2">
						{!authLoading && (
							<>
								{matchPermissions(authUser?.permissions, "Read Property") && (
									<TableButton
										Icon={Eye}
										color="blue"
										size="sm"
										buttontype="link"
										href={`/dashboard/property/${row._id}`}
									/>
								)}
								{matchPermissions(authUser?.permissions, "Delete Property") && (
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
		const uniqueOptions = (field: keyof PropertyProps) =>
			Array.from(
				new Set(
					allProperties
						.map((u) => u[field])
						.filter(Boolean)
						.map((v) => String(v))
				)
			);

		return [
			{
				label: "status",
				columns: columns.map((c) => c.label),
				filterField: "status" as keyof PropertyProps,
				options: uniqueOptions("status"),
			},
			{
				label: "Academic Type",
				columns: columns.map((c) => c.label),
				filterField: "category" as keyof PropertyProps,
				options: uniqueOptions("category"),
			},
			{
				label: "Property Type",
				columns: columns.map((c) => c.label),
				filterField: "property_type" as keyof PropertyProps,
				options: uniqueOptions("property_type"),
			},
			{
				label: "Country",
				columns: columns.map((c) => c.label),
				filterField: "country" as keyof PropertyProps,
				options: uniqueOptions("country"),
			},
			{
				label: "State",
				columns: columns.map((c) => c.label),
				filterField: "state" as keyof PropertyProps,
				options: uniqueOptions("state"),
			},
			{
				label: "City",
				columns: columns.map((c) => c.label),
				filterField: "city" as keyof PropertyProps,
				options: uniqueOptions("city"),
			},
			{
				label: "Top Properties",
				columns: columns.map((c) => c.label),
				filterField: "property_trend" as keyof PropertyProps,
				options: uniqueOptions("property_trend"),
			},
		];
	}, [allProperties, columns]);

	if (loading) {
		return <TableSkeletonWithCards />;
	}

	return (
		<div className="space-y-6">
			<Breadcrumbs
				title="All Properties"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Properties" },
				]}
				extraButtons={[
					{
						label: "Create Property",
						path: "/dashboard/property/create",
						icon: Plus,
					},
					{
						label: "Your Property",
						path: "/dashboard/property/your",
						icon: Building2,
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
						icon={card?.icon}
						percentage={card?.percentage}
					/>
				))}
			</div>

			<DataTable<PropertyProps>
				data={allProperties}
				columns={columns}
				tabFilters={tabFilters}
				searchFields={["property_name"]}
				includeExportFields={[
					"property_name",
					"property_email",
					"property_mobile_no",
					"property_website",
					"city",
					"state",
					"country",
					"property_url",
				]}
			/>
		</div>
	);
}
