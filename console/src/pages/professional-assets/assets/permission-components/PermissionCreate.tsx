import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { API } from "../../../../contexts/API";
import {
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import { reactSelectDesignClass } from "../../../../common/ExtraData";
import { Column, SimpleTable } from "../../../../ui/tables/SimpleTable";
import toast from "react-hot-toast";

export default function PermissionCreate({
  setIsAdding,
  roles,
  isAdding,
}: {
  setIsAdding: any;
  roles: any;
  isAdding: any;
}) {
  const [permissions, setPermissions] = useState<
    { title: string; description?: string }[]
  >([]);
  const [permTitle, setPermTitle] = useState("");
  const [permDesc, setPermDesc] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Pre-fill permissions when editing
  useEffect(() => {
    if (isAdding && isAdding.permissions) {
      setPermissions(isAdding.permissions);
    } else {
      setPermissions([]);
    }
  }, [isAdding]);

  // ✅ Formik setup with defaults from isAdding
  const formik = useFormik({
    initialValues: {
      title: isAdding?.title || "",
      roles: isAdding?.roles
        ? roles
            .filter((r: any) =>
              isAdding.roles.some(
                (roleId: string | { _id: string }) =>
                  roleId === r.value || roleId?._id === r.value
              )
            )
            .map((r: any) => ({
              value: r.value,
              label: r.label,
            }))
        : [],
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().trim().required("Module title is required"),
      roles: Yup.array()
        .min(1, "Select at least one role")
        .of(
          Yup.object({
            value: Yup.string().required(),
            label: Yup.string().required(),
          })
        ),
    }),
    onSubmit: async (values) => {
      if (permissions.length === 0) {
        toast.error("Add at least one permission before saving.");
        return;
      }
      try {
        setLoading(true);
        const roleIds = values.roles.map((r) => r.value);

        const response = await API.post("/profile/permission", {
          title: values.title,
          roles: roleIds,
          permissions,
        });

        toast.success(
          response.data.message || "Permission set created successfully"
        );
        formik.resetForm();
        setPermissions([]);
        setIsAdding(false);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setLoading(false);
      }
    },
  });

  // ✅ Add Permission
  const handleAddPermission = () => {
    if (!permTitle.trim()) return alert("Enter permission title");

    setPermissions((prev) => [
      ...prev,
      { title: permTitle.trim(), description: permDesc.trim() },
    ]);
    setPermTitle("");
    setPermDesc("");
  };

  // ✅ Remove Permission
  const handleRemovePermission = (title: string) => {
    setPermissions((prev) => prev.filter((perm) => perm.title !== title));
  };

  // ✅ Table columns
  const columns: Column<{ title: string; description?: string }>[] = [
    { label: "Title", value: "title" },
    { label: "Description", value: "description" },
    {
      label: "Action",
      value: (row) => (
        <button
          type="button"
          onClick={() => handleRemovePermission(row.title)}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-[var(--yp-primary)] rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-[var(--yp-text-primary)]">
        {isAdding?._id ? "Edit Permission Set" : "Create Permission Set"}
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Module Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-1">
            Title (Module)
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g., Property"
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {getFormikError(formik, "title")}
        </div>

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-1">
            Roles
          </label>
          <Select
            isMulti
            options={roles}
            value={formik.values.roles}
            onChange={(selected) => formik.setFieldValue("roles", selected)}
            onBlur={() => formik.setFieldTouched("roles", true)}
            classNames={reactSelectDesignClass}
            placeholder="Select one or more roles"
          />
          {getFormikError(formik, "roles")}
        </div>

        {/* Add Permission Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
            Add Permission
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Permission title (e.g., Create Property)"
              value={permTitle}
              onChange={(e) => setPermTitle(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            <textarea
              placeholder="Description (optional)"
              value={permDesc}
              onChange={(e) => setPermDesc(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              rows={2}
            />
          </div>

          <button
            type="button"
            onClick={handleAddPermission}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
          >
            + Add Permission
          </button>
        </div>

        {permissions.length > 0 && (
          <SimpleTable data={permissions} columns={columns} />
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
          >
            {loading
              ? "Saving..."
              : isAdding?._id
              ? "Update Permission Set"
              : "Create Permission Set"}
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
