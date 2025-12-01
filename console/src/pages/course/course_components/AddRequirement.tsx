"use client";

import { createPortal } from "react-dom";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { RequirementValidation } from "../../../contexts/ValidationsSchemas";
import { getErrorResponse, getFormikError } from "../../../contexts/Callbacks";
import { API } from "../../../contexts/API";
import { ReqKoItem } from "../../../types/types";

export default function AddRequirement({
  onClose,
  isOpen,
  getData,
  requirments,
}: {
  isOpen: boolean;
  getData: () => void;
  onClose: any;
  requirments: ReqKoItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const [filtered, setFiltered] = useState<ReqKoItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => setMounted(true), []);

  const formik = useFormik({
    initialValues: {
      requirment: "",
    },
    validationSchema: RequirementValidation,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await API.post("/requirment", values);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    const query = e.target.value.toLowerCase();

    if (query.trim() === "") {
      setFiltered([]);
      setShowDropdown(false);
      return;
    }

    const matches = requirments.filter((item) =>
      item?.requirment?.toLowerCase()?.includes(query)
    );
    setFiltered(matches);
    setShowDropdown(matches.length > 0);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-[var(--yp-primary)] p-6 rounded-xl shadow-sm w-full max-w-md relative">
        <h3 className="text-lg font-semibold text-[var(--yp-text-secondary)] mb-4">
          Add Requirement
        </h3>

        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-4 relative"
        >
          <div className="relative">
            <input
              type="text"
              name="requirment"
              placeholder="Enter Requirement"
              value={formik.values.requirment}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              autoComplete="off"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />

            {/* Dropdown Suggestions */}
            {showDropdown && (
              <ul className="absolute z-50 mt-1 w-full bg-[var(--yp-primary)] border border-[var(--yp-border-primary)] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filtered.map((item, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-[var(--yp-secondary)] text-[var(--yp-text-primary)]"
                  >
                    {item.requirment}
                  </li>
                ))}
              </ul>
            )}
            {getFormikError(formik, "requirment")}
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
