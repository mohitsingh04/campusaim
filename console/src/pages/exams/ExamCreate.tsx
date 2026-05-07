import React, { useState, useRef, useMemo } from "react";
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
  getCategoryAccodingToField,
  getErrorResponse,
  getFormikError,
} from "../../contexts/Callbacks";
import { DashboardOutletContextProps } from "../../types/types";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { ExamValidation } from "../../contexts/ValidationsSchemas";
import Select, { MultiValue, SingleValue } from "react-select";
import { reactSelectDesignClass } from "../../common/ExtraData";

interface FAQProps {
  question: string;
  answer: string;
}

export function ExamCreate() {
  const editor = useRef(null);
  const redirector = useNavigate();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const { categories } = useOutletContext<DashboardOutletContextProps>();

  const [currentFaq, setCurrentFaq] = useState<FAQProps>({
    question: "",
    answer: "",
  });
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const formik = useFormik({
    initialValues: {
      exam_name: "",
      exam_short_name: "",
      exam_type: "",
      exam_tag: [] as string[],
      upcoming_exam_date: { date: "", is_tentative: false },
      result_date: { date: "", is_tentative: false },
      application_form_date: { start: "", end: "", is_tentative: false },
      youtube_link: "",
      application_form_link: "",
      exam_form_link: "",
      exam_mode: "",
      description: "",
      image: null as File | null,
      answer_sheet: null as File | null,
      faqs: [] as FAQProps[],
    },
    validationSchema: ExamValidation,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
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
        fd.append("faqs", JSON.stringify(values.faqs));

        if (values.image) fd.append("image", values.image);
        if (values.answer_sheet) fd.append("answer_sheet", values.answer_sheet);

        const response = await API.post("/exam", fd);
        toast.success(response.data.message || "Exam created Successfully");
        redirector(`/dashboard/exam`);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
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
    } else if (field === "image") {
      setPreviewImage(null);
    }
  };

  const addFaqToList = () => {
    if (!currentFaq.question.trim() || !currentFaq.answer.trim()) {
      return toast.error("Please provide both a question and an answer.");
    }
    formik.setFieldValue("faqs", [...formik.values.faqs, currentFaq]);
    setCurrentFaq({ question: "", answer: "" });
  };

  const removeFaqFromList = (index: number) => {
    const filtered = formik.values.faqs.filter((_, i) => i !== index);
    formik.setFieldValue("faqs", filtered);
    if (openAccordion === index) setOpenAccordion(null);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Create Exam"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Exams", path: "/dashboard/exam" },
          { label: "Create" },
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
                placeholder="e.g. Common University Entrance Test"
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
                placeholder="e.g. CUET"
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
                  formik.setFieldValue(
                    "exam_type",
                    selected ? selected.value : "",
                  )
                }
                placeholder="Select Type..."
                classNamePrefix="react-select"
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "exam_type")}
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
                placeholder="Select Relevant Tags..."
                classNamePrefix="react-select"
                classNames={reactSelectDesignClass}
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
                classNamePrefix="react-select"
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "exam_mode")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
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
                  />
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
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
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
                  />
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
                <h4 className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
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
                  />
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
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Application Form Link
              </label>
              <input
                type="url"
                {...formik.getFieldProps("application_form_link")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Exam Portal Link
              </label>
              <input
                type="url"
                {...formik.getFieldProps("exam_form_link")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)]"
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
                  id="exam-image-input"
                />
                <label
                  htmlFor="exam-image-input"
                  className="cursor-pointer block"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="mx-auto max-h-32 rounded-lg"
                    />
                  ) : (
                    <div className="py-4">
                      <ImageIcon className="w-8 h-8 text-[var(--yp-muted)] mx-auto mb-2" />
                      <p className="text-xs text-[var(--yp-muted)]">
                        Upload Brand Image
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Official Answer Sheet (PDF)
              </label>
              <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-xl p-4 text-center bg-[var(--yp-input-primary)] h-[124px] flex items-center justify-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "answer_sheet")}
                  className="hidden"
                  id="pdf-input"
                />
                <label
                  htmlFor="pdf-input"
                  className="cursor-pointer block w-full"
                >
                  <FileText
                    className={`w-8 h-8 mx-auto mb-2 ${formik.values.answer_sheet ? "text-blue-500" : "text-[var(--yp-muted)]"}`}
                  />
                  <p className="text-xs text-[var(--yp-muted)] truncate px-4">
                    {formik.values.answer_sheet
                      ? formik.values.answer_sheet.name
                      : "Select PDF Document"}
                  </p>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--yp-border-primary)]">
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Detailed Exam Description
            </label>
            <JoditEditor
              ref={editor}
              value={formik.values.description}
              config={editorConfig}
              onBlur={(newContent) =>
                formik.setFieldValue("description", newContent)
              }
            />
          </div>

          <div className="space-y-4 pt-6 border-t border-[var(--yp-border-primary)]">
            <h3 className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Exam FAQs
            </h3>
            <div className="p-4 border border-[var(--yp-border-primary)] bg-[var(--yp-tertiary)] rounded-xl space-y-4">
              <input
                type="text"
                placeholder="FAQ Question"
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
                <Plus size={16} /> Add FAQ to List
              </button>
            </div>

            <div className="space-y-2">
              {formik.values.faqs.map((faq, index) => (
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
                        className="text-red-500 hover:scale-110 transition-transform"
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
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              {formik.isSubmitting ? "Finalizing..." : "Create Exam Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
