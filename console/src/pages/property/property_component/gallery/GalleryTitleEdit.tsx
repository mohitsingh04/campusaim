import { createPortal } from "react-dom";
import {
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { useFormik } from "formik";
import { galleryTitleValidation } from "../../../../contexts/ValidationsSchemas";

export default function GalleryTitleEdit({
  onClose,
  isOpen,
  getData,
}: {
  isOpen: any;
  getData: () => void;
  onClose: any;
}) {
  const formik = useFormik({
    initialValues: {
      uniqueId: isOpen?.uniqueId || "",
      title: isOpen?.title || "",
    },
    enableReinitialize: true,
    validationSchema: galleryTitleValidation,
    onSubmit: async (values, { resetForm }) => {
      console.log("object");
      try {
        const response = await API.patch("/gallery/update/title", values);
        toast.success(
          response.data.message || "Requirement created successfully"
        );
        resetForm();
        getData();
        onClose(false);
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-[var(--yp-primary)] p-6 rounded-xl shadow-sm w-full max-w-md relative">
        <h3 className="text-lg font-semibold text-[var(--yp-text-secondary)] mb-4">
          Edit Gallery Title
        </h3>

        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-4 relative"
        >
          <div className="relative">
            <input
              type="text"
              name="title"
              placeholder="Enter Requirement"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="off"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "title")}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-text-primary)] bg-[var(--yp-secondary)] hover:opacity-90 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] hover:opacity-90 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
