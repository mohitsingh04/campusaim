import { useState, useEffect, useCallback } from "react";
import {
	Link,
	useNavigate,
	useOutletContext,
	useParams,
} from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { API } from "../../contexts/API";
import {
	CheckCircle,
	Trash2,
	GraduationCap,
	BookOpen,
	Settings,
	BadgeDollarSign,
	CalendarClock,
	CalendarDays,
	User,
	Percent,
	CreditCard,
	Users,
	Layers,
	Landmark,
	ScrollText,
	IndianRupee,
	Wallet,
	ExternalLink,
	Dumbbell,
	Shield,
	FileCheck,
	Edit2,
} from "lucide-react";
import {
	ScholarshipProps,
	DashboardOutletContextProps,
} from "../../types/types";
import Badge from "../../ui/badge/Badge";
import {
	getErrorResponse,
	getStatusColor,
	matchPermissions,
} from "../../contexts/Callbacks";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

interface InfoCardProps {
	icon: React.ElementType;
	title: string;
	value: React.ReactNode;
}

const InfoCard = ({ icon: Icon, title, value }: InfoCardProps) => (
	<div className="flex items-start p-4 bg-[var(--yp-secondary)] rounded-xl transition-colors duration-200">
		<Icon className="w-5 h-5 text-[var(--yp-main)] mr-4 mt-1 flex-shrink-0" />
		<div>
			<p className="text-sm font-medium text-[var(--yp-muted)] uppercase tracking-wider mb-1">
				{title}
			</p>
			<div className="text-[var(--yp-text-primary)] text-base font-semibold">
				{value}
			</div>
		</div>
	</div>
);

