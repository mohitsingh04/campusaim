import { useRef, useMemo, useState, useEffect } from "react";
import { Image } from "lucide-react";
import { useFormik } from "formik";
import Select from "react-select";
import JoditEditor from "jodit-react";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { BlogSchema } from "../../contexts/ValidationsSchemas";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { BlogProps, DashboardOutletContextProps } from "../../types/types";
import {
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../contexts/Callbacks";
import EditSkeleton from "../../ui/skeleton/EditPageSkeleton";
import { reactSelectDesignClass } from "../../common/ExtraData";

interface OptionType {
  value: number;
  label: string;
}

export function BlogEdit() {
  const editor = useRef(null);
  const navigate = useNavigate();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const { objectId } = useParams<{ objectId: string }>();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [tagOptions, setTagOptions] = useState<OptionType[]>([]);
  const [mainBlog, setMainBlog] = useState<BlogProps | null>(null);
  const [loading, setLoading] = useState(true);
  const { status } = useOutletContext<DashboardOutletContextProps>();

  // Fetch categories
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

  // Fetch the current blog
  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      if (!objectId) return;
      try {
        const res = await API.get(`/blog/${objectId}`);
        const blog = res.data;
        setMainBlog(blog);
      } catch (error) {
        getErrorResponse(error, true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [objectId]);

  const formik = useFormik({
    initialValues: {
      title: mainBlog?.title || "",
      categories:
        mainBlog?.category.map(
          (c: any) =>
            categoryOptions.find((o) => o.value === c) || { value: c, label: c }
        ) || ([] as OptionType[]),
      tags:
        mainBlog?.tags.map(
          (t: any) =>
            tagOptions.find((o) => o.value === t) || { value: t, label: t }
        ) || ([] as OptionType[]),
      featuredImage: null as File | null,
      content: mainBlog?.blog || "",
      status: mainBlog?.status || "",
    },
    enableReinitialize: true,
    validationSchema: BlogSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("status", values.status);
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

        const response = await API.patch(`/blog/${objectId}`, formData);
        toast.success(response.data.message || "Blog updated successfully!");
        navigate("/dashboard/blog");
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) {
    return <EditSkeleton />;
  }

  return (
    <div>
      <Breadcrumbs
        title="Edit Blog"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Blog", path: "/dashboard/blog" },
          {
            label: mainBlog?.title || "",
            path: `/dashboard/blog/${objectId}`,
          },
          { label: "Edit" },
        ]}
      />

      {/* Blog Form */}
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
            {/* Categories */}
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

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Tags
              </label>
              <Select
                isMulti
                options={tagOptions}
                value={formik.values.tags}
                onChange={(selected) => formik.setFieldValue("tags", selected)}
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "tags")}
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Featured Image
            </label>
            <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center hover:border-[var(--yp-muted)] bg-[var(--yp-secondary)] transition-colors">
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
                ) : mainBlog?.featured_image?.[0] ? (
                  <img
                    src={`${import.meta.env.VITE_MEDIA_URL}/blogs/${
                      mainBlog.featured_image[0]
                    }`}
                    alt="Preview"
                    className="w-full aspect-[2/1] object-cover rounded-lg"
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
              {getStatusAccodingToField(status, "blogs").map(
                (opt: any, idx: number) => (
                  <option key={idx} value={opt.parent_status}>
                    {opt.parent_status}
                  </option>
                )
              )}
            </select>
            {getFormikError(formik, "status")}
          </div>

          {/* Blog Content */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Blog Content
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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              {formik.isSubmitting ? "Updating..." : "Update Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
