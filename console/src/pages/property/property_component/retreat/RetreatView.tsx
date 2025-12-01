import {
  formatDateWithoutTime,
  formatToAmPm,
} from "../../../../contexts/Callbacks";
import {
  DashboardOutletContextProps,
  RetreatProps,
} from "../../../../types/types";
import {
  Shield,
  Users,
  Info,
  CheckCircle2,
  XCircle,
  FileText,
  Target,
  Clock,
  Home,
  Languages,
} from "lucide-react";
import { Column, SimpleTable } from "../../../../ui/tables/SimpleTable";
import { useOutletContext } from "react-router-dom";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";

interface RoutineItem {
  start_time: string;
  end_time: string;
  task: string;
}

export default function RetreatView({
  retreat,
  getRetreatById,
  setIsViewing,
  requirements,
  keyoutcomes,
}: {
  retreat: RetreatProps | null;
  setIsViewing: any;
  requirements: any;
  keyoutcomes: any;
  getRetreatById: (id: string) => RetreatProps | undefined;
}) {
  const { categories } = useOutletContext<DashboardOutletContextProps>();
  const masterretreat = retreat
    ? getRetreatById(String(retreat.retreat_id))
    : null;

  const getCategoryById = (id: any) => {
    return categories?.find((cat) => cat?._id === id)?.category_name;
  };

  const getRequirementById = (id: any) => {
    return requirements.find((r: any) => r._id === id)?.requirment;
  };
  const getOutcomesById = (id: any) => {
    return keyoutcomes.find((ko: any) => ko._id === id)?.key_outcome;
  };

  const columns: Column<RoutineItem>[] = [
    { label: "Start Time", value: (row) => formatToAmPm(row.start_time) },
    { label: "End Time", value: (row) => formatToAmPm(row.end_time) },
    { label: "Task", value: "task" },
  ];

  if (!retreat) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--yp-muted)]">
        No retreat data available.
      </div>
    );
  }

  return (
    <div>
      <div className="py-4 flex justify-end">
        <button
          onClick={() => setIsViewing("")}
          className="px-6 py-2 ms-1 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Back
        </button>
      </div>
      {/* Hero Section */}
      <div className="relative w-full">
        <div className="aspect-[21/9] w-full overflow-hidden rounded-3xl shadow-sm">
          <img
            src={
              retreat.featured_image?.[0]
                ? `${import.meta.env.VITE_MEDIA_URL}/${
                    retreat.featured_image[0]
                  }`
                : "/img/default-images/yp-course.webp"
            }
            alt="Retreat"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 aspect-[21/9] rounded-3xl bg-gradient-to-b from-black/40 via-black/50 to-black/80 flex items-center justify-center rounded-b-3xl">
          <div className="text-center space-y-4 px-4">
            <h1 className="text-2xl md:text-6xl font-extrabold text-white drop-shadow-lg">
              {masterretreat?.retreat_name || "Retreat Name"}
            </h1>
            <p className="text-[var(--yp-muted)] text-md md:text-xl font-medium">
              Discover peace, balance, and mindfulness
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto sm:py-5 sm:pt-16 py-5 space-y-10">
        {/* Basic Info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] hover:shadow-sm rounded-xl sm:p-8 p-4 space-y-3">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
              <Users className="text-[var(--yp-main)]" /> Overview
            </h2>
            <p>
              <span className="font-semibold">Retreat Type:</span>{" "}
              {getCategoryById(
                retreat.retreat_type || masterretreat?.retreat_type || ""
              )}
            </p>
            <p>
              <span className="font-semibold">Retreat Certification:</span>{" "}
              {getCategoryById(
                retreat.retreat_certification_type ||
                  masterretreat?.retreat_certification_type ||
                  ""
              )}
            </p>
            <p>
              <span className="font-semibold">Retreat Difficulty Level:</span>{" "}
              {getCategoryById(
                retreat.retreat_difficulty_level ||
                  masterretreat?.retreat_difficulty_level ||
                  ""
              )}
            </p>
            <p>
              <span className="font-semibold">Certification:</span>{" "}
              {retreat.certification_available ? "Available" : "Not offered"}
            </p>
            <p>
              <span className="font-semibold">Price:</span>
              {retreat.price?.INR && <> {retreat.price?.INR} INR</>}
              {retreat.price?.USD && <>/ {retreat.price?.USD} USD</>}
              {retreat.price?.EUR && <>/ {retreat.price?.EUR} EUR</>}
            </p>
          </div>
          <div className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] hover:shadow-sm rounded-xl sm:p-8 p-4 space-y-3">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-[var(--yp-main)]" /> Extra
            </h2>
            <p>
              <span className="font-semibold">Status:</span> {retreat.status}
            </p>
            <p>
              <span className="font-semibold">Capacity:</span>{" "}
              {retreat.capacity} participants
            </p>

            <p>
              <span className="font-semibold">Booking Deadline:</span>{" "}
              {formatDateWithoutTime(retreat.booking_deadline)}
            </p>
            <p>
              <span className="font-semibold">Retreat Start On:</span>{" "}
              {formatDateWithoutTime(retreat.start_date)}
            </p>
            <p>
              <span className="font-semibold">Retreat End On:</span>{" "}
              {formatDateWithoutTime(retreat.end_date)}
            </p>
          </div>
        </section>

        {/* Description */}
        <section>
          <div className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] hover:shadow-sm rounded-xl sm:p-8 p-4 space-y-3">
            <h2 className="sm:text-3xl text-2xl font-bold mb-2 flex items-center gap-2">
              <Info className="text-[var(--yp-main)] " /> Description
            </h2>
            <ReadMoreLess children={retreat?.description} />
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 my-5 gap-8">
            <div className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] hover:shadow-sm rounded-xl sm:p-8 p-4 space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <CheckCircle2 className="text-[var(--yp-main)]" /> Inclusions
              </h2>
              <ReadMoreLess children={retreat?.inclusions} />
            </div>
            <div className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] hover:shadow-sm rounded-xl sm:p-8 p-4 space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <XCircle className="text-[var(--yp-main)]" /> Exclusions
              </h2>
              <ReadMoreLess children={retreat?.exclusions} />
            </div>
          </div>

          {/* Requirements & Outcomes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] hover:shadow-sm rounded-xl sm:p-8 p-4 space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <FileText className="text-[var(--yp-main)]" /> Requirements
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                {retreat.requirements?.map((req, i) => (
                  <li key={i}>{getRequirementById(req)}</li>
                ))}
              </ul>
            </div>
            <div className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] hover:shadow-sm rounded-xl sm:p-8 p-4 space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Target className="text-[var(--yp-main)]" /> Key Outcomes
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                {retreat.key_outcomes?.map((outcome, i) => (
                  <li key={i}>{getOutcomesById(outcome)}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Daily Routine */}

        <section className="my-10">
          <h2 className="sm:text-3xl text-2xl font-extrabold mb-6 flex items-center gap-3 text-[var(--yp-text-primary)]">
            <Clock className="text-[var(--yp-main)] w-7 h-7" /> Daily Routine
          </h2>

          {retreat.routine.length > 0 && (
            <div className="mt-4">
              <SimpleTable data={retreat.routine} columns={columns} />
            </div>
          )}
        </section>

        {/* Accommodation & Languages */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] hover:shadow-sm rounded-xl sm:p-8 p-4 space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
              <Home className="text-[var(--yp-main)]" /> Accommodation
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              {retreat.accommodation?.map((acc, i) => (
                <li key={i}>{acc}</li>
              ))}
            </ul>
          </div>
          <div className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] hover:shadow-sm rounded-xl sm:p-8 p-4 space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
              <Languages className="text-[var(--yp-main)]" /> Languages
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              {retreat.languages?.map((lang, i) => (
                <li key={i}>{lang}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Cancellation Policy */}
        <section className="bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] p-4 sm:p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold flex items-center gap-2 mb-3">
            <Shield className="text-[var(--yp-main)]" /> Cancellation Policy
          </h2>
          <ReadMoreLess children={retreat.cancellation_policy} />
        </section>
      </div>
    </div>
  );
}
