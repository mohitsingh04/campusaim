import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Image, X } from "lucide-react";
import JoditEditor from "jodit-react";
import { useFormik } from "formik";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { CategorySchema } from "../../contexts/ValidationsSchemas";
import { API } from "../../contexts/API";
import { CategoryProps, DashboardOutletContextProps } from "../../types/types";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../contexts/Callbacks";
import EditSkeleton from "../../ui/skeleton/EditPageSkeleton";

export function CategoryEdit() {
  const editor = useRef(null);
  const redirector = useNavigate();
  const { objectId } = useParams();
  const { authUser } = useOutletContext<DashboardOutletContextProps>();
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const [allCategories, setAllCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainCategory, setMainCategory] = useState<CategoryProps | null>(null);
  const { status } = useOutletContext<DashboardOutletContextProps>();

  // fetch all categories
  const getAllCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/category");
      const data = response.data;
      setAllCategories(data);
      setMainCategory(
        data.find((item: CategoryProps) => item._id === objectId) || null
      );
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  const formik = useFormik({
    initialValues: {
      userId: authUser?.uniqueId || "",
      category_name: mainCategory?.category_name || "",
      parent_category: mainCategory?.parent_category || "",
      description: mainCategory?.description || "",
      featured_image: null as File | null,
      category_icon: null as File | null,
      status: mainCategory?.status || "",
    },
    enableReinitialize: true,
    validationSchema: CategorySchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("userId", String(values.userId ?? ""));
      formData.append("category_name", values.category_name ?? "");
      formData.append("parent_category", values.parent_category ?? "");
      formData.append("description", values.description ?? "");
      formData.append("status", values.status ?? "");

      if (values.featured_image) {
        formData.append("featured_image", values.featured_image);
      }

      if (values.category_icon) {
        formData.append("category_icon", values.category_icon);
      }

      try {
        const response = await API.patch(`/category/${objectId}`, formData);
        toast.success(response.data.message || "Category updated successfully");
        redirector(`/dashboard/category`);
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
        title="Edit Category"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Category", path: "/dashboard/category" },
          {
            label: mainCategory?.category_name || "",
            path: `/dashboard/category/${objectId}`,
          },
          { label: "Edit" },
        ]}
      />

      {/* Form */}
      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Category Name
              </label>
              <input
                type="text"
                name="category_name"
                value={formik.values.category_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Category Name"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "category_name")}
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Parent Category
              </label>
              <select
                name="parent_category"
                value={formik.values.parent_category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Parent Category</option>
                {allCategories.map((item) => (
                  <option key={item._id} value={item.category_name}>
                    {item.category_name}
                  </option>
                ))}
              </select>
              {getFormikError(formik, "parent_category")}
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
              {getStatusAccodingToField(status, "category").map(
                (opt: any, idx: number) => (
                  <option key={idx} value={opt.parent_status}>
                    {opt.parent_status}
                  </option>
                )
              )}
            </select>
            {getFormikError(formik, "status")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Featured Image
              </label>
              <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center hover:border-[var(--yp-muted)] bg-[var(--yp-input-primary)] transition-colors">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  id="featured-image"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files
                      ? e.currentTarget.files[0]
                      : null;
                    formik.setFieldValue("featured_image", file);
                  }}
                />
                <label
                  htmlFor="featured-image"
                  className="cursor-pointer block"
                >
                  {formik.values.featured_image ? (
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(formik.values.featured_image)}
                        alt="Featured Preview"
                        className="mx-auto max-h-40 rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-[var(--yp-red-text)] text-[var(--yp-red-bg)] rounded-full p-1"
                        onClick={(e) => {
                          e.preventDefault();
                          formik.setFieldValue("featured_image", null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : mainCategory?.featured_image?.[0] ? (
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL}/category/${
                        mainCategory.featured_image?.[0]
                      }`}
                      alt="Featured Default"
                      className="mx-auto max-h-40 rounded-lg object-contain"
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
              {getFormikError(formik, "featured_image")}
            </div>

            {/* Category Icon */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Category Icon
              </label>
              <div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center hover:border-[var(--yp-muted)] bg-[var(--yp-input-primary)] transition-colors">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  id="category-icon"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files
                      ? e.currentTarget.files[0]
                      : null;
                    formik.setFieldValue("category_icon", file);
                  }}
                />
                <label htmlFor="category-icon" className="cursor-pointer block">
                  {formik.values.category_icon ? (
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(formik.values.category_icon)}
                        alt="Icon Preview"
                        className="mx-auto max-h-40 rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-[var(--yp-red-text)] text-[var(--yp-red-bg)] rounded-full p-1"
                        onClick={(e) => {
                          e.preventDefault();
                          formik.setFieldValue("category_icon", null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : mainCategory?.category_icon?.[0] ? (
                    <img
                      src={`${import.meta.env.VITE_MEDIA_URL}/category/${
                        mainCategory.category_icon?.[0]
                      }`}
                      alt="Icon Default"
                      className="mx-auto max-h-40 rounded-lg object-contain"
                    />
                  ) : (
                    <>
                      <Image className="w-8 h-8 text-[var(--yp-muted)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--yp-muted)]">
                        Click to upload category icon
                      </p>
                    </>
                  )}
                </label>
              </div>
              {getFormikError(formik, "category_icon")}
            </div>
          </div>

          {/* Jodit Editor */}
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
              onChange={(newContent) =>
                formik.setFieldValue("description", newContent)
              }
            />
            {getFormikError(formik, "description")}
          </div>

          {/* Submit */}
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
