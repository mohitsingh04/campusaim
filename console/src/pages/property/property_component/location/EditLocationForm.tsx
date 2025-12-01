import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import {
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import { PropertyProps } from "../../../../types/types";

// Form values
interface FormValues {
  property_address: string;
  property_pincode: string;
  property_country: string;
  property_state: string;
  property_city: string;
  country_name: string;
  state_name: string;
  city_name: string;
}

interface EditLocationFormProps {
  location: PropertyProps | null;
  countries: { country_name: string }[];
  states: { name: string }[];
  cities: { name: string }[];
  getPropertyLocation: () => void;
  setSelectedCountry: (country: string) => void;
  setSelectedState: (state: string) => void;
}

const validationSchema = Yup.object({
  property_address: Yup.string().required("Address is required"),
  property_pincode: Yup.string()
    .matches(/^\d{6}$/, "Must be a valid 6 digit pincode")
    .required("Pincode is required"),
  property_country: Yup.string().nullable(),
  property_state: Yup.string().nullable(),
  property_city: Yup.string().nullable(),
  country_name: Yup.string().nullable(),
  state_name: Yup.string().nullable(),
  city_name: Yup.string().nullable(),
});

export default function EditLocationForm({
  location,
  countries,
  states,
  cities,
  setSelectedCountry,
  getPropertyLocation,
  setSelectedState,
}: EditLocationFormProps) {
  const [editableField, setEditableField] = useState<keyof FormValues | null>(
    null
  );

  const formik = useFormik<FormValues>({
    initialValues: {
      property_address: location?.property_address || "",
      property_pincode: location?.property_pincode || "",
      property_country: location?.property_country || "",
      property_state: location?.property_state || "",
      property_city: location?.property_city || "",
      country_name: "",
      state_name: "",
      city_name: "",
    },
    validationSchema,
    onSubmit: async () => {}, // handled per-field
    enableReinitialize: true,
  });

  useEffect(() => {
    setSelectedCountry(formik.values.property_country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.property_country]);

  useEffect(() => {
    setSelectedState(formik.values.property_state);
  }, [formik.values.property_state, setSelectedState]);

  const cancelEdit = () => {
    setEditableField(null);
  };

  const saveField = async (field: keyof FormValues) => {
    try {
      if ((validationSchema as any)?.fields?.[field]) {
        await formik.validateField(field);
        if (formik.errors[field]) return;
      }

      type Payload =
        | Partial<FormValues>
        | { country_name: string }
        | { state_name: string }
        | { city_name: string };

      let payload: Payload = {};

      if (
        field === "property_country" &&
        formik.values.property_country === "Other"
      ) {
        payload = { country_name: formik.values.country_name };
      } else if (
        field === "property_state" &&
        formik.values.property_state === "Other"
      ) {
        payload = { state_name: formik.values.state_name };
      } else if (
        field === "property_city" &&
        formik.values.property_city === "Other"
      ) {
        payload = { city_name: formik.values.city_name };
      } else {
        payload = { [field]: formik.values[field] };
      }

      const response = await API.patch(
        `/property/location/${location?.property_id}`,
        payload
      );
      toast.success(response.data.message);

      getPropertyLocation();
      setEditableField(null);
    } catch (error) {
      getErrorResponse(error);
    }
  };

  /** Reusable field block */
  const renderField = (
    label: string,
    field: keyof FormValues,
    type: "input" | "dropdown",
    options?: string[],
    customField?: keyof FormValues
  ) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
        {label}
      </label>

      {editableField === field ? (
        <div className="space-y-2">
          {type === "input" ? (
            <input
              type="text"
              name={field}
              value={formik.values[field]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
          ) : (
            <select
              name={field}
              value={formik.values[field]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            >
              <option value="">Select {label}</option>
              {options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          )}

          {/* Show custom input if "Other" selected */}
          {type === "dropdown" &&
            formik.values[field] === "Other" &&
            customField && (
              <input
                type="text"
                name={customField}
                placeholder={`Enter ${label.toLowerCase()} name`}
                value={formik.values[customField]}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
            )}

          {/* Save + Cancel actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveField(field)}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-[var(--yp-border-primary)] px-4 py-2 bg-[var(--yp-secondary)]">
          <span className="text-[var(--yp-text-primary)] text-ellipsis break-words line-clamp-1">
            {formik.values[field] || `No ${label}`}
          </span>
          <button
            type="button"
            onClick={() => setEditableField(field)}
            className="text-[var(--yp-main)]"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}

      {getFormikError(formik, field)}
    </div>
  );

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderField("Property Address", "property_address", "input")}
        {renderField("Property Pincode", "property_pincode", "input")}
        {renderField(
          "Country",
          "property_country",
          "dropdown",
          countries.map((c) => c.country_name),
          "country_name"
        )}
        {renderField(
          "State",
          "property_state",
          "dropdown",
          states.map((s) => s.name),
          "state_name"
        )}
        {renderField(
          "City",
          "property_city",
          "dropdown",
          cities.map((c) => c.name),
          "city_name"
        )}
      </div>
    </div>
  );
}
