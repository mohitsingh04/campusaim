import React from "react";

export default function FormInput({
    label,
    name,
    type = "text",
    placeholder = "",
    formik,
    transform,
    trimOnBlur = false,
    disabled = false
}) {

    const value = formik.values[name] ?? "";
    const error = formik.touched[name] && formik.errors[name];

    const handleChange = (e) => {
        if (disabled) return;
        const v = transform ? transform(e.target.value) : e.target.value;
        formik.setFieldValue(name, v);
    };

    const handleBlur = (e) => {
        if (disabled) return;
        let v = e.target.value;
        if (trimOnBlur) v = v.trim();
        formik.setFieldValue(name, v);
        formik.handleBlur(e);
    };

    return (
        <div>
            {label && <label className="block text-sm font-medium mb-2">{label}</label>}

            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"
                    } ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            />

            {error && (
                <p className="text-red-500 text-sm mt-1">{formik.errors[name]}</p>
            )}
        </div>
    );
}