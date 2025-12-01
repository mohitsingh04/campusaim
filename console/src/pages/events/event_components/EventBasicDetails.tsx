import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { useFormik } from "formik";
import { Plus, X } from "lucide-react";
import * as Yup from "yup";
import {
  getCategoryAccodingToField,
  getFormikError,
} from "../../../contexts/Callbacks";
import { useOutletContext } from "react-router-dom";
import { DashboardOutletContextProps } from "../../../types/types";
import {
  currencyOptions,
  reactSelectDesignClass,
} from "../../../common/ExtraData";

// TYPES
type OptionType = { value: string; label: string };
type PricesType = Record<string, string>;

interface StepOneProps {
  onNext: (values: any) => void;
  defaultData: any;
}

// Validation
const StepOneSchema = Yup.object({
  title: Yup.string().required("Required"),
  entrance_type: Yup.string().required("Required"),
});

export default function EventBasicDetails({
  onNext,
  defaultData,
}: StepOneProps) {
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [priceInputs, setPriceInputs] = useState({
    currency: "INR",
    amount: "",
  });

  const { categories } = useOutletContext<DashboardOutletContextProps>();

  useEffect(() => {
    const opts =
      getCategoryAccodingToField(categories, "events").map((c) => ({
        value: c._id,
        label: c.category_name,
      })) || [];

    setCategoryOptions(opts);
  }, [categories]);

  const formik = useFormik({
    initialValues: {
      title: defaultData?.title || "",
      language: (defaultData?.language || []) as string[],
      category: (defaultData?.category || []) as OptionType[],
      entrance_type: defaultData?.entrance_type || "",
      price: (defaultData?.price || {}) as PricesType,

      // NEW FIELD
      event_website: defaultData?.event_website || "",
    },
    validationSchema: StepOneSchema,
    onSubmit: (values) => {
      onNext(values);
    },
  });

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

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
          Title
        </label>
        <input
          type="text"
          {...formik.getFieldProps("title")}
          className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
        />
        {getFormikError(formik, "title")}
      </div>

      {/* NEW FIELD — Event Website */}
      <div>
        <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
          Event Website
        </label>
        <input
          type="url"
          placeholder="https://example.com"
          {...formik.getFieldProps("event_website")}
          className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
        />
        {getFormikError(formik, "event_website")}
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
            classNames={reactSelectDesignClass}
            placeholder="Add languages..."
          />
          {getFormikError(formik, "language")}
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
            classNames={reactSelectDesignClass}
            placeholder="Select categories..."
          />
          {getFormikError(formik, "category")}
        </div>
      </div>

      {/* Entrance Type */}
      <div>
        <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
          Entrance Type
        </label>
        <select
          {...formik.getFieldProps("entrance_type")}
          className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
        >
          <option value="">Select type</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        {getFormikError(formik, "entrance_type")}
      </div>

      {/* Price */}
      {formik.values.entrance_type === "paid" && (
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Prices
          </label>

          <div className="flex gap-2 mb-2">
            <select
              value={priceInputs.currency}
              onChange={(e) =>
                setPriceInputs({
                  ...priceInputs,
                  currency: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
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
              placeholder="Amount"
              value={priceInputs.amount}
              onChange={(e) =>
                setPriceInputs({ ...priceInputs, amount: e.target.value })
              }
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />

            <button
              type="button"
              onClick={handleAddPrice}
              className="p-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(formik.values.price).map(([cur, amt]) => (
              <span
                key={cur}
                className="inline-flex items-center bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] px-3 py-1 rounded-full"
              >
                {cur}: {amt}
                <button
                  type="button"
                  onClick={() => handleRemovePrice(cur)}
                  className="ml-2 text-[var(--yp-red-text)]"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          {getFormikError(formik, "price")}
        </div>
      )}

      {/* Next Button */}
      <div className="pt-4">
        <button
          type="submit"
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Next
        </button>
      </div>
    </form>
  );
}
