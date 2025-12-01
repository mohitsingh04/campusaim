import { useEffect, useRef, useMemo, useState } from "react";
import { Upload, X } from "lucide-react";
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

export function NewsEdit() {
  const editor = useRef(null);
  const redirector = useNavigate();
  const { objectId } = useParams();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const { status } = useOutletContext<DashboardOutletContextProps>();
  const [mainNews, setMainNews] = useState<NewsProps>();

  const formik = useFormik({
    initialValues: {
      title: mainNews?.title || "",
      content: mainNews?.content || "",
      featured_image: null as File | null,
      status: mainNews?.status || "Drafted",
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

      try {
        const response = await API.patch(
          `/news-and-updates/${objectId}`,
          formData
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
            }`
          );
        }
      } catch (error) {
        getErrorResponse(error, true);
      }
    };

    fetchNews();
  }, [objectId]);

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
                  )
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
