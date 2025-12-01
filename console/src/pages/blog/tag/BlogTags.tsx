import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../../ui/breadcrumbs/Breadcrumbs";
import { Column, DashboardOutletContextProps } from "../../../types/types";
import { DataTable } from "../../../ui/tables/DataTable";
import { API } from "../../../contexts/API";
import TableButton from "../../../ui/button/TableButton";
import { Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { BlogTagValidation } from "../../../contexts/ValidationsSchemas";
import { useOutletContext } from "react-router-dom";
import {
  getErrorResponse,
  getFormikError,
  matchPermissions,
} from "../../../contexts/Callbacks";
import TableSkeletonWithOutCards from "../../../ui/loadings/pages/TableSkeletonWithOutCards";

export interface BlogTagsProps extends Record<string, unknown> {
  _id: string;
  uniqueId: number;
  blog_tag: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function BlogTags() {
  const [tags, setTags] = useState<BlogTagsProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<BlogTagsProps | null>(null);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getAllTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/blog/tag/all");
      setTags(response.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllTags();
  }, [getAllTags]);

  // ✅ Create Formik
  const formik = useFormik({
    initialValues: {
      blog_tag: "",
    },
    validationSchema: BlogTagValidation,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await API.post("/blog/tag", values);
        toast.success(response.data.message || "Outcome created successfully");
        resetForm();
        getAllTags();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      blog_tag: editingTag?.blog_tag || "",
    },
    validationSchema: BlogTagValidation,
    onSubmit: async (values, { resetForm }) => {
      if (!editingTag) return;
      try {
        const response = await API.patch(`/blog/tag/${editingTag._id}`, values);
        toast.success(response.data.message || "Tag updated successfully");
        resetForm();
        setEditingTag(null);
        getAllTags();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  // ✅ Columns
  const columns = useMemo<Column<BlogTagsProps>[]>(
    () => [
      { value: "blog_tag", label: "Blog Tag" },
      {
        label: "Actions",
        value: (row: BlogTagsProps) => (
          <div className="flex space-x-2">
            {!authLoading &&
              matchPermissions(authUser?.permissions, "Update Blog Tag") && (
                <TableButton
                  Icon={Edit2}
                  color="green"
                  size="sm"
                  buttontype="button"
                  onClick={() => setEditingTag(row)}
                />
              )}
          </div>
        ),
        key: "actions",
      },
    ],
    [authLoading, authUser?.permissions]
  );

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div>
      <Breadcrumbs
        title="Blog Tags"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Blog Tags" },
        ]}
      />

      <div className="bg-[var(--yp-primary)] p-4 sm:p-6 rounded-2xl shadow-sm mb-5">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[var(--yp-text-secondary)]">
          Create Blog Tags
        </h3>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            name="blog_tag"
            placeholder="Enter Blog Tag"
            value={formik.values.blog_tag}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-text-primary)] bg-[var(--yp-secondary)]"
          >
            Add
          </button>
        </form>
        {getFormikError(formik, "blog_tag")}
      </div>

      <DataTable<BlogTagsProps> data={tags} columns={columns} />

      {editingTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--yp-primary)] p-6 rounded-xl shadow-sm w-full max-w-md">
            <h3 className="text-lg font-semibold text-[var(--yp-text-secondary)] mb-4">
              Edit Blog Tag
            </h3>
            <form
              onSubmit={editFormik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                name="blog_tag"
                placeholder="Enter Blog Tag"
                value={editFormik.values.blog_tag}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(editFormik, "blog_tag")}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-text-primary)] bg-[var(--yp-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editFormik.isSubmitting}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
