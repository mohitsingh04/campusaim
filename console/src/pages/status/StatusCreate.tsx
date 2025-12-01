import { useFormik } from "formik";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext } from "react-router-dom";
import { API } from "../../contexts/API";
import { statusValidation } from "../../contexts/ValidationsSchemas";
import { DashboardOutletContextProps, StatusProps } from "../../types/types";
import { getErrorResponse, getFormikError } from "../../contexts/Callbacks";

export function StatusCreate() {
  const redirector = useNavigate();
  const { status } = useOutletContext<DashboardOutletContextProps>();

  const formik = useFormik({
    initialValues: {
      status_name: "",
      parent_status: "",
      description: "",
    },
    validationSchema: statusValidation,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const response = await API.post("/status", values);
        toast.success(response.data.message || "Status Created Successfully");
        redirector(`/dashboard/status`);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Create Status"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Status", path: "/dashboard/status" },
          { label: "Create" },
        ]}
      />

      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {/* Row: Status + Parent Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Name (Select) */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Status
              </label>
              <select
                name="status_name"
                value={formik.values.status_name}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="" disabled>
                  -- Select Status --
                </option>
                <option value="Uncategorized">Uncategorized</option>
                {status
                  .filter(
                    (item: StatusProps) =>
                      !["Active", "Pending", "Suspended"].includes(
                        item.parent_status
                      )
                  )
                  ?.map((status, index) => (
                    <option key={index} value={status.parent_status}>
                      {status.parent_status}
                    </option>
                  ))}
              </select>
              {getFormikError(formik, "status_name")}
            </div>

            {/* Parent Status (Input) */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Parent Status
              </label>
              <input
                type="text"
                name="parent_status"
                value={formik.values.parent_status}
                onChange={formik.handleChange}
                placeholder="Enter parent status"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "parent_status")}
            </div>
          </div>

          {/* Description (full width) */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              placeholder="Enter description"
              rows={4}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
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
              {formik?.isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
