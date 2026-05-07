import React from "react";

// safe getter
const getValue = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj) ?? "";

export default function FieldRenderer({ field, formik }) {
    const error = getValue(formik.errors, field.name);
    const touched = getValue(formik.touched, field.name);

    // INPUT
    if (field.type === "input") {
        return (
            <div>
                <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                <input
                    type={field.inputType || "text"}
                    name={field.name}
                    placeholder={field.placeholder || ""}
                    value={getValue(formik.values, field.name)}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full border rounded-lg px-3 py-2 ${touched && error ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {touched && error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
        );
    }

    // SELECT
    if (field.type === "select") {
        return (
            <div>
                <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                <select
                    name={field.name}
                    value={getValue(formik.values, field.name)}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border rounded-lg px-3 py-2"
                >
                    <option value="">Select</option>
                    {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                {touched && error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
        );
    }

    return null;
}