import { useFormik } from "formik";
import { Breadcrumbs } from "../../../ui/breadcrumbs/Breadcrumbs";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { API } from "../../../contexts/API";
import { useCallback, useEffect, useState } from "react";
import {
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../../contexts/Callbacks";
import { BlogCategoryCreateSchema } from "../../../contexts/ValidationsSchemas";
import EditSkeleton from "../../../ui/skeleton/EditPageSkeleton";
import { DashboardOutletContextProps } from "../../../types/types";

export default function BlogCategoryEdit() {
  const redirector = useNavigate();
  const { objectId } = useParams();
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [mainCategory, setMainCategory] = useState<any>("");
  const [loading, setLoading] = useState(true);
  const { status } = useOutletContext<DashboardOutletContextProps>();

  // Get categories
  const getAllCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/blog/category/all");
      const data = response.data;
      setAllCategories(data);
      setMainCategory(data.find((item: any) => item._id === objectId));
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
      blog_category: mainCategory?.blog_category || "",
      parent_category: mainCategory?.parent_category || "",
      status: mainCategory?.status || "",
    },
    enableReinitialize: true,
    validationSchema: BlogCategoryCreateSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const response = await API.patch(`/blog/category/${objectId}`, values);
        toast.success(
          response.data.message || "Blog Category Updated Successfully"
        );
        redirector(`/dashboard/blog/category`);
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
    <div className="space-y-6">
      <Breadcrumbs
        title="Edit Blog Category"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Blog", path: "/dashboard/blog" },
          { label: "Category", path: "/dashboard/blog/category" },
          { label: mainCategory?.blog_category },
          { label: "Edit" },
        ]}
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blog Category (Input) */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Blog Category
              </label>
              <input
                type="text"
                name="blog_category"
                value={formik.values.blog_category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter blog category"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "blog_category")}
            </div>

            {/* Parent Category (Select) */}
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
                <option value="">-- Select Parent Category --</option>
                {allCategories.map((cat: any, index) => (
                  <option key={index} value={cat.blog_category}>
                    {cat.blog_category}
                  </option>
                ))}
              </select>
              {getFormikError(formik, "parent_category")}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Status
              </label>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">-- Select Status --</option>
                {getStatusAccodingToField(status, "user").map(
                  (s: any, index: number) => (
                    <option key={index} value={s.parent_status}>
                      {s.parent_status}
                    </option>
                  )
                )}
              </select>
              {getFormikError(formik, "status")}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-start">
            <button
              type="submit"
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
