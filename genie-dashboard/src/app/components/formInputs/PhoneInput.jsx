import React from "react";

// minimal country list (extend later if needed)
const COUNTRY_CODES = [
    { code: "+91", label: "India (+91)" },
    // { code: "+1", label: "USA (+1)" },
    // { code: "+44", label: "UK (+44)" },
];

const getValue = (obj, path) =>
    path.split(".").reduce((o, k) => o?.[k], obj) ?? "";

const PhoneInput = ({
    label,
    name,          // e.g. "contact"
    codeName,      // e.g. "countryCode"
    formik,
    disabled = false,
}) => {
    const value = getValue(formik.values, name);
    const code = getValue(formik.values, codeName) || "+91";

    const error = getValue(formik.errors, name);
    const touched = getValue(formik.touched, name);

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-2 text-gray-700">
                {label}
            </label>

            <div className="flex">
                {/* Country Code Select */}
                <select
                    name={codeName}
                    value={code}
                    onChange={formik.handleChange}
                    disabled={disabled}
                    className={`border border-r-0 rounded-l-lg px-2 py-2 bg-gray-50 text-sm ${disabled ? "cursor-not-allowed bg-gray-100" : ""
                        }`}
                >
                    {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.code}
                        </option>
                    ))}
                </select>

                {/* Phone Input */}
                <input
                    type="tel"
                    name={name}
                    value={value}
                    onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                        formik.setFieldValue(name, cleaned);
                    }}
                    onBlur={formik.handleBlur}
                    disabled={disabled}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Enter mobile number"
                    className={`w-full border rounded-r-lg px-3 py-2 outline-none ${disabled
                        ? "bg-gray-100 cursor-not-allowed"
                        : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                        }`}
                />
            </div>

            {touched && error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

export default PhoneInput;