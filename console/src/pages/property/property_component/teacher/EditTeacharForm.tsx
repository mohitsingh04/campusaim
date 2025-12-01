import { ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import {
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../../../contexts/Callbacks";
import { StatusProps, TeacherProps } from "../../../../types/types";
import { TeacherValidation } from "../../../../contexts/ValidationsSchemas";

const inputClass =
  "w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]";
export function EditTeacherForm({
  onBack,
  teacher,
}: {
  onBack: () => void;
  teacher: TeacherProps;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<StatusProps[]>([]);

  // ✅ fetch statuses on mount
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await API.get("/status");
        setStatuses(res.data || []);
      } catch (error) {
        getErrorResponse(error, true);
      }
    };
    fetchStatuses();
  }, []);

  const formik = useFormik({
    initialValues: {
      teacher_name: teacher?.teacher_name || "",
      designation: teacher?.designation || "",
      expValue: teacher?.experience?.split(" ")?.[0] || "",
      expType: teacher?.experience?.split(" ")?.[1] || "",
      profile: null as File | null,
      status: teacher?.status || "",
    },
    enableReinitialize: true,
    validationSchema: TeacherValidation,
    onSubmit: async (values) => {
      const experience = `${values.expValue} ${values.expType}`;
      const formData = new FormData();

      formData.append("teacher_name", values.teacher_name);
      formData.append("designation", values.designation);
      formData.append("experience", experience);
      formData.append("status", values.status);

      if (values.profile) {
        formData.append("profile", values.profile);
      }

      try {
        const res = await API.patch(`/teacher/${teacher._id}`, formData);
        toast.success(res.data.message);
        onBack();
        formik.resetForm();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      formik.setFieldValue("profile", file);
    }
  };

  return (
    <section className="p-4">
      <form
        onSubmit={formik.handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* Teacher Name */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Teacher Name
          </label>
          <input
            type="text"
            name="teacher_name"
            placeholder="Enter teacher name"
            className={inputClass}
            value={formik.values.teacher_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {getFormikError(formik, "teacher_name")}
        </div>

        {/* Designation */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Designation
          </label>
          <input
            type="text"
            name="designation"
            placeholder="Enter designation"
            className={inputClass}
            value={formik.values.designation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {getFormikError(formik, "designation")}
        </div>

        {/* Experience Value */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Experience
          </label>
          <input
            type="number"
            name="expValue"
            placeholder="Enter experience value"
            className={inputClass}
            value={formik.values.expValue}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {getFormikError(formik, "expValue")}
        </div>

        {/* Experience Type */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Experience Type
          </label>
          <select
            name="expType"
            className={inputClass}
            value={formik.values.expType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">--select type--</option>
            <option value="years">Years</option>
            <option value="months">Months</option>
          </select>
          {getFormikError(formik, "expType")}
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Status
          </label>
          <select
            name="status"
            className={inputClass}
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">--select status--</option>
            {getStatusAccodingToField(statuses, "teacher").map(
              (s: StatusProps) => (
                <option key={s._id} value={s.parent_status}>
                  {s.parent_status}
                </option>
              )
            )}
          </select>
          {getFormikError(formik, "status")}
        </div>

        {/* Upload Profile */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Profile Picture
          </label>
          <label className="flex flex-col items-center justify-center w-full h-40 border border-dashed border-[var(--yp-border-primary)] rounded-lg cursor-pointer bg-[var(--yp-input-primary)]">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-full object-contain rounded-lg"
              />
            ) : teacher?.profile?.[0] ? (
              <img
                src={`${import.meta.env.VITE_MEDIA_URL}/${teacher.profile[0]}`}
                alt="Preview"
                className="h-full object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--yp-text-secondary)]" />
                <p className="text-[var(--yp-muted)] mt-2 text-xs sm:text-sm">
                  Click to upload profile picture
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Buttons */}
        <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-between gap-3 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
          >
            {teacher?._id ? "Update Teacher" : "Save Teacher"}
          </button>
        </div>
      </form>
    </section>
  );
}
