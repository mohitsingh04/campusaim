import { useFormik } from "formik";
import { Breadcrumbs } from "../../../ui/breadcrumbs/Breadcrumbs";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API } from "../../../contexts/API";
import { useCallback, useEffect, useState } from "react";
import { BlogCategoryCreateSchema } from "../../../contexts/ValidationsSchemas";
import { getErrorResponse, getFormikError } from "../../../contexts/Callbacks";

export default function BlogCategoryCreate() {
  const redirector = useNavigate();
  const [allCategories, setAllCategories] = useState<any[]>([]);

  const getAllCategories = useCallback(async () => {
    try {
      const response = await API.get("/blog/category/all");
      setAllCategories(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  const formik = useFormik({
    initialValues: {
      blog_category: "",
      parent_category: "",
    },
    validationSchema: BlogCategoryCreateSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const response = await API.post("/blog/category", values);
        toast.success(
          response.data.message || "Blog Category Created Successfully"
        );
        redirector(`/dashboard/blog/category`);
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
        title="Create Blog Category"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Blog", path: "/dashboard/blog" },
          { label: "Category", path: "/dashboard/blog/category" },
          { label: "Create" },
        ]}
      />

      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          {/* Submit */}
          <div className="flex justify-start">
            <button
              type="submit"
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
