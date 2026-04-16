import React from "react";

export default function FormTextarea({ label, name, formik, rows = 4, maxLength, placeholder = "" }) {

    const error = formik.touched[name] && formik.errors[name];
    const value = formik.values[name] || "";

    return (
        <div>
            {label && <label className="block text-sm font-medium mb-2">{label}</label>}

            <textarea
                name={name}
                rows={rows}
                maxLength={maxLength}
                placeholder={placeholder}
                value={value}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-3 py-2 ${error ? "border-red-500" : "border-gray-300"
                    }`}
            />

            {maxLength && (
                <p className="text-sm text-gray-500 text-right">
                    {value.length}/{maxLength}
                </p>
            )}

            {error && (
                <p className="text-red-500 text-sm mt-1">
                    {formik.errors[name]}
                </p>
            )}
        </div>
    );
}