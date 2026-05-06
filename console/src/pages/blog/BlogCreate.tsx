import { useRef, useMemo, useState, useEffect } from "react";
import {
  Image,
  Plus,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useFormik } from "formik";
import Select from "react-select";
import JoditEditor from "jodit-react";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { BlogSchema } from "../../contexts/ValidationsSchemas";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { getErrorResponse, getFormikError } from "../../contexts/Callbacks";
import { reactSelectDesignClass } from "../../common/ExtraData";
import { BlogCategoryProps } from "../../types/types";
import { BlogTagsProps } from "./tag/BlogTags";

interface OptionType {
  value: number;
  label: string;
}

interface FAQProps {
  question: string;
  answer: string;
}

export function BlogCreate() {
  const editor = useRef(null);
  const redirector = useNavigate();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [tagOptions, setTagOptions] = useState<OptionType[]>([]);

  const [currentFaq, setCurrentFaq] = useState<FAQProps>({
    question: "",
    answer: "",
  });
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/blog/category/all");
        const options: OptionType[] = res.data.map(
          (cat: BlogCategoryProps) => ({
            value: cat._id,
            label: cat.blog_category,
          }),
        );
        setCategoryOptions(options);
      } catch (error) {
        getErrorResponse(error, true);
      }
    };

    const fetchTags = async () => {
      try {
        const res = await API.get("/blog/tag/all");
        const options: OptionType[] = res.data.map((tag: BlogTagsProps) => ({
          value: tag._id,
          label: tag.blog_tag,
        }));
        setTagOptions(options);
      } catch (error) {
        getErrorResponse(error, true);
      }
    };

    fetchCategories();
    fetchTags();
  }, []);

  const formik = useFormik({
    initialValues: {
      title: "",
      categories: [] as OptionType[],
      tags: [] as OptionType[],
      featuredImage: null as File | null,
      content: "",
      faqs: [] as FAQProps[],
    },
    validationSchema: BlogSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append(
          "category",
          JSON.stringify(values.categories.map((c) => c.value)),
        );
        formData.append(
          "tags",
          JSON.stringify(values.tags.map((t) => t.value)),
        );
        if (values.featuredImage)
          formData.append("featured_image", values.featuredImage);
        formData.append("blog", values.content);
        formData.append("faqs", JSON.stringify(values.faqs));

        const response = await API.post("/blog", formData);
        toast.success(response.data.message || "Blog created successfully!");
        redirector("/dashboard/blog");
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

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

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div>
      <Breadcrumbs
        title="Create Blog"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Blog", path: "/dashboard/blog" },
          { label: "Create" },
        ]}
      />

      <div className="bg-[var(--yp-primary)] mt-5 rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-3 md:p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Blog Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter blog title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "title")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Categories
              </label>
              <Select
                isMulti
                options={categoryOptions}
                value={formik.values.categories}
                onChange={(selected) =>
                  formik.setFieldValue("categories", selected)
                }
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "categories")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Tags
              </label>
              <Select
                isMulti
                options={tagOptions}
                value={formik.values.tags}
                classNames={reactSelectDesignClass}
                onChange={(selected) => formik.setFieldValue("tags", selected)}
              />
              {getFormikError(formik, "tags")}
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Featured Image
            </label>
            <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center hover:border-[var(--yp-muted)] bg-[var(--yp-input-primary)] transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="featured-image"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  formik.setFieldValue("featuredImage", file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () =>
                      setPreviewUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label htmlFor="featured-image" className="cursor-pointer block">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Image className="w-8 h-8 text-[var(--yp-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--yp-muted)]">
                      Click to upload featured image
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Main Content */}
          <div id="blog-main">
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Blog Content
            </label>
            <div className="rounded-lg overflow-hidden border border-[var(--yp-border-primary)]">
              <JoditEditor
                ref={editor}
                value={formik.values.content}
                config={editorConfig}
                onBlur={(newContent) =>
                  formik.setFieldValue("content", newContent)
                }
              />
            </div>
            {getFormikError(formik, "content")}
          </div>

          <div className="space-y-4 pt-6 border-t border-[var(--yp-border-primary)]">
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
                {formik.values.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-[var(--yp-border-primary)] rounded-lg overflow-hidden bg-[var(--yp-secondary)]"
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

          {/* Submit */}
          <div className="pt-4 border-t border-[var(--yp-border-primary)]">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-8 py-2.5 rounded-lg text-sm font-bold text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] hover:brightness-95 transition-all"
            >
              {formik.isSubmitting ? "Processing..." : "Create Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
