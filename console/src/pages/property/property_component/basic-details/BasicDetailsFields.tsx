import { useState } from "react";
import { Pencil } from "lucide-react";
import { useFormik } from "formik";
import PhoneInput from "react-phone-input-2";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import {
  CategoryProps,
  DashboardOutletContextProps,
} from "../../../../types/types";
import {
  getCategoryAccodingToField,
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import { propertyBasicDetailsValidationSchema } from "../../../../contexts/ValidationsSchemas";
import { phoneInputClass } from "../../../../common/ExtraData";
import { useOutletContext } from "react-router-dom";

interface EditBasicDetailsFormProps {
  property: any;
  categories: CategoryProps[];
  getCategoryById: (id: string) => string | undefined;
  getPropertyBasicDetails: () => void;
}

export default function BasicDetailsFields({
  property,
  categories,
  getCategoryById,
  getPropertyBasicDetails,
}: EditBasicDetailsFormProps) {
  const { authUser } = useOutletContext<DashboardOutletContextProps>();
  const [editableField, setEditableField] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      property_name: property?.property_name || "",
      property_email: property?.property_email || "",
      property_mobile_no: property?.property_mobile_no || "",
      property_alt_mobile_no: property?.property_alt_mobile_no || "",
      property_website: property?.property_website || "",
      category: property?.category || "",
      property_type: property?.property_type || "",
      est_year: property?.est_year || "",
      status: property?.status || "",
    },
    validationSchema: propertyBasicDetailsValidationSchema,
    onSubmit: async () => {},
    enableReinitialize: true,
  });

  const cancelEdit = () => setEditableField(null);

  const saveField = async (field: keyof typeof formik.values) => {
    try {
      if ((propertyBasicDetailsValidationSchema as any)?.fields?.[field]) {
        await formik.validateField(field);
        if (formik.errors[field]) return;
      }

      const payload = { [field]: formik.values[field] };
      const response = await API.patch(`/property/${property._id}`, payload);
      toast.success(response.data.message);
      getPropertyBasicDetails();
      setEditableField(null);
    } catch (error) {
      getErrorResponse(error);
    }
  };

  const renderField = (
    label: string,
    field: keyof typeof formik.values,
    type: "input" | "select" | "phone",
    options?: any[]
  ) => {
    // Determine displayed value in view mode
    let displayValue = formik.values[field];
    if (field === "category" || field === "property_type") {
      displayValue = getCategoryById(formik.values[field]) || "No " + label;
    }

    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
          {label}
        </label>

        {editableField === field ? (
          <div className="space-y-2">
            {type === "input" && (
              <input
                type="text"
                name={field}
                value={formik.values[field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
            )}

            {type === "select" && (
              <select
                name={field}
                value={formik.values[field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select {label}</option>
                {options?.map((opt) => (
                  <option
                    key={opt.id || opt.uniqueId || opt.status}
                    value={opt.id || opt.uniqueId || opt.status}
                  >
                    {opt.type_name || opt.category_name || opt.status}
                  </option>
                ))}
              </select>
            )}

            {type === "phone" && (
              <PhoneInput
                country="in"
                value={formik.values[field]}
                onChange={(phone) => formik.setFieldValue(field, phone)}
                inputClass={phoneInputClass()?.input}
                buttonClass={phoneInputClass()?.button}
              />
            )}

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
          <div className="flex items-center justify-between rounded-lg border border-[var(--yp-border-primary)] px-4 py-2 bg-[var(--yp-input-primary)]">
            <span className="text-[var(--yp-text-primary)]">
              {displayValue}
            </span>
            {["property_name", "property_email", "property_mobile_no"].includes(
              field
            ) ? null : (
              <button
                type="button"
                onClick={() => setEditableField(field)}
                className="text-[var(--yp-main)]"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        {getFormikError(formik, field)}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderField("Property Name", "property_name", "input")}
        {renderField("Email", "property_email", "input")}
        {renderField("Mobile No", "property_mobile_no", "input")}
        {renderField("Alternate No", "property_alt_mobile_no", "phone")}
        {renderField("Website", "property_website", "input")}
        {renderField(
          "Academic Type",
          "category",
          "select",
          getCategoryAccodingToField(categories, "academic type")
        )}
        {renderField(
          "Property Type",
          "property_type",
          "select",
          getCategoryAccodingToField(categories, "property type")
        )}
        {renderField(
          "Established Year",
          "est_year",
          "select",
          Array.from({ length: 250 }, (_, i) => ({
            id: new Date().getFullYear() - i,
            type_name: (new Date().getFullYear() - i).toString(),
          }))
        )}
        {authUser?.role !== "Property Manager" &&
          authUser?.role !== "User" &&
          authUser?.role !== "Support" &&
          renderField(
            "Status",
            "status",
            "select",
            ["Active", "Pending"].map((s) => ({ status: s }))
          )}
      </div>
    </div>
  );
}
