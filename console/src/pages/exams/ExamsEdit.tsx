import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import JoditEditor from "jodit-react";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { API } from "../../contexts/API";
import { useFormik } from "formik";
import {
  formatDateToFormik,
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
import Select, { MultiValue, SingleValue } from "react-select";
import { reactSelectDesignClass } from "../../common/ExtraData";

interface FAQProps {
  question: string;
  answer: string;
}

export default function ExamsEdit() {
  const { objectId } = useParams();
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
      exam_type: (mainExam as any)?.exam_type || "",
      exam_tag: (mainExam as any)?.exam_tag || ([] as string[]),
      upcoming_exam_date: (mainExam as any)?.upcoming_exam_date
        ? {
            date: formatDateToFormik(mainExam?.upcoming_exam_date?.date),
            is_tentative: mainExam?.upcoming_exam_date?.is_tentative,
          }
        : {
            date: "",
            is_tentative: false,
          },
      result_date: (mainExam as any)?.result_date
        ? {
            date: formatDateToFormik(mainExam?.result_date?.date),
            is_tentative: mainExam?.result_date?.is_tentative,
          }
        : {
            date: "",
            is_tentative: false,
          },
      application_form_date: (mainExam as any)?.application_form_date
        ? {
            start: formatDateToFormik(mainExam?.application_form_date?.start),
            end: formatDateToFormik(mainExam?.application_form_date?.end),
            is_tentative: mainExam?.application_form_date?.is_tentative,
          }
        : {
            start: "",
            end: "",
            is_tentative: false,
          },
      youtube_link: mainExam?.youtube_link || "",
      application_form_link: mainExam?.application_form_link || "",
      exam_form_link: mainExam?.exam_form_link || "",
      exam_mode: mainExam?.exam_mode || "",
      description: mainExam?.description || "",
      image: null as File | null,
      answer_sheet: null as File | null,
      status: mainExam?.status || "",
      faqs: (mainExam as any)?.faqs || ([] as FAQProps[]),
    },
    validationSchema: ExamValidation,
    onSubmit: async (values) => {
      try {
        const fd = new FormData();
        fd.append("exam_name", values.exam_name);
        fd.append("exam_short_name", values.exam_short_name);
        fd.append("exam_type", values.exam_type);
        fd.append("exam_tag", JSON.stringify(values.exam_tag));
        fd.append(
          "upcoming_exam_date",
          JSON.stringify(values.upcoming_exam_date),
        );
        fd.append("result_date", JSON.stringify(values.result_date));
        fd.append(
          "application_form_date",
          JSON.stringify(values.application_form_date),
        );
        fd.append("youtube_link", values.youtube_link);
        fd.append("application_form_link", values.application_form_link);
        fd.append("exam_form_link", values.exam_form_link);
        fd.append("exam_mode", values.exam_mode);
        fd.append("description", values.description);
        fd.append("status", values.status);
        fd.append("faqs", JSON.stringify(values.faqs));

        if (values.image) fd.append("image", values.image);
        if (values.answer_sheet) fd.append("answer_sheet", values.answer_sheet);

        const response = await API.patch(`/exam/${objectId}`, fd);
        toast.success(response.data.message || "Exam updated Successfully");
        redirector(`/dashboard/exam`);
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    const file = e.target.files?.[0] ?? null;
    formik.setFieldValue(field, file);
    if (field === "image" && file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const ExamModeOptions = useMemo(
    () =>
      getCategoryAccodingToField(categories, "Exam Mode").map((opt: any) => ({
        value: opt._id,
        label: opt.category_name || opt.name,
      })),
    [categories],
  );
  const ExamTypeOptions = useMemo(
    () =>
      getCategoryAccodingToField(categories, "Exam Type").map((opt: any) => ({
        value: opt._id,
        label: opt.category_name || opt.name,
      })),
    [categories],
  );
  const ExamTagOptions = useMemo(
    () =>
      getCategoryAccodingToField(categories, "Exam Tag").map((opt: any) => ({
        value: opt._id,
        label: opt.category_name || opt.name,
      })),
    [categories],
  );

  const addFaqToList = () => {
    if (!currentFaq.question.trim() || !currentFaq.answer.trim())
      return toast.error("Please provide both a question and an answer.");
    formik.setFieldValue("faqs", [...formik.values.faqs, currentFaq]);
    setCurrentFaq({ question: "", answer: "" });
  };

  const removeFaqFromList = (index: number) => {
    const filtered = formik.values.faqs.filter(
      (_: FAQProps, i: number) => i !== index,
    );
    formik.setFieldValue("faqs", filtered);
  };

  if (loading) return <EditSkeleton />;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Edit Exam"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Exams", path: "/dashboard/exam" },
          {
            label: mainExam?.exam_name || "Edit",
            path: `/dashboard/exam/${objectId}`,
          },
          { label: "Edit" },
        ]}
      />
      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm border border-[var(--yp-border-primary)]">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Full Name
              </label>
              <input
                type="text"
                {...formik.getFieldProps("exam_name")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "exam_name")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Short Name / Code
              </label>
              <input
                type="text"
                {...formik.getFieldProps("exam_short_name")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "exam_short_name")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Type
              </label>
              <Select
                options={ExamTypeOptions}
                value={ExamTypeOptions.find(
                  (opt) => opt.value === formik.values.exam_type,
                )}
                onChange={(selected: SingleValue<any>) =>
                  formik.setFieldValue("exam_type", selected?.value || "")
                }
                classNames={reactSelectDesignClass}
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Tags (Multiple)
              </label>
              <Select
                isMulti
                options={ExamTagOptions}
                value={ExamTagOptions.filter((opt) =>
                  formik.values.exam_tag.includes(opt.value),
                )}
                onChange={(selected: MultiValue<any>) =>
                  formik.setFieldValue(
                    "exam_tag",
                    selected ? selected.map((s) => s.value) : [],
                  )
                }
                classNames={reactSelectDesignClass}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Mode
              </label>
              <Select
                options={ExamModeOptions}
                value={ExamModeOptions.find(
                  (opt: any) => opt.value === formik.values.exam_mode,
                )}
                onChange={(selected: SingleValue<any>) =>
                  formik.setFieldValue(
                    "exam_mode",
                    selected ? selected.value : "",
                  )
                }
                classNames={reactSelectDesignClass}
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--yp-text-secondary)]">
                  Upcoming Exam Date
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer text-[var(--yp-muted)]">
                  <input
                    type="checkbox"
                    checked={formik.values.upcoming_exam_date.is_tentative}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "upcoming_exam_date.is_tentative",
                        e.target.checked,
                      )
                    }
                  />{" "}
                  Mark Tentative
                </label>
              </div>
              <input
                type="date"
                value={formik.values.upcoming_exam_date.date}
                onChange={(e) =>
                  formik.setFieldValue(
                    "upcoming_exam_date.date",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--yp-text-secondary)]">
                  Result Date
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer text-[var(--yp-muted)]">
                  <input
                    type="checkbox"
                    checked={formik.values.result_date.is_tentative}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "result_date.is_tentative",
                        e.target.checked,
                      )
                    }
                  />{" "}
                  Mark Tentative
                </label>
              </div>
              <input
                type="date"
                value={formik.values.result_date.date}
                onChange={(e) =>
                  formik.setFieldValue("result_date.date", e.target.value)
                }
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
            </div>

            <div className="md:col-span-2 p-4 border border-[var(--yp-border-primary)] rounded-xl bg-[var(--yp-tertiary)] space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-[var(--yp-text-secondary)]">
                  Application Form Period
                </h4>
                <label className="flex items-center gap-2 text-xs cursor-pointer text-[var(--yp-muted)]">
                  <input
                    type="checkbox"
                    checked={formik.values.application_form_date.is_tentative}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "application_form_date.is_tentative",
                        e.target.checked,
                      )
                    }
                  />{" "}
                  Tentative Duration
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formik.values.application_form_date.start}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "application_form_date.start",
                      e.target.value,
                    )
                  }
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                <input
                  type="date"
                  value={formik.values.application_form_date.end}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "application_form_date.end",
                      e.target.value,
                    )
                  }
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Youtube Video Link
              </label>
              <input
                type="url"
                {...formik.getFieldProps("youtube_link")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Application Form Link
              </label>
              <input
                type="url"
                {...formik.getFieldProps("application_form_link")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Portal Link
              </label>
              <input
                type="url"
                {...formik.getFieldProps("exam_form_link")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Header Image
              </label>
              <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-xl p-4 text-center bg-[var(--yp-input-primary)]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                  className="hidden"
                  id="edit-img"
                />
                <label htmlFor="edit-img" className="cursor-pointer block">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      className="mx-auto max-h-32 rounded-lg"
                    />
                  ) : (
                    <div className="py-4">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Upload Image</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Answer Sheet (PDF)
              </label>
              <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-xl p-4 text-center bg-[var(--yp-input-primary)] h-[124px] flex items-center justify-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "answer_sheet")}
                  className="hidden"
                  id="edit-pdf"
                />
                <label htmlFor="edit-pdf" className="cursor-pointer block">
                  <FileText
                    className={`w-8 h-8 mx-auto mb-2 ${formik.values.answer_sheet ? "text-blue-500" : "opacity-50"}`}
                  />
                  <p className="text-xs truncate px-4">
                    {formik.values.answer_sheet
                      ? formik.values.answer_sheet.name
                      : "Change PDF Document"}
                  </p>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--yp-border-primary)]">
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Exam Description
            </label>
            <JoditEditor
              value={formik.values.description}
              config={editorConfig}
              onBlur={(newContent) =>
                formik.setFieldValue("description", newContent)
              }
            />
          </div>

          <div className="space-y-4 pt-6 border-t border-[var(--yp-border-primary)]">
            <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
              Exam FAQs
            </h3>
            <div className="p-4 border border-[var(--yp-border-primary)] bg-[var(--yp-tertiary)] rounded-xl space-y-4">
              <input
                type="text"
                placeholder="Question"
                value={currentFaq.question}
                onChange={(e) =>
                  setCurrentFaq({ ...currentFaq, question: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              <div className="rounded-lg overflow-hidden border border-[var(--yp-border-primary)]">
                <JoditEditor
                  value={currentFaq.answer}
                  config={editorConfig}
                  onBlur={(newContent) =>
                    setCurrentFaq({ ...currentFaq, answer: newContent })
                  }
                />
              </div>
              <button
                type="button"
                onClick={addFaqToList}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
              >
                <Plus size={16} /> Add FAQ
              </button>
            </div>
            {formik.values.faqs.map((faq: FAQProps, index: number) => (
              <div
                key={index}
                className="border border-[var(--yp-border-primary)] rounded-lg overflow-hidden bg-[var(--yp-secondary)]"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() =>
                    setOpenAccordion(openAccordion === index ? null : index)
                  }
                >
                  <span className="font-medium text-sm text-[var(--yp-text-primary)]">
                    {faq.question}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFaqFromList(index);
                      }}
                      className="text-red-500"
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
                  <div
                    className="p-4 border-t border-[var(--yp-border-primary)] text-[var(--yp-text-secondary)] bg-[var(--yp-input-primary)] text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Status
            </label>
            <select
              {...formik.getFieldProps("status")}
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
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              {formik.isSubmitting ? "Updating..." : "Update Exam Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
