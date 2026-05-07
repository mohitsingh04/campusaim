import { useState, useEffect, useCallback } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  Pencil,
  PlayCircle,
  RotateCcw,
  Trash2,
  BookOpen,
  Layers3,
  Sparkles,
  BadgeCheck,
} from "lucide-react";

import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { API } from "../../contexts/API";

import { ExamProps, DashboardOutletContextProps } from "../../types/types";

import Badge from "../../ui/badge/Badge";

import {
  formatDateWithoutTime,
  getErrorResponse,
  getStatusColor,
  matchPermissions,
} from "../../contexts/Callbacks";

import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";

import Swal from "sweetalert2";
import toast from "react-hot-toast";

interface DetailCardProps {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  className?: string;
}

const DetailCard = ({
  icon: Icon,
  title,
  value,
  className = "",
}: DetailCardProps) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl shadow-sm bg-[var(--yp-secondary)] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--yp-main)]/30 hover:shadow-xl ${className}`}
    >
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--yp-main)] text-[var(--yp-main-subtle)]">
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--yp-muted)]">
            {title}
          </p>

          <div className="break-words text-sm font-semibold text-[var(--yp-text-primary)] md:text-base">
            {value || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

interface LinkCardProps {
  title: string;
  link: string;
  icon: React.ElementType;
}

const LinkCard = ({ title, link, icon: Icon }: LinkCardProps) => {
  return (
    <a
      href={link || "#"}
      target="_blank"
      rel="noreferrer"
      className={`group flex items-center justify-between rounded-2xl bg-[var(--yp-secondary)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        !link ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--yp-main)] text-[var(--yp-main-subtle)]">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--yp-muted)]">
            {title}
          </p>

          <p className="line-clamp-1 text-sm font-semibold text-[var(--yp-text-primary)]">
            {link || "Not Available"}
          </p>
        </div>
      </div>

      <ExternalLink className="h-5 w-5 text-[var(--yp-muted)] transition-all duration-300 group-hover:text-[var(--yp-main)]" />
    </a>
  );
};

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

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const result = await Swal.fire({
          title: "Delete Exam?",
          text: "This exam will be moved to trash.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#dc2626",
          cancelButtonColor: "#64748b",
          confirmButtonText: "Delete",
        });

        if (result.isConfirmed) {
          const response = await API.get(`/exam/soft/${id}`);

          toast.success(response.data.message || "Exam deleted successfully");

          navigate("/dashboard/exam");
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [navigate],
  );

  const handleRestore = useCallback(
    async (id: string) => {
      try {
        const result = await Swal.fire({
          title: "Restore Exam?",
          text: "This exam will be restored.",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#059669",
          cancelButtonColor: "#64748b",
          confirmButtonText: "Restore",
        });

        if (result.isConfirmed) {
          const response = await API.get(`/exam/restore/${id}`);

          toast.success(response.data.message || "Exam restored successfully");

          navigate("/dashboard/exam");
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [navigate],
  );

  const getCategoryById = (id: string) => {
    const cat = categories.find((c: any) => c._id === id);

    return cat?.category_name || id;
  };

  if (loading) {
    return <ViewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Exam Details"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Exams", path: "/dashboard/exam" },
          { label: exam?.exam_name || "Exam Details" },
        ]}
      />

      <div className="overflow-hidden rounded-lg border border-[var(--yp-border)] bg-[var(--yp-primary)] shadow-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

          <img
            src={
              exam?.image?.[0]
                ? `${import.meta.env.VITE_MEDIA_URL}/exam/${exam?.image?.[0]}`
                : "/img/default-images/ca-exam.png"
            }
            alt={exam?.exam_name}
            className="h-[260px] w-full object-cover md:h-[360px]"
          />

          <div className="absolute bottom-0 left-0 z-20 w-full p-5 md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  {exam?.isDeleted && (
                    <span className="rounded-full bg-red-500/20 px-4 py-1 text-xs font-semibold text-red-200 backdrop-blur-md">
                      Deleted
                    </span>
                  )}
                </div>

                <h1 className="mb-3 text-3xl font-black tracking-tight text-white md:text-5xl">
                  {exam?.exam_name}
                </h1>
              </div>

              <div className="flex flex-wrap gap-3">
                {matchPermissions(authUser?.permissions, "Update Exam") && (
                  <Link
                    to={`/dashboard/exam/${exam?._id}/edit`}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all duration-300 hover:scale-105"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Exam
                  </Link>
                )}

                {!exam?.isDeleted
                  ? matchPermissions(authUser?.permissions, "Delete Exam") && (
                      <button
                        onClick={() => handleDelete(exam?._id || "")}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )
                  : matchPermissions(authUser?.permissions, "Restore Exam") && (
                      <button
                        onClick={() => handleRestore(exam?._id || "")}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-emerald-600"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </button>
                    )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 md:p-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl bg-[var(--yp-secondary)] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--yp-main)] text-[var(--yp-main-subtle)]">
                  <Sparkles className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[var(--yp-text-primary)]">
                    About Exam
                  </h2>

                  <p className="text-sm text-[var(--yp-muted)]">
                    Complete overview and information
                  </p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-[var(--yp-text-primary)]">
                <ReadMoreLess
                  children={exam?.description || "No description available."}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailCard
                icon={CalendarDays}
                title="Application Start Date"
                value={
                  <div className="flex flex-col gap-1">
                    <span>
                      {formatDateWithoutTime(
                        exam?.application_form_date?.start || "",
                      ) || "N/A"}
                    </span>

                    {exam?.application_form_date?.is_tentative && (
                      <div>
                        <Badge label="Tentative" />
                      </div>
                    )}
                  </div>
                }
              />

              {/* APPLICATION END DATE */}
              <DetailCard
                icon={CalendarDays}
                title="Application End Date"
                value={
                  <div className="flex flex-col gap-1">
                    <span>
                      {formatDateWithoutTime(
                        exam?.application_form_date?.end || "",
                      ) || "N/A"}
                    </span>

                    {exam?.application_form_date?.is_tentative && (
                      <div>
                        <Badge label="Tentative" />
                      </div>
                    )}
                  </div>
                }
              />

              {/* UPCOMING EXAM DATE */}
              <DetailCard
                icon={Clock3}
                title="Upcoming Exam Date"
                value={
                  <div className="flex flex-col gap-1">
                    <span>
                      {formatDateWithoutTime(
                        exam?.upcoming_exam_date?.date || "N/A",
                      )}
                    </span>

                    {exam?.upcoming_exam_date?.is_tentative && (
                      <div>
                        <Badge label="Tentative" />
                      </div>
                    )}
                  </div>
                }
              />

              {/* RESULT DATE */}
              <DetailCard
                icon={CheckCircle2}
                title="Result Date"
                value={
                  <div className="flex flex-col gap-1">
                    <span>
                      {formatDateWithoutTime(exam?.result_date?.date || "N/A")}
                    </span>

                    {exam?.result_date?.is_tentative && (
                      <div>
                        <Badge label="Tentative" />
                      </div>
                    )}
                  </div>
                }
              />
            </div>

            <div className="rounded-3xl bg-[var(--yp-tertiary)] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--yp-main)] text-[var(--yp-main-subtle)]">
                  <ExternalLink className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[var(--yp-text-primary)]">
                    Important Links
                  </h2>

                  <p className="text-sm text-[var(--yp-muted)]">
                    Official resources and forms
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {exam?.youtube_link && (
                  <LinkCard
                    title="YouTube Link"
                    link={exam?.youtube_link}
                    icon={PlayCircle}
                  />
                )}
                {exam?.application_form_link && (
                  <LinkCard
                    title="Application Form"
                    link={exam?.application_form_link}
                    icon={FileText}
                  />
                )}
                {exam?.exam_form_link && (
                  <LinkCard
                    title="Exam Form"
                    link={exam?.exam_form_link}
                    icon={GraduationCap}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 xl:col-span-4">
            <div className="sticky top-5 rounded-3xl bg-[var(--yp-tertiary)] p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--yp-main)] text-[var(--yp-main-subtle)]">
                  <BookOpen className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[var(--yp-text-primary)]">
                    Quick Information
                  </h2>

                  <p className="text-sm text-[var(--yp-muted)]">
                    Essential exam details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <DetailCard
                  icon={BookOpen}
                  title="Short Name"
                  value={exam?.exam_short_name}
                />

                <DetailCard
                  icon={Layers3}
                  title="Exam Type"
                  value={getCategoryById(exam?.exam_type || "")}
                />

                <DetailCard
                  icon={GraduationCap}
                  title="Exam Mode"
                  value={getCategoryById(exam?.exam_mode || "")}
                />

                <DetailCard
                  icon={BadgeCheck}
                  title="SEO Score"
                  value={exam?.seo_score || 0}
                />

                <DetailCard
                  icon={CheckCircle2}
                  title="Status"
                  value={
                    <Badge
                      label={exam?.status}
                      color={getStatusColor(exam?.status || "")}
                    />
                  }
                />

                <DetailCard
                  icon={Sparkles}
                  title="Tags"
                  value={
                    <div className="flex flex-wrap gap-2">
                      {exam?.exam_tag?.length ? (
                        exam.exam_tag.map((tag: string, index: number) => (
                          <Badge label={getCategoryById(tag)} key={index} />
                        ))
                      ) : (
                        <span>N/A</span>
                      )}
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
