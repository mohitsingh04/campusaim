import { useState, useMemo, useCallback, useEffect } from "react";
import { SkillProps, type Column } from "../../../types/types";
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
import { SkillsValidation } from "../../../contexts/ValidationsSchemas";
import { useFormik } from "formik";
import TableSkeletonWithOutCards from "../../../ui/loadings/pages/TableSkeletonWithOutCards";

export function ProfessionalSkills() {
  const [skills, setSkills] = useState<[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SkillProps | null>(null);

  const getAllSkills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/profile/skill/all/list");
      setSkills(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllSkills();
  }, [getAllSkills]);

  const columns = useMemo<Column<SkillProps>[]>(
    () => [
      { value: "skill" as keyof SkillProps, label: "Skill" },
      {
        value: (row: SkillProps) => (
          <>{formatDateWithoutTime(row?.createdAt)}</>
        ),
        label: "Created At",
        key: "createdAt",
        sortingKey: "createdAt",
      },
      {
        label: "Actions",
        value: (row: SkillProps) => (
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

  // ✅ Update Formik
  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      skill: editing?.skill || "",
    },
    validationSchema: SkillsValidation,
    onSubmit: async (values, { resetForm }) => {
      if (!editing) return;
      try {
        const response = await API.patch(
          `/profile/skill/${editing._id}`,
          values
        );
        toast.success(
          response.data.message || "Requirments updated successfully"
        );
        resetForm();
        setEditing(null);
        getAllSkills();
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
      <DataTable<SkillProps> data={skills} columns={columns} />
      {/* ✅ Edit Modal */}
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
                name="skill"
                placeholder="Enter Requirment"
                value={editFormik.values.skill}
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(editFormik, "skill")}

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