export default function ViewScholarship() {
	const { objectId } = useParams<{ objectId: string }>();
	const [scholarship, setScholarship] = useState<ScholarshipProps | null>(null);
	const { categories, authUser } =
		useOutletContext<DashboardOutletContextProps>();
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchScholarship = async () => {
			setLoading(true);
			if (!objectId) return;
			try {
				const res = await API.get(`/scholarship/${objectId}`);
				setScholarship(res.data);
			} catch (error) {
				getErrorResponse(error, true);
			} finally {
				setLoading(false);
			}
		};
		fetchScholarship();
	}, [objectId]);

	const handleDelete = useCallback(async (id: string) => {
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
				const response = await API.get(`/scholarship/${id}`);

				toast.success(response.data.message || "Deleted successfully");
				navigate(`/dashboard/scholarship`);
			}
		} catch (error) {
			getErrorResponse(error);
		}
	}, []);

	const getCategoryById = (id: string) => {
		const cat = categories.find((c: any) => c._id === id)?.category_name;
		return cat || id;
	};

	const getCategoryNames = (text: any) => {
		if (!text) return [];
		if (Array.isArray(text) && text.length > 0 && typeof text[0] === "object") {
			return text
				.map((b: any) => b.category_name || b.name || b._id)
				.filter(Boolean);
		}
		if (Array.isArray(text)) {
			return text.map((id: string) => getCategoryById(id));
		}
		if (typeof text === "string") {
			return [getCategoryById(text)];
		}
		return [];
	};

	const formatDateISO = (iso: any) => {
		if (!iso) return "N/A";
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return "N/A";
		return d.toISOString().split("T")[0]; // "2025-12-10"
	};

	if (loading) {
		return <ViewSkeleton />;
	}

	return (
		<div>
			<div className="mb-8">
				<Breadcrumbs
					title="Scholarship"
					breadcrumbs={[
						{ label: "Dashboard", path: "/dashboard" },
						{ label: "Scholarships", path: "/dashboard/scholarship" },
						{ label: scholarship?.scholarship_title || "Details" },
					]}
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[var(--yp-primary)] rounded-xl shadow-sm p-4">
				{/* Left: main content (2 columns on lg) */}
				<div className="lg:col-span-2 space-y-8">
					<section className="bg-[var(--yp-secondary)] rounded-xl p-6 transition-colors duration-200">
						<h2 className="text-2xl font-bold text-[var(--yp-text-primary)] mb-4 flex items-center gap-2">
							<GraduationCap className="w-6 h-6 text-[var(--yp-main)]" />
							{scholarship?.scholarship_title}
						</h2>
						<ReadMoreLess>
							{scholarship?.scholarship_description ||
								"No description provided."}
						</ReadMoreLess>
					</section>

					<section className="bg-[var(--yp-secondary)] rounded-xl p-6 transition-colors duration-200">
						<h2 className="text-2xl font-bold text-[var(--yp-text-primary)] mb-4 flex items-center gap-2">
							<BookOpen className="w-6 h-6 text-[var(--yp-main)]" />
							Qualification
						</h2>
						<ReadMoreLess>
							{scholarship?.qualification || "No description provided."}
						</ReadMoreLess>
					</section>
				</div>

				{/* Right: sidebar info cards */}
				<div className="lg:col-span-1">
					{/* stick the sidebar to top so it remains visible while scrolling */}
					<div className="space-y-4 sticky top-6">
						{/* Actions */}
						<InfoCard
							icon={Settings}
							title="Actions"
							value={
								<div className="flex flex-wrap gap-2">
									{matchPermissions(
										authUser?.permissions,
										"Update Scholarship"
									) && (
										<Link
											to={`/dashboard/scholarship/${scholarship?._id}/edit`}
											className="flex gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
										>
											<Edit2 className="w-5 h-5" />
											Edit
										</Link>
									)}

									{!scholarship?.isDeleted &&
										matchPermissions(
											authUser?.permissions,
											"Delete Scholarship"
										) && (
											<button
												type="button"
												className="flex gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
												onClick={() => handleDelete(scholarship?._id || "")}
											>
												<Trash2 className="w-5 h-5" />
												Delete
											</button>
										)}
								</div>
							}
						/>

						{/* Scholarship Type */}
						<InfoCard
							icon={BadgeDollarSign}
							title="Scholarship Type"
							value={
								getCategoryById(scholarship?.scholarship_type || "") || "N/A"
							}
						/>

						{/* Start / End */}
						<InfoCard
							icon={CalendarClock}
							title="Start Date"
							value={formatDateISO(scholarship?.start_date)}
						/>
						<InfoCard
							icon={CalendarDays}
							title="End Date"
							value={formatDateISO(scholarship?.end_date)}
						/>

						{/* Age Criteria */}
						<InfoCard
							icon={User}
							title="Age Criteria"
							value={
								<div className="flex flex-wrap gap-2">
									{scholarship?.age_criteria &&
									(scholarship?.age_criteria.min ??
										scholarship?.age_criteria.max) ? (
										scholarship?.age_criteria.min !== undefined &&
										scholarship?.age_criteria.max !== undefined ? (
											<Badge
												label={`${scholarship.age_criteria.min} - ${scholarship.age_criteria.max} yrs`}
												color="green"
											/>
										) : (
											<>
												{scholarship?.age_criteria.min !== undefined && (
													<Badge
														label={`Min: ${scholarship.age_criteria.min} yrs`}
														color="green"
													/>
												)}
												{scholarship?.age_criteria.max !== undefined && (
													<Badge
														label={`Max: ${scholarship.age_criteria.max} yrs`}
														color="green"
													/>
												)}
											</>
										)
									) : (
										<Badge label="No Age Criteria" color="gray" />
									)}
								</div>
							}
						/>

						{/* Marks */}
						<InfoCard
							icon={Percent}
							title="Marks"
							value={
								<div className="flex flex-wrap gap-2">
									{scholarship?.marks &&
									(scholarship?.marks.min ?? scholarship?.marks.max) ? (
										scholarship?.marks.min !== undefined &&
										scholarship?.marks.max !== undefined ? (
											<Badge
												label={`${scholarship.marks.min} - ${scholarship.marks.max} %`}
												color="green"
											/>
										) : (
											<>
												{scholarship?.marks.min !== undefined && (
													<Badge
														label={`Min: ${scholarship.marks.min} %`}
														color="green"
													/>
												)}
												{scholarship?.marks.max !== undefined && (
													<Badge
														label={`Max: ${scholarship.marks.max} %`}
														color="green"
													/>
												)}
											</>
										)
									) : (
										<Badge label="No Marks Criteria" color="gray" />
									)}
								</div>
							}
						/>

						{/* Card / Gender / Cast / Religion / Entrance / Location — safe join with fallback */}
						<InfoCard
							icon={CreditCard}
							title="Card"
							value={
								getCategoryNames(scholarship?.card || []).join(", ") || "N/A"
							}
						/>
						<InfoCard
							icon={Users}
							title="Gender"
							value={
								getCategoryNames(scholarship?.gender || []).join(", ") || "N/A"
							}
						/>
						<InfoCard
							icon={Layers}
							title="Cast"
							value={
								getCategoryNames(scholarship?.cast || []).join(", ") || "N/A"
							}
						/>
						<InfoCard
							icon={Landmark}
							title="Religion"
							value={
								getCategoryNames(scholarship?.religion || []).join(", ") ||
								"N/A"
							}
						/>
						<InfoCard
							icon={ScrollText}
							title="Entrance Exam"
							value={
								getCategoryNames(scholarship?.entrance_exam || []).join(", ") ||
								"N/A"
							}
						/>

						{/* Scholarship Amount */}
						<InfoCard
							icon={IndianRupee}
							title="Scholarship Amount"
							value={
								<div className="flex flex-wrap gap-2">
									{scholarship?.scholarship_amount &&
									Object.keys(scholarship.scholarship_amount).length > 0 ? (
										Object.entries(scholarship.scholarship_amount).map(
											([currency, value]) =>
												value !== undefined && value !== null ? (
													<Badge
														key={currency}
														label={`${currency}: ${value}`}
														color="green"
													/>
												) : null
										)
									) : (
										<Badge label="No Amount Info" color="gray" />
									)}
								</div>
							}
						/>

						{/* Annual Income */}
						<InfoCard
							icon={Wallet}
							title="Annual Income"
							value={
								<div className="flex flex-wrap gap-2">
									{scholarship?.annual_income &&
									Object.keys(scholarship.annual_income).length > 0 ? (
										Object.entries(scholarship.annual_income).map(
											([currency, value]) =>
												value !== undefined && value !== null ? (
													<Badge
														key={currency}
														label={`${currency}: ${value}`}
														color="green"
													/>
												) : null
										)
									) : (
										<Badge label="No Amount Info" color="gray" />
									)}
								</div>
							}
						/>

						{/* Scholarship Link (clickable) */}
						<InfoCard
							icon={ExternalLink}
							title="Scholarship Link"
							value={
								scholarship?.scholarship_link ? (
									<a
										href={scholarship.scholarship_link}
										target="_blank"
										rel="noreferrer"
										className="text-[var(--yp-blue-text)] underline"
									>
										Open Link
									</a>
								) : (
									"N/A"
								)
							}
						/>

						{/* Booleans */}
						<InfoCard
							icon={Dumbbell}
							title="Sports Quota"
							value={scholarship?.sports_quotas ? "Yes" : "No"}
						/>
						<InfoCard
							icon={Shield}
							title="Army Quota"
							value={scholarship?.army_quota ? "Yes" : "No"}
						/>
						<InfoCard
							icon={FileCheck}
							title="Scholarship Exam"
							value={scholarship?.scholarship_exam ? "Yes" : "No"}
						/>

						{/* Status */}
						<InfoCard
							icon={CheckCircle}
							title="Status"
							value={
								<Badge
									label={scholarship?.status || "N/A"}
									color={getStatusColor(scholarship?.status ?? "Inactive")}
								/>
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
