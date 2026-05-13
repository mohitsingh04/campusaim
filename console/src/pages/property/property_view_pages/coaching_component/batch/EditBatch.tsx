import { useFormik } from "formik";
import { useState } from "react";
import { XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { DashboardOutletContextProps } from "../../../../../types/types";
import { API } from "../../../../../contexts/API";
import {
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../../../../contexts/Callbacks";
import ToggleButton from "../../../../../ui/button/ToggleButton";

interface BatchItem {
  _id: string;
  batch_name: string;
  batch_size: number;
  batch_start_time: string;
  batch_end_time: string;
  price: number;
  included: string[];
  certificate: boolean;
  certificate_after?: number;
  demo_class?: number;
  status: string;
}

export default function EditBatch({
  onSave,
  cancel,
  batch,
}: {
  onSave: () => void;
  cancel: () => void;
  batch: BatchItem;
}) {
  const { status } = useOutletContext<DashboardOutletContextProps>();
  const [includesInput, setIncludesInput] = useState("");

  const formik = useFormik({
    initialValues: {
      batch_name: batch.batch_name || "",
      batch_size: batch.batch_size || 0,
      batch_start_time: batch.batch_start_time || "",
      batch_end_time: batch.batch_end_time || "",
      certificate: batch.certificate || false,
      certificate_after: batch.certificate_after || "",
      demo_class: batch.demo_class || "",
      included: batch.included || [],
      price: batch.price || "",
      status: batch.status || "Active",
    },
    // validationSchema: PropertyBatchValidation,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const response = await API.patch(`/batch/update/${batch._id}`, values);
        toast.success(response.data.message);
        onSave();
        cancel();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  const handleAddIncludes = () => {
    if (!includesInput.trim()) return;
    formik.setFieldValue("included", [
      ...formik.values.included,
      includesInput.trim(),
    ]);
    setIncludesInput("");
  };

  const handleRemoveIncludes = (index: number) => {
    const updatedIncludes = formik.values.included.filter(
      (_, i) => i !== index,
    );
    formik.setFieldValue("included", updatedIncludes);
  };

  return (
    <div className="p-4">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batch Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Batch Name
            </label>
            <input
              type="text"
              name="batch_name"
              value={formik.values.batch_name}
              onChange={formik.handleChange}
              placeholder="Enter Batch Name"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "batch_name")}
          </div>

          {/* Batch Size */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Batch Size (Max Students)
            </label>
            <input
              type="number"
              name="batch_size"
              value={formik.values.batch_size}
              onChange={formik.handleChange}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "batch_size")}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Start Time
            </label>
            <input
              type="time"
              name="batch_start_time"
              value={formik.values.batch_start_time}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "batch_start_time")}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              End Time
            </label>
            <input
              type="time"
              name="batch_end_time"
              value={formik.values.batch_end_time}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "batch_end_time")}
          </div>

          {/* Toggle */}
          <div className="flex flex-col justify-end">
            <ToggleButton
              label="Enable Certificate"
              enabled={formik.values.certificate}
              onToggle={(val) => formik.setFieldValue("certificate", val)}
            />
          </div>

          {/* Certificate After */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Certificate After (Days/Classes)
            </label>
            <input
              type="text"
              name="certificate_after"
              value={formik.values.certificate_after}
              onChange={formik.handleChange}
              placeholder="e.g. 10"
              disabled={!formik.values.certificate}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {getFormikError(formik, "certificate_after")}
          </div>

          {/* Demo Class */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Demo Class Details
            </label>
            <input
              type="text"
              name="demo_class"
              value={formik.values.demo_class}
              onChange={formik.handleChange}
              placeholder="Enter Demo Details"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "demo_class")}
          </div>

          {/* Status Field */}
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
              {getStatusAccodingToField(status, "batch").map((opt, index) => (
                <option key={index} value={opt?.parent_status}>
                  {opt?.parent_status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)]">
              Price (₹ Rupees)
            </label>
            <input
              type="number"
              {...formik.getFieldProps("price")}
              placeholder="Amount"
              min={0}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
          </div>

          {/* What's Included */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              What's Included
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={includesInput}
                onChange={(e) => setIncludesInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddIncludes();
                  }
                }}
                placeholder="e.g. Life-time access, PDF notes"
                className="flex-1 px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              <button
                type="button"
                onClick={handleAddIncludes}
                className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {getFormikError(formik, "included")}
            <div className="flex flex-wrap gap-2">
              {formik.values.included.map((item, index) => (
                <span
                  key={index}
                  className="flex items-center px-3 py-1 bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] rounded-full text-sm border border-[var(--yp-border-primary)]"
                >
                  {item}
                  <XIcon
                    className="ml-2 w-4 h-4 cursor-pointer hover:text-[var(--yp-danger)]"
                    onClick={() => handleRemoveIncludes(index)}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] disabled:opacity-50"
          >
            Update Batch
          </button>
          <button
            onClick={cancel}
            type="button"
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
