import { useEffect, useRef, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import JoditEditor from "jodit-react";
import { useFormik } from "formik";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { API } from "../../contexts/API";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { newsValidation } from "../../contexts/ValidationsSchemas";
import { DashboardOutletContextProps, NewsProps } from "../../types/types";
import {
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../contexts/Callbacks";

interface FAQProps {
  question: string;
  answer: string;
}

export function NewsEdit() {
  const editor = useRef(null);
  const redirector = useNavigate();
  const { objectId } = useParams();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const { status } = useOutletContext<DashboardOutletContextProps>();
  const [mainNews, setMainNews] = useState<NewsProps>();
  const [currentFaq, setCurrentFaq] = useState<FAQProps>({
    question: "",
    answer: "",
  });
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const formik = useFormik({
    initialValues: {
      title: mainNews?.title || "",
      content: mainNews?.content || "",
      featured_image: null as File | null,
      status: mainNews?.status || "Drafted",
      faqs: (mainNews as any)?.faqs || ([] as FAQProps[]),
    },
    enableReinitialize: true,
    validationSchema: newsValidation,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("status", values.status);
      if (values.featured_image) {
        formData.append("featured_image", values.featured_image);
      }
      formData.append("faqs", JSON.stringify(values.faqs));

      try {
        const response = await API.patch(
          `/news-and-updates/${objectId}`,
          formData,
        );
        toast.success(response.data.message || "News updated successfully");
        redirector("/dashboard/news-and-updates");
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  // Fetch existing data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await API.get(`/news-and-updates/${objectId}`);
        setMainNews(data);
        if (data?.featured_image?.[0]) {
          setExistingImage(
            `${import.meta.env.VITE_MEDIA_URL}/news-and-updates/${
              data.featured_image[0]
            }`,
          );
        }
      } catch (error) {
        getErrorResponse(error, true);
      }
    };

    fetchNews();
  }, [objectId]);

  const addFaqToList = () => {
    if (!currentFaq.question.trim() || !currentFaq.answer.trim()) {
      return toast.error("Please provide both a question and an answer.");
    }
    formik.setFieldValue("faqs", [...formik.values.faqs, currentFaq]);
    setCurrentFaq({ question: "", answer: "" });
  };

  const removeFaqFromList = (index: number) => {
    const filtered = formik.values.faqs.filter(
      (_: any, i: number) => i !== index,
    );
    formik.setFieldValue("faqs", filtered);
    if (openAccordion === index) setOpenAccordion(null);
  };

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div>
      <div>
        <Breadcrumbs
          title="Edit News & Updates"
          breadcrumbs={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "News & Updates", path: "/dashboard/news-and-updates" },
            {
              label: mainNews?.title || "",
              path: `/dashboard/news-and-updates/${mainNews?._id}`,
            },
            { label: "Edit" },
          ]}
        />

        <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm p-6">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter News Title"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "title")}
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
                {getStatusAccodingToField(status, "news and updates").map(
                  (item, index) => (
                    <option value={item?.parent_status} key={index}>
                      {item?.parent_status}
                    </option>
                  ),
                )}
              </select>
              {getFormikError(formik, "status")}
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Featured Image (Optional)
              </label>
              <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center hover:border-[var(--yp-muted)] bg-[var(--yp-input-primary)] transition-colors">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  id="featured-image"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] || null;
                    if (
                      file &&
                      !["image/jpeg", "image/png"].includes(file.type)
                    ) {
                      toast.error("Only JPG and PNG images are allowed");
                      return;
                    }
                    formik.setFieldValue("featured_image", file);
                    setPreviewImage(file);
                    setExistingImage(null);
                  }}
                />
                <label
                  htmlFor="featured-image"
                  className="cursor-pointer block"
                >
                  {previewImage ? (
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(previewImage)}
                        alt="Featured Preview"
                        className="mx-auto max-h-40 rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-[var(--yp-red-text)] text-[var(--yp-red-bg)] rounded-full p-1"
                        onClick={(e) => {
                          e.preventDefault();
                          formik.setFieldValue("featured_image", null);
                          setPreviewImage(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : existingImage ? (
                    <div className="relative inline-block">
                      <img
                        src={existingImage}
                        alt="Existing Featured"
                        className="mx-auto max-h-40 rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-[var(--yp-red-text)] text-[var(--yp-red-bg)] rounded-full p-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setExistingImage(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[var(--yp-muted)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--yp-muted)]">
                        Click to upload featured image (JPG or PNG)
                      </p>
                    </>
                  )}
                </label>
              </div>
              {getFormikError(formik, "featured_image")}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Content
              </label>
              <JoditEditor
                ref={editor}
                value={formik.values.content}
                config={editorConfig}
                onBlur={(newContent) =>
                  formik.setFieldValue("content", newContent)
                }
                onChange={(newContent) =>
                  formik.setFieldValue("content", newContent)
                }
              />
              {getFormikError(formik, "content")}
            </div>

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
                            className="text-[var(--yp-blue-text)]"
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
                          <div
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-start">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
                disabled={formik.isSubmitting}
              >
                {formik?.isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
