import { useRef, useMemo, useState, useEffect } from "react";
import { Image } from "lucide-react";
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

interface OptionType {
  value: number;
  label: string;
}

export function BlogCreate() {
  const editor = useRef(null);
  const redirector = useNavigate();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [tagOptions, setTagOptions] = useState<OptionType[]>([]);

  // Fetch categories and tags
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/blog/category/all");
        const options: OptionType[] = res.data.map((cat: any) => ({
          value: cat.uniqueId,
          label: cat.blog_category,
        }));
        setCategoryOptions(options);
      } catch (error) {
        getErrorResponse(error, true);
      }
    };

    const fetchTags = async () => {
      try {
        const res = await API.get("/blog/tag/all");
        const options: OptionType[] = res.data.map((tag: any) => ({
          value: tag.uniqueId,
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
    },
    validationSchema: BlogSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append(
          "category",
          JSON.stringify(values.categories.map((c) => c.value))
        );
        formData.append(
          "tags",
          JSON.stringify(values.tags.map((t) => t.value))
        );
        if (values.featuredImage)
          formData.append("featured_image", values.featuredImage);
        formData.append("blog", values.content);

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

      {/* Form */}
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
                value={formik.values.categories.map((c) =>
                  categoryOptions.find((o) => o.value === c.value)
                )}
                onChange={(selected) =>
                  formik.setFieldValue("categories", selected)
                }
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "categories")}
            </div>
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Tags
              </label>
              <Select
                isMulti
                options={tagOptions}
                value={formik.values.tags.map((t) =>
                  tagOptions.find((o) => o.value === t.value)
                )}
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
                  } else {
                    setPreviewUrl(null);
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
            {getFormikError(formik, "featuredImage")}
          </div>

          {/* Blog Content */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Blog Content
            </label>
            <div className="rounded-lg overflow-hidden">
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
            </div>
            {getFormikError(formik, "content")}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              {formik.isSubmitting ? "Creating..." : "Create Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
