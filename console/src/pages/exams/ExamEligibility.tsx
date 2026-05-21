import { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { DashboardOutletContextProps, ExamProps } from "../../types/types";
import { useOutletContext, useParams } from "react-router";
import { API } from "../../contexts/API";
import {
  getCategoryAccodingToField,
  getErrorResponse,
  getFormikError,
} from "../../contexts/Callbacks";
import EditSkeleton from "../../ui/skeleton/EditPageSkeleton";
import { useFormik } from "formik";
import { ExamEligibilityValidationSchema } from "../../contexts/ValidationsSchemas";
import { reactSelectDesignClass } from "../../common/ExtraData";

const Ageschema = { year: "", month: "" };

interface ExamEligibilityValues {
  exam_id: string;
  min_age: typeof Ageschema;
  max_age: typeof Ageschema;
  streams: string[];
  percentage: { "10th": string; "12th": string };
  std_class: string;
  pursuing_class: boolean;
}

export default function ExamEligibility() {
  const { objectId } = useParams<{ objectId: string }>();
  const [exam, setExam] = useState<ExamProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [examEligibility, setExamEligibility] =
    useState<ExamEligibilityValues | null>(null);
  const { categories } = useOutletContext<DashboardOutletContextProps>();

  const getExamEligibility = useCallback(async () => {
    if (!objectId) return;
    try {
      const res = await API.get(`/exam-eligibility/id/${objectId}`);
      setExamEligibility(res.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [objectId]);

  useEffect(() => {
    getExamEligibility();
  }, [getExamEligibility]);

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

  const formik = useFormik({
    initialValues: {
      exam_id: objectId || "",
      min_age: examEligibility?.min_age || Ageschema,
      max_age: examEligibility?.max_age || Ageschema,
      streams: examEligibility?.streams || [],
      percentage: examEligibility?.percentage || { "10th": "", "12th": "" },
      std_class: examEligibility?.std_class || "",
      pursuing_class: examEligibility?.pursuing_class || false,
    },
    enableReinitialize: true,
    validationSchema: ExamEligibilityValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log(values);
        await API.post(`/exam-eligibility`, values);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const streamOptions =
    getCategoryAccodingToField(categories, "stream")?.map((item) => ({
      label: item.category_name,
      value: item._id,
    })) || [];

  const labelClass =
    "block text-sm font-medium text-[var(--yp-text-secondary)] mb-2";
  const inputClass =
    "w-full px-4 py-3 border border-[var(--yp-border-primary)] rounded-xl bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)] outline-none focus:ring-2 focus:ring-[var(--yp-blue-text)]/20 focus:border-[var(--yp-blue-text)] transition-all";

  if (loading) return <EditSkeleton />;

  return (
    <div>
      <Breadcrumbs
        title="Exam Eligibility"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Exams", path: "/dashboard/exam" },
          {
            label: exam?.exam_name || "Edit",
            path: `/dashboard/exam/${objectId}`,
          },
          { label: "Eligibility" },
        ]}
      />

      <div className="bg-[var(--yp-primary)] rounded-2xl shadow-sm border border-[var(--yp-border-primary)]">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-10">
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
                Minimum Age
              </h2>
              <p className="text-sm text-[var(--yp-text-secondary)] mt-1">
                Define the minimum eligible age for the exam.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Minimum Year</label>
                <input
                  type="number"
                  name="min_age.year"
                  placeholder="Enter minimum year"
                  value={formik.values.min_age.year}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {getFormikError(formik, "min_age.year")}
              </div>
              <div>
                <label className={labelClass}>Minimum Month</label>
                <input
                  type="number"
                  name="min_age.month"
                  placeholder="Enter minimum month"
                  value={formik.values.min_age.month}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {getFormikError(formik, "min_age.month")}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
                Maximum Age
              </h2>
              <p className="text-sm text-[var(--yp-text-secondary)] mt-1">
                Define the maximum eligible age for the exam.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Maximum Year</label>
                <input
                  type="number"
                  name="max_age.year"
                  placeholder="Enter maximum year"
                  value={formik.values.max_age.year}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {getFormikError(formik, "max_age.year")}
              </div>
              <div>
                <label className={labelClass}>Maximum Month</label>
                <input
                  type="number"
                  name="max_age.month"
                  placeholder="Enter maximum month"
                  value={formik.values.max_age.month}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {getFormikError(formik, "max_age.month")}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
                Eligible Streams
              </h2>
              <p className="text-sm text-[var(--yp-text-secondary)] mt-1">
                Select all streams eligible for this exam.
              </p>
            </div>
            <div>
              <label className={labelClass}>Streams</label>
              <Select
                isMulti
                options={streamOptions}
                value={streamOptions?.filter((option) =>
                  formik.values.streams.includes(option.value),
                )}
                onChange={(selectedOptions) => {
                  formik.setFieldValue(
                    "streams",
                    selectedOptions.map((item) => item.value),
                  );
                }}
                onBlur={() => formik.setFieldTouched("streams", true)}
                placeholder="Select streams"
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "streams")}
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
                Required Percentage
              </h2>
              <p className="text-sm text-[var(--yp-text-secondary)] mt-1">
                Define minimum percentage criteria.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>10th Percentage</label>
                <input
                  type="number"
                  name="percentage.10th"
                  placeholder="Enter 10th percentage"
                  value={formik.values.percentage["10th"]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {getFormikError(formik, "percentage.10th")}
              </div>
              <div>
                <label className={labelClass}>12th Percentage</label>
                <input
                  type="number"
                  name="percentage.12th"
                  placeholder="Enter 12th percentage"
                  value={formik.values.percentage["12th"]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClass}
                />
                {getFormikError(formik, "percentage.12th")}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
                Current Class
              </h2>
              <p className="text-sm text-[var(--yp-text-secondary)] mt-1">
                Student current studying class or qualification.
              </p>
            </div>
            <div>
              <label className={labelClass}>Class</label>
              <input
                type="text"
                name="std_class"
                placeholder="Example: 12th, Graduation Final Year"
                value={formik.values.std_class}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
              {getFormikError(formik, "std_class")}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
                Pursuing Status
              </h2>
              <p className="text-sm text-[var(--yp-text-secondary)] mt-1">
                Allow students who are currently pursuing studies.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="pursuing_class"
                checked={formik.values.pursuing_class}
                onChange={formik.handleChange}
                className="h-5 w-5 rounded border border-[var(--yp-border-primary)] accent-[var(--yp-blue-text)]"
              />
              <span className="text-sm text-[var(--yp-text-primary)]">
                Students currently pursuing are eligible
              </span>
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] hover:opacity-90 transition-all disabled:opacity-50"
            >
              {formik.isSubmitting ? "Saving..." : "Save Eligibility"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
