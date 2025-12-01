import { useState, useMemo, useCallback, useEffect } from "react";
import { LanguageProps, type Column } from "../../../types/types";
import { DataTable } from "../../../ui/tables/DataTable";
import { API } from "../../../contexts/API";
import {
  formatDateWithoutTime,
  getErrorResponse,
  getFormikError,
} from "../../../contexts/Callbacks";
import TableButton from "../../../ui/button/TableButton";
import { Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { LanguageValidation } from "../../../contexts/ValidationsSchemas";
import { useFormik } from "formik";
import TableSkeletonWithOutCards from "../../../ui/loadings/pages/TableSkeletonWithOutCards";

export function ProfessionalLanguages() {
  const [languages, setLanguage] = useState<LanguageProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LanguageProps | null>(null);

  const getAllLanguages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/profile/language/all/list");
      setLanguage(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllLanguages();
  }, [getAllLanguages]);

  const columns = useMemo<Column<LanguageProps>[]>(
    () => [
      { value: "language" as keyof LanguageProps, label: "Language" },
      {
        value: (row: LanguageProps) => (
          <>{formatDateWithoutTime(row?.createdAt)}</>
        ),
        label: "Created At",
        key: "createdAt",
        sortingKey: "createdAt",
      },
      {
        label: "Actions",
        value: (row: LanguageProps) => (
          <div className="flex space-x-2">
            <TableButton
              Icon={Edit2}
              color="green"
              size="sm"
              buttontype="button"
              onClick={() => setEditing(row)}
            />
          </div>
        ),
      },
    ],
    []
  );
  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      language: editing?.language || "",
    },
    validationSchema: LanguageValidation,
    onSubmit: async (values, { resetForm }) => {
      if (!editing) return;
      console.log(values);
      try {
        const response = await API.patch(
          `/profile/language/${editing._id}`,
          values
        );
        toast.success(
          response.data.message || "Requirments updated successfully"
        );
        resetForm();
        setEditing(null);
        getAllLanguages();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div className="space-y-6">
      <DataTable<LanguageProps> data={languages} columns={columns} />

      {editing && (
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
                name="language"
                placeholder="Enter Requirment"
                value={editFormik.values.language}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(editFormik, "language")}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
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
