import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { Column, DashboardOutletContextProps } from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { KeyOutComeValidation } from "../../contexts/ValidationsSchemas";
import { useOutletContext } from "react-router-dom";
import {
  getErrorResponse,
  getFormikError,
  matchPermissions,
} from "../../contexts/Callbacks";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

export interface KeyOutComesProps extends Record<string, unknown> {
  _id: string;
  uniqueId: number;
  key_outcome: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function KeyOutComes() {
  const [outcomes, setOutcomes] = useState<KeyOutComesProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOutcome, setEditingOutcome] = useState<KeyOutComesProps | null>(
    null
  );
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getAllOutcomes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/key-outcome/all");
      setOutcomes(response.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllOutcomes();
  }, [getAllOutcomes]);

  // ✅ Create Formik
  const formik = useFormik({
    initialValues: {
      key_outcome: "",
    },
    validationSchema: KeyOutComeValidation,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await API.post("/key-outcome", values);
        toast.success(response.data.message || "Outcome created successfully");
        resetForm();
        getAllOutcomes();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  // ✅ Update Formik
  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      key_outcome: editingOutcome?.key_outcome || "",
    },
    validationSchema: KeyOutComeValidation,
    onSubmit: async (values, { resetForm }) => {
      if (!editingOutcome) return;
      try {
        const response = await API.patch(
          `/key-outcome/${editingOutcome._id}`,
          values
        );
        toast.success(response.data.message || "Outcome updated successfully");
        resetForm();
        setEditingOutcome(null); // close modal
        getAllOutcomes();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  // ✅ Columns
  const columns = useMemo<Column<KeyOutComesProps>[]>(
    () => [
      { value: "key_outcome", label: "Key Outcome" },
      {
        label: "Actions",
        value: (row: KeyOutComesProps) => (
          <div className="flex space-x-2">
            {!authLoading &&
              matchPermissions(
                authUser?.permissions,
                "Update Key Outcome"
              ) && (
                <TableButton
                  Icon={Edit2}
                  color="green"
                  size="sm"
                  buttontype="button"
                  onClick={() => setEditingOutcome(row)}
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
        title="Key Outcomes"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Key Outcomes" },
        ]}
      />

      {/* ✅ Create Outcome Form */}
      <div className="bg-[var(--yp-primary)] p-4 sm:p-6 rounded-2xl shadow-sm mb-5">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[var(--yp-text-secondary)]">
          Create Key Outcomes
        </h3>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            name="key_outcome"
            placeholder="Enter Outcome"
            value={formik.values.key_outcome}
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
        {getFormikError(formik, "key_outcome")}
      </div>

      {/* ✅ Data Table */}
      <DataTable<KeyOutComesProps> data={outcomes} columns={columns} />

      {/* ✅ Edit Modal */}
      {editingOutcome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--yp-primary)] p-6 rounded-xl shadow-sm w-full max-w-md">
            <h3 className="text-lg font-semibold text-[var(--yp-text-secondary)] mb-4">
              Edit Key Outcome
            </h3>
            <form
              onSubmit={editFormik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                name="key_outcome"
                placeholder="Enter Outcome"
                value={editFormik.values.key_outcome}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(editFormik, "key_outcome")}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingOutcome(null)}
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
