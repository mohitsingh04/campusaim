import { useState, useEffect, useCallback } from "react";
import {
	Link,
	useNavigate,
	useOutletContext,
	useParams,
} from "react-router-dom";
import { FiBookOpen, FiClock, FiAward } from "react-icons/fi";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { API } from "../../contexts/API";
import {
	CheckCircle,
	Trash2,
	BookMarked,
	Edit2,
	LucideArchiveRestore,
} from "lucide-react";
import { CourseProps, DashboardOutletContextProps } from "../../types/types";
import Badge from "../../ui/badge/Badge";
import {
	getErrorResponse,
	getStatusColor,
	matchPermissions,
} from "../../contexts/Callbacks";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";
import { MdOutlinePendingActions } from "react-icons/md";
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

export default function CourseView() {
	const { objectId } = useParams<{ objectId: string }>();
	const [course, setCourse] = useState<CourseProps | null>(null);
	const { categories, authUser } =
		useOutletContext<DashboardOutletContextProps>();
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchCourse = async () => {
			setLoading(true);
			if (!objectId) return;
			try {
				const res = await API.get(`/course/${objectId}`);
				setCourse(res.data);
			} catch (error) {
				getErrorResponse(error, true);
			} finally {
				setLoading(false);
			}
		};
		fetchCourse();
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
				const response = await API.get(`/course/soft/${id}`);

				toast.success(response.data.message || "Deleted successfully");
				navigate(`/dashboard/course`);
			}
		} catch (error) {
			getErrorResponse(error);
		}
	}, []);

	const handleRestore = useCallback(async (id: string) => {
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

				toast.success(response.data.message || "Deleted successfully");
				navigate(`/dashboard/course`);
			}
		} catch (error) {
			getErrorResponse(error);
		}
	}, []);

	const getCategoryById = (id: string) => {
		const cat = categories.find((c: any) => c._id === id)?.category_name;
		return cat || id;
	};

	const getCategoryNamesFromBestFor = (bestFor: any) => {
		if (!bestFor) return [];
		if (
			Array.isArray(bestFor) &&
			bestFor.length > 0 &&
			typeof bestFor[0] === "object"
		) {
			return bestFor
				.map((b: any) => b.category_name || b.name || b._id)
				.filter(Boolean);
		}
		if (Array.isArray(bestFor)) {
			return bestFor.map((id: string) => getCategoryById(id));
		}
		if (typeof bestFor === "string") {
			return [getCategoryById(bestFor)];
		}
		return [];
	};

	if (loading) {
		return <ViewSkeleton />;
	}

	return (
		<div>
			<div className="mb-8">
				<Breadcrumbs
					title="Course"
					breadcrumbs={[
						{ label: "Dashboard", path: "/dashboard" },
						{ label: "Courses", path: "/dashboard/course" },
						{ label: course?.course_name || "Details" },
					]}
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[var(--yp-primary)] rounded-xl shadow-sm p-2 md:p-4">
				<div className="lg:col-span-2 space-y-8">
					<div className="relative rounded-2xl overflow-hidden shadow-sm ">
						<img
							src={
								course?.image?.[0]
									? `${import.meta.env.VITE_MEDIA_URL}/course/${
											course?.image?.[0]
									  }`
									: "/img/default-images/yp-course.webp"
							}
							alt={`${course?.course_name} image`}
							className="w-full aspect-video object-cover transition-transform duration-500"
						/>
					</div>

					<section className="bg-[var(--yp-secondary)] rounded-xl p-6 transition-colors duration-200">
						<h2 className="text-2xl font-bold text-[var(--yp-text-primary)] mb-4 flex items-center gap-2">
							<FiBookOpen className="w-6 h-6 text-[var(--yp-main)]" />
							{course?.course_name}
						</h2>
						<ReadMoreLess
							children={course?.description || "No description provided."}
						/>
					</section>

					<section className="bg-[var(--yp-secondary)] rounded-xl p-6 transition-colors duration-200">
						<h2 className="text-2xl font-bold text-[var(--yp-text-primary)] mb-4 flex items-center gap-2">
							<FiBookOpen className="w-6 h-6 text-[var(--yp-main)]" />
							Course Eligibility
						</h2>
						<ReadMoreLess
							children={
								course?.course_eligibility || "No description provided."
							}
						/>
					</section>
				</div>

				<div className="lg:col-span-1 space-y-4">
					<div className="space-y-4">
						<InfoCard
							icon={MdOutlinePendingActions}
							title="Actions"
							value={
								<div className="flex space-x-2">
									{matchPermissions(authUser?.permissions, "Update Course") && (
										<Link
											to={`/dashboard/course/${course?._id}/edit`}
											className="flex gap-2 px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
										>
											<Edit2 className="w-5 h-5" />
											Edit
										</Link>
									)}

									{!course?.isDeleted
										? matchPermissions(
												authUser?.permissions,
												"Delete Course"
										  ) && (
												<button
													className="flex gap-2 px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
													onClick={() => handleDelete(course?._id || "")}
												>
													<Trash2 className="w-5 h-5" />
													Delete
												</button>
										  )
										: matchPermissions(
												authUser?.permissions,
												"Restore Course"
										  ) && (
												<button
													className="flex gap-2 px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-yellow-text)] bg-[var(--yp-yellow-bg)]"
													onClick={() => handleRestore(course?._id || "")}
												>
													<LucideArchiveRestore className="w-5 h-5" />
													Restore
												</button>
										  )}
								</div>
							}
						/>
						<InfoCard
							icon={BookMarked}
							title="Short Name"
							value={course?.course_short_name}
						/>
						<InfoCard
							icon={FiAward}
							title="Specialization"
							value={getCategoryById(course?.specialization || "N/A")}
						/>
						<InfoCard
							icon={FiAward}
							title="Course Type"
							value={getCategoryById(course?.course_type || "N/A")}
						/>
						<InfoCard
							icon={FiAward}
							title="Program Type"
							value={(() => {
								const names = getCategoryNamesFromBestFor(course?.program_type);
								return names.length ? names.join(", ") : "N/A";
							})()}
						/>
						<InfoCard
							icon={FiClock}
							title="Duration"
							value={course?.duration || "N/A"}
						/>
						<InfoCard
							icon={FiAward}
							title="Best For"
							value={(() => {
								const names = getCategoryNamesFromBestFor(course?.best_for);
								return names.length ? names.join(", ") : "N/A";
							})()}
						/>
						<InfoCard
							icon={CheckCircle}
							title="Status"
							value={
								<Badge
									label={course?.status}
									color={getStatusColor(course?.status || "N/A")}
								/>
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
