import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Image,
  Plus,
  Trash2,
} from "lucide-react";
import JoditEditor from "jodit-react";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { API } from "../../contexts/API";
import { useFormik } from "formik";
import {
  getCategoryAccodingToField,
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../contexts/Callbacks";
import { ExamProps, DashboardOutletContextProps } from "../../types/types";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { ExamValidation } from "../../contexts/ValidationsSchemas";
import EditSkeleton from "../../ui/skeleton/EditPageSkeleton";
import Select from "react-select";

interface FAQProps {
  question: string;
  answer: string;
}

export default function ExamsEdit() {
  const { objectId } = useParams();
  const editor = useRef(null);
  const redirector = useNavigate();
  const editorConfig = useMemo(() => getEditorConfig(), []);

  const [currentFaq, setCurrentFaq] = useState<FAQProps>({
    question: "",
    answer: "",
  });
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mainExam, setMainExam] = useState<ExamProps | null>(null);
  const [loading, setLoading] = useState(true);
  const { status, categories } =
    useOutletContext<DashboardOutletContextProps>();

  // Fetch exam
  const fetchExam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/exam/${objectId}`);
      const exam = res.data;

      setMainExam(exam);

      if (exam?.image?.[0]) {
        setPreviewImage(
          `${import.meta.env.VITE_MEDIA_URL}/exam/${exam?.image?.[0]}`,
        );
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      exam_name: mainExam?.exam_name || "",
      exam_short_name: mainExam?.exam_short_name || "",
      upcoming_exam_date: mainExam?.upcoming_exam_date || "",
      result_date: mainExam?.result_date || "",
      application_form_date: mainExam?.application_form_date || "",
      youtube_link: mainExam?.youtube_link || "",
      application_form_link: mainExam?.application_form_link || "",
      exam_form_link: mainExam?.exam_form_link || "",
      exam_mode: mainExam?.exam_mode || "",
      description: mainExam?.description || "",
      image: null as File | null,
      status: mainExam?.status || "",
      faqs: (mainExam as any)?.faqs || ([] as FAQProps[]),
    },
    validationSchema: ExamValidation,
    onSubmit: async (values) => {
      try {
        const fd = new FormData();
        fd.append("exam_name", values.exam_name);
        fd.append("exam_short_name", values.exam_short_name);
        fd.append("upcoming_exam_date", values.upcoming_exam_date);
        fd.append("result_date", values.result_date);
        fd.append("application_form_date", values.application_form_date);
        fd.append("youtube_link", values.youtube_link);
        fd.append("application_form_link", values.application_form_link);
        fd.append("exam_form_link", values.exam_form_link);
        fd.append("exam_mode", values.exam_mode);
        fd.append("description", values.description);
        fd.append("status", values.status);
        fd.append("faqs", JSON.stringify(values.faqs));
        if (values.image) {
          fd.append("image", values.image);
        }

        const response = await API.patch(`/exam/${objectId}`, fd);
        toast.success(response.data.message || "Exam updated Successfully");
        redirector(`/dashboard/exam`);
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    formik.setFieldValue("image", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const ExamModeOptions = getCategoryAccodingToField(categories, "Exam Mode");
  const ExamModeSelectOptions = ExamModeOptions.map((opt: any) => ({
    value: opt._id,
    label: opt.category_name || opt.name,
  }));

  const addFaqToList = () => {
    if (!currentFaq.question.trim() || !currentFaq.answer.trim()) {
      return toast.error("Please provide both a question and an answer.");
    }
    formik.setFieldValue("faqs", [...formik.values.faqs, currentFaq]);
    setCurrentFaq({ question: "", answer: "" });
  };

  const removeFaqFromList = (index: number) => {
    const filtered = formik.values.faqs.filter((_: any, i: any) => i !== index);
    formik.setFieldValue("faqs", filtered);
    if (openAccordion === index) setOpenAccordion(null);
  };

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  if (loading) {
    return <EditSkeleton />;
  }

  return (
    <div>
      <Breadcrumbs
        title="Edit Exam"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Exams", path: "/dashboard/exam" },
          {
            label: mainExam?.exam_name || "",
            path: `/dashboard/exam/${objectId}`,
          },
          { label: "Edit" },
        ]}
      />
      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Name
              </label>
              <input
                type="text"
                name="exam_name"
                value={formik.values.exam_name}
                onChange={formik.handleChange}
                placeholder="Enter Exam Name"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "exam_name")}
            </div>

            {/* Exam Short Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Short Name
              </label>
              <input
                type="text"
                name="exam_short_name"
                value={formik.values.exam_short_name}
                onChange={formik.handleChange}
                placeholder="Enter Exam Short Name"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "exam_short_name")}
            </div>

            {/* Upcoming Exam Date */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Upcoming Exam Date
              </label>
              <input
                type="date"
                name="upcoming_exam_date"
                value={formik.values.upcoming_exam_date}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "upcoming_exam_date")}
            </div>

            {/* Result Date */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Result Date
              </label>
              <input
                type="date"
                name="result_date"
                value={formik.values.result_date}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "result_date")}
            </div>

            {/* Application Form Date */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Application Form Date
              </label>
              <input
                type="date"
                name="application_form_date"
                value={formik.values.application_form_date}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "application_form_date")}
            </div>

            {/* Youtube Link */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Youtube Link
              </label>
              <input
                type="url"
                name="youtube_link"
                value={formik.values.youtube_link}
                onChange={formik.handleChange}
                placeholder="Enter Youtube Link"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "youtube_link")}
            </div>

            {/* Application Form Link */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Application Form Link
              </label>
              <input
                type="url"
                name="application_form_link"
                value={formik.values.application_form_link}
                onChange={formik.handleChange}
                placeholder="Enter Application Form Link"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "application_form_link")}
            </div>

            {/* Exam Form Link */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Form Link
              </label>
              <input
                type="url"
                name="exam_form_link"
                value={formik.values.exam_form_link}
                onChange={formik.handleChange}
                placeholder="Enter Exam Form Link"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "exam_form_link")}
            </div>

            {/* Exam Mode */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Mode
              </label>
              <Select
                name="exam_mode"
                options={ExamModeSelectOptions}
                value={ExamModeSelectOptions.find(
                  (opt) => opt.value === formik.values.exam_mode,
                )}
                onChange={(selected) =>
                  formik.setFieldValue(
                    "exam_mode",
                    selected ? selected.value : "",
                  )
                }
                onBlur={() => formik.setFieldTouched("exam_mode", true)}
                classNamePrefix="react-select"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Image
            </label>
            <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center hover:border-[var(--yp-muted)] bg-[var(--yp-input-primary)] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="exam-image"
              />
              <label htmlFor="exam-image" className="cursor-pointer block">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="mx-auto mb-2 max-h-40 rounded"
                  />
                ) : (
                  <>
                    <Image className="w-8 h-8 text-[var(--yp-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--yp-muted)]">
                      {formik.values.image
                        ? (formik.values.image as File).name
                        : "Click to upload image"}
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Description
            </label>
            <JoditEditor
              ref={editor}
              value={formik.values.description}
              config={editorConfig}
              onBlur={(newContent) =>
                formik.setFieldValue("description", newContent)
              }
            />
            {getFormikError(formik, "description")}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Status
            </label>
            <select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            >
              <option value="">Select Status</option>
              {getStatusAccodingToField(status, "exam").map(
                (opt: any, idx: number) => (
                  <option key={idx} value={opt.parent_status}>
                    {opt.parent_status}
                  </option>
                ),
              )}
            </select>
            {getFormikError(formik, "status")}
          </div>

          {/* FAQ SECTION */}
          <div className="space-y-4 pt-6 border-t border-[var(--yp-border-primary)]">
            <h3 className="text-md font-semibold text-[var(--yp-text-primary)]">
              Blog FAQs
            </h3>

            {/* Single FAQ Entry Form */}
            <div className="p-4 border border-[var(--yp-border-primary)] bg-[var(--yp-input-primary)] rounded-xl space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--yp-text-secondary)] mb-1">
                  Question
                </label>
                <input
                  type="text"
                  placeholder="Enter a common question..."
                  value={currentFaq.question}
                  onChange={(e) =>
                    setCurrentFaq({ ...currentFaq, question: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-primary)] text-[var(--yp-text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--yp-text-secondary)] mb-1">
                  Answer
                </label>
                <div className="rounded-lg overflow-hidden border border-[var(--yp-border-primary)]">
                  <JoditEditor
                    value={currentFaq.answer}
                    config={editorConfig}
                    onBlur={(newContent) =>
                      setCurrentFaq({ ...currentFaq, answer: newContent })
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addFaqToList}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
              >
                <Plus size={16} /> Add FAQ to List
              </button>
            </div>

            {/* Accordion List of FAQs */}
            {formik.values.faqs.length > 0 && (
              <div className="mt-4 space-y-2">
                <label className="block text-xs font-bold text-[var(--yp-muted)] uppercase tracking-wider mb-2">
                  Added FAQs
                </label>
                {formik.values.faqs.map((faq: FAQProps, index: number) => (
                  <div
                    key={index}
                    className="border border-[var(--yp-border-primary)] rounded-lg overflow-hidden bg-[var(--yp-primary)]"
                  >
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-[var(--yp-input-primary)] transition-colors"
                      onClick={() => toggleAccordion(index)}
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle
                          size={16}
                          className="text-[var(--yp-main)]"
                        />
                        <span className="text-sm font-medium text-[var(--yp-text-primary)]">
                          {faq.question}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFaqFromList(index);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                        {openAccordion === index ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>

                    {openAccordion === index && (
                      <div className="p-3 border-t border-[var(--yp-border-primary)] bg-[var(--yp-input-primary)] text-sm text-[var(--yp-text-secondary)]">
                        <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-start">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
              disabled={formik.isSubmitting}
            >
              {formik?.isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
