import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { Column, DashboardOutletContextProps } from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { RequirementValidation } from "../../contexts/ValidationsSchemas";
import { useOutletContext } from "react-router-dom";
import {
  getErrorResponse,
  getFormikError,
  matchPermissions,
} from "../../contexts/Callbacks";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

export interface RequirementsProps extends Record<string, unknown> {
  _id: string;
  uniqueId: number;
  requirment: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function Requirements() {
  const [requirements, setRequirements] = useState<RequirementsProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRequirement, setEditingRequirement] =
    useState<RequirementsProps | null>(null);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getAllRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/requirment/all");
      setRequirements(response.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllRequirements();
  }, [getAllRequirements]);

  // ✅ Create Formik
  const formik = useFormik({
    initialValues: {
      requirment: "",
    },
    validationSchema: RequirementValidation,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await API.post("/requirment", values);
        toast.success(
          response.data.message || "Requirment created successfully"
        );
        resetForm();
        getAllRequirements();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  // ✅ Update Formik
  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      requirment: editingRequirement?.requirment || "",
    },
    validationSchema: RequirementValidation,
    onSubmit: async (values, { resetForm }) => {
      if (!editingRequirement) return;
      try {
        const response = await API.patch(
          `/requirment/${editingRequirement._id}`,
          values
        );
        toast.success(
          response.data.message || "Requirments updated successfully"
        );
        resetForm();
        setEditingRequirement(null);
        getAllRequirements();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  // ✅ Columns
  const columns = useMemo<Column<RequirementsProps>[]>(
    () => [
      { value: "requirment", label: "Requirment" },
      {
        label: "Actions",
        value: (row: RequirementsProps) => (
          <div className="flex space-x-2">
            {!authLoading &&
              matchPermissions(authUser?.permissions, "Update Requirment") && (
                <TableButton
                  Icon={Edit2}
                  color="green"
                  size="sm"
                  buttontype="button"
                  onClick={() => setEditingRequirement(row)}
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
        title="Requirments"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Requirments" },
        ]}
      />

      {/* ✅ Create Requirment Form */}
      <div className="bg-[var(--yp-primary)] p-4 sm:p-6 rounded-2xl shadow-sm mb-5">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[var(--yp-text-secondary)]">
          Create Requirment
        </h3>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            name="requirment"
            placeholder="Enter Requirment"
            value={formik.values.requirment}
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
        {getFormikError(formik, "requirment")}
      </div>

      {/* ✅ Data Table */}
      <DataTable<RequirementsProps> data={requirements} columns={columns} />

      {/* ✅ Edit Modal */}
      {editingRequirement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--yp-primary)] p-6 rounded-xl shadow-sm w-full max-w-md">
            <h3 className="text-lg font-semibold text-[var(--yp-text-secondary)] mb-4">
              Edit Requirment
            </h3>
            <form
              onSubmit={editFormik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                name="requirment"
                placeholder="Enter Requirment"
                value={editFormik.values.requirment}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(editFormik, "requirment")}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRequirement(null)}
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
