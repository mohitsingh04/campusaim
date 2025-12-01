import { useState, useEffect, useCallback } from "react";
import {
	Link,
	useNavigate,
	useOutletContext,
	useParams,
} from "react-router-dom";
import { FiBookOpen, FiAward } from "react-icons/fi";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { API } from "../../contexts/API";
import {
	CheckCircle,
	Trash2,
	BookMarked,
	Edit2,
	LucideArchiveRestore,
} from "lucide-react";
import { ExamProps, DashboardOutletContextProps } from "../../types/types";
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

export default function ExamView() {
	const { objectId } = useParams<{ objectId: string }>();
	const [exam, setExam] = useState<ExamProps | null>(null);
	const { categories, authUser } =
		useOutletContext<DashboardOutletContextProps>();
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchExam = async () => {
			setLoading(true);
			if (!objectId) return;
			try {
				const res = await API.get(`/exam/${objectId}`);
				setExam(res.data);
			} catch (error) {
				getErrorResponse(error, true);
			} finally {
				setLoading(false);
			}
		};
		fetchExam();
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
				const response = await API.get(`/exam/soft/${id}`);

				toast.success(response.data.message || "Deleted successfully");
				navigate(`/dashboard/exam`);
			}
		} catch (error) {
			getErrorResponse(error);
		}
	}, []);

	const handleRestore = useCallback(async (id: string) => {
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
				const response = await API.get(`/exam/restore/${id}`);

				toast.success(response.data.message || "Deleted successfully");
				navigate(`/dashboard/exam`);
			}
		} catch (error) {
			getErrorResponse(error);
		}
	}, []);

	const getCategoryById = (id: string) => {
		const cat = categories.find((c: any) => c._id === id)?.category_name;
		return cat || id;
	};

	if (loading) {
		return <ViewSkeleton />;
	}

	return (
		<div>
			<div className="mb-8">
				<Breadcrumbs
					title="Exam"
					breadcrumbs={[
						{ label: "Dashboard", path: "/dashboard" },
						{ label: "Exams", path: "/dashboard/exam" },
						{ label: exam?.exam_name || "Details" },
					]}
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[var(--yp-primary)] rounded-xl shadow-sm p-2 md:p-4">
				<div className="lg:col-span-2 space-y-8">
					<div className="relative rounded-2xl overflow-hidden shadow-sm ">
						<img
							src={
								exam?.image?.[0]
									? `${import.meta.env.VITE_MEDIA_URL}/exam/${exam?.image?.[0]}`
									: "/img/default-images/yp-course.webp"
							}
							alt={`${exam?.exam_name} image`}
							className="w-full aspect-video object-cover transition-transform duration-500"
						/>
					</div>

					<section className="bg-[var(--yp-secondary)] rounded-xl p-6 transition-colors duration-200">
						<h2 className="text-2xl font-bold text-[var(--yp-text-primary)] mb-4 flex items-center gap-2">
							<FiBookOpen className="w-6 h-6 text-[var(--yp-main)]" />
							{exam?.exam_name}
						</h2>
						<ReadMoreLess
							children={exam?.description || "No description provided."}
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
									{matchPermissions(authUser?.permissions, "Update Exam") && (
										<Link
											to={`/dashboard/exam/${exam?._id}/edit`}
											className="flex gap-2 px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
										>
											<Edit2 className="w-5 h-5" />
											Edit
										</Link>
									)}

									{!exam?.isDeleted
										? matchPermissions(
												authUser?.permissions,
												"Delete Exam"
										  ) && (
												<button
													className="flex gap-2 px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
													onClick={() => handleDelete(exam?._id || "")}
												>
													<Trash2 className="w-5 h-5" />
													Delete
												</button>
										  )
										: matchPermissions(
												authUser?.permissions,
												"Restore Exam"
										  ) && (
												<button
													className="flex gap-2 px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-yellow-text)] bg-[var(--yp-yellow-bg)]"
													onClick={() => handleRestore(exam?._id || "")}
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
							value={exam?.exam_short_name}
						/>
						<InfoCard
							icon={FiAward}
							title="Exam Mode"
							value={getCategoryById(exam?.exam_mode || "N/A")}
						/>
						<InfoCard
							icon={FiAward}
							title="Upcoming Exam Date"
							value={exam?.upcoming_exam_date || "N/A"}
						/>
						<InfoCard
							icon={FiAward}
							title="Result Date"
							value={exam?.result_date || "N/A"}
						/>
						<InfoCard
							icon={FiAward}
							title="Application Form Date"
							value={exam?.application_form_date || "N/A"}
						/>
						<InfoCard
							icon={FiAward}
							title="Youtube Link"
							value={exam?.youtube_link || "N/A"}
						/>
						<InfoCard
							icon={FiAward}
							title="Application Form Link"
							value={exam?.application_form_link || "N/A"}
						/>
						<InfoCard
							icon={FiAward}
							title="Exam Form Link"
							value={exam?.exam_form_link || "N/A"}
						/>
						<InfoCard
							icon={CheckCircle}
							title="Status"
							value={
								<Badge
									label={exam?.status}
									color={getStatusColor(exam?.status || "N/A")}
								/>
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
