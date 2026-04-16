import React from "react";
import InputMask from "react-input-mask";

export default function FormPhoneInput({
    label,
    name,
    formik,
    placeholder = "Enter contact number",
    prefix = "+91",
    disabled = false
}) {

    const error = formik.touched[name] && formik.errors[name];
    const value = formik.values[name] || "";

    return (
        <div>
            {label && <label className="block text-sm font-medium mb-2">{label}</label>}

            <div className="flex">
                <span className={`px-3 border border-r-0 rounded-l-lg flex items-center ${disabled ? "bg-gray-200 text-gray-500" : "bg-gray-100"
                    }`}>
                    {prefix}
                </span>

                <InputMask
                    mask="99999 99999"
                    maskChar=""
                    name={name}
                    value={value}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={disabled}
                >
                    {(inputProps) => (
                        <input
                            {...inputProps}
                            disabled={disabled}
                            placeholder={placeholder}
                            className={`w-full border rounded-r-lg px-3 py-2 ${error ? "border-red-500" : "border-gray-300"
                                } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""
                                }`}
                        />
                    )}
                </InputMask>
            </div>

            {error && (
                <p className="text-red-500 text-sm mt-1">
                    {formik.errors[name]}
                </p>
            )}
        </div>
    );
}