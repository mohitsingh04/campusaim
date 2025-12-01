import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { useFormik } from "formik";
import { X, Plus } from "lucide-react";
import * as Yup from "yup";
import {
  getCategoryAccodingToField,
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../../../contexts/Callbacks";
import {
  reactSelectDesignClass,
  currencyOptions,
} from "../../../../common/ExtraData";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { useOutletContext, useParams } from "react-router-dom";
import {
  DashboardOutletContextProps,
  EventsProps,
} from "../../../../types/types";

// Types
type OptionType = { value: string; label: string };

export default function EventBasicDetailsEditModal({
  isOpen,
  onClose,
  data,
  onSave,
}: {
  isOpen: boolean;
  onClose: any;
  data: EventsProps;
  onSave: () => void;
}) {
  // Hooks MUST run first
  const [mounted, setMounted] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [priceInputs, setPriceInputs] = useState({
    currency: "INR",
    amount: "",
  });
  const { status, categories } =
    useOutletContext<DashboardOutletContextProps>();
  const { objectId } = useParams();

  // SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prepare category options list
  useEffect(() => {
    if (!categories) return;
    const opts =
      getCategoryAccodingToField(categories, "events").map((c) => ({
        value: c._id,
        label: c.category_name,
      })) || [];
    setCategoryOptions(opts);
  }, [categories]);

  // Correct FIX for category IDs → select options
  const mapCategoryIdsToOptions = (ids: string[]) => {
    if (!Array.isArray(ids)) return [];

    return ids
      .map((id) => {
        const found = categories.find((cat: any) => cat._id === id);
        return found ? { value: found._id, label: found.category_name } : null;
      })
      .filter(Boolean);
  };

  // Formik
  const formik = useFormik({
    initialValues: {
      title: data?.title || "",
      language: data?.language || [],
      status: data?.status || "",
      category: mapCategoryIdsToOptions(data?.categoryId || []),

      entrance_type: data?.entrance_type || "",
      price: data?.price || {},
    },

    validationSchema: Yup.object({
      title: Yup.string().required("Required"),
      entrance_type: Yup.string().required("Required"),
    }),

    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);

      try {
        const finalCategory = values.category?.map((item) => item?.value);
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("language", JSON.stringify(values.language));
        formData.append("entrance_type", values.entrance_type);
        formData.append("price", JSON.stringify(values.price));
        formData.append("status", values.status);
        formData.append("category", JSON.stringify(finalCategory));

        const response = await API.patch(`/event/${objectId}`, formData);

        toast.success(response.data.message || "Event updated successfully!");
        onSave();
        onClose();
      } catch (err) {
        getErrorResponse(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Only now we can conditionally return
  if (!mounted || !isOpen) return null;

  const handleAddPrice = () => {
    if (!priceInputs.amount) return;
    formik.setFieldValue("price", {
      ...formik.values.price,
      [priceInputs.currency]: priceInputs.amount,
    });
    setPriceInputs({ ...priceInputs, amount: "" });
  };

  const handleRemovePrice = (cur: string) => {
    const updated = { ...formik.values.price };
    delete updated[cur];
    formik.setFieldValue("price", updated);
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[var(--yp-primary)] rounded-xl shadow-lg p-6 relative">
        <h2 className="text-xl font-semibold text-[var(--yp-text-primary)] mb-4">
          Edit Basic Details
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Title
            </label>

            <input
              type="text"
              {...formik.getFieldProps("title")}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
                         rounded-lg bg-[var(--yp-input-primary)]
                         text-[var(--yp-text-primary)]"
            />

            {getFormikError(formik, "title")}
          </div>

          {/* Language + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Language
              </label>

              <CreatableSelect
                isMulti
                value={formik.values.language.map((l: string) => ({
                  value: l,
                  label: l,
                }))}
                onChange={(selected) =>
                  formik.setFieldValue(
                    "language",
                    selected ? selected.map((s) => s.value) : []
                  )
                }
                placeholder="Add languages..."
                classNames={reactSelectDesignClass}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Category
              </label>

              <Select
                isMulti
                options={categoryOptions}
                value={formik.values.category}
                onChange={(selected) =>
                  formik.setFieldValue("category", selected || [])
                }
                placeholder="Select categories..."
                classNames={reactSelectDesignClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Status
            </label>
            <select
              {...formik.getFieldProps("status")}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            >
              <option value="">Select Status</option>
              {getStatusAccodingToField(status, "Event").map((item, index) => (
                <option value={item?.parent_status} key={index}>
                  {item?.parent_status}
                </option>
              ))}
            </select>
            {getFormikError(formik, "status")}
          </div>

          {/* Entrance Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Entrance Type
            </label>

            <select
              {...formik.getFieldProps("entrance_type")}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
                         rounded-lg bg-[var(--yp-input-primary)]
                         text-[var(--yp-text-primary)]"
            >
              <option value="">Select</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Price Section */}
          {formik.values.entrance_type === "paid" && (
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Prices
              </label>

              <div className="flex gap-2 mb-2">
                <select
                  value={priceInputs.currency}
                  onChange={(e) =>
                    setPriceInputs({ ...priceInputs, currency: e.target.value })
                  }
                  className="px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg
                             bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                >
                  <option value="">Select Currency</option>
                  {currencyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={priceInputs.amount}
                  placeholder="Amount"
                  onChange={(e) =>
                    setPriceInputs({ ...priceInputs, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg
                             bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />

                <button
                  type="button"
                  onClick={handleAddPrice}
                  className="p-2 rounded-lg bg-[var(--yp-green-bg)]
                             text-[var(--yp-green-text)]"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(formik.values.price).map(([cur, amt]) => (
                  <span
                    key={cur}
                    className="inline-flex items-center px-3 py-1 rounded-full
                               bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                  >
                    {cur}: {amt}
                    <button
                      type="button"
                      onClick={() => handleRemovePrice(cur)}
                      className="ml-2 p-1 rounded-md bg-[var(--yp-red-bg)]
                                 text-[var(--yp-red-text)]"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[var(--yp-red-bg)]
                         text-[var(--yp-red-text)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[var(--yp-blue-bg)]
                         text-[var(--yp-blue-text)]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
