import React from "react";
import { FIELD_TYPES } from "./form.schema";
import PhoneInput from "../../../components/formInputs/PhoneInput";
import MultiTagInput from "../../../components/common/MultiTagInput/MultiTagInput";

const getValue = (obj, path) =>
    path.split(".").reduce((o, k) => o?.[k], obj) ?? "";

const getOptionValue = (opt, field) => {
    if (typeof opt !== "object") return opt;
    if (field?.valueKey) return opt[field.valueKey];
    return opt._id || opt.id || opt.value || "";
};

const getOptionLabel = (opt, field) => {
    if (typeof opt !== "object") return opt;
    if (field?.labelKey) return opt[field.labelKey];
    return opt.property_name || opt.course_name || opt.name || opt.country_name || opt.label || "";
};

export default function SectionRenderer({ fields = [], formik, dynamicData = {} }) {
    if (!Array.isArray(fields) || fields.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
            {fields.map((field) => {
                if (!field?.name) return null;

                // conditional rendering
                if (typeof field.renderIf === "function" && !field.renderIf(formik.values)) {
                    return null;
                }

                const value = getValue(formik.values, field.name);
                const error = getValue(formik.errors, field.name);
                const touched = getValue(formik.touched, field.name);

                const dynamicOptions = field.dynamic
                    ? dynamicData?.[field.dynamic] || []
                    : [];

                // ================= PHONE =================
                if (field.type === FIELD_TYPES.PHONE) {
                    return (
                        <PhoneInput
                            key={field.name}
                            label={field.label}
                            name={field.name}
                            codeName={field.codeName || "countryCode"}
                            formik={formik}
                            disabled={field.disabled}
                        />
                    );
                }

                // ================= INPUT / DATE =================
                if (field.type === FIELD_TYPES.INPUT || field.type === FIELD_TYPES.DATE) {
                    return (
                        <div key={field.name}>
                            <label className="block text-sm mb-1">
                                {field.label || field.name}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            <input
                                type={field.type === FIELD_TYPES.DATE ? "date" : field.inputType || "text"}
                                name={field.name}
                                value={value}
                                onChange={
                                    field.onChange
                                        ? (e) => field.onChange(e, formik)
                                        : formik.handleChange
                                }
                                onBlur={formik.handleBlur}
                                placeholder={field.placeholder || ""}
                                disabled={field.disabled}
                                className={`w-full border rounded px-3 py-2 outline-none transition ${touched && error
                                    ? "border-red-500"
                                    : "border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                    }`}
                            />

                            {touched && error && (
                                <p className="text-red-500 text-xs mt-1">{error}</p>
                            )}
                        </div>
                    );
                }

                // ================= PHONE =================
                if (field.type === FIELD_TYPES.PHONE) {
                    return (
                        <div key={field.name}>
                            <label className="block text-sm mb-1">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            <input
                                type="tel"
                                name={field.name}
                                value={value}
                                onChange={(e) => {
                                    const cleaned = e.target.value.replace(/\D/g, "");

                                    // enforce max 10 digits
                                    if (cleaned.length <= 10) {
                                        formik.setFieldValue(field.name, cleaned);
                                    }
                                }}
                                onBlur={formik.handleBlur}
                                inputMode="numeric"
                                maxLength={10}
                                placeholder={field.placeholder || "Enter number"}
                                className={`w-full border rounded px-3 py-2 outline-none ${touched && error
                                    ? "border-red-500"
                                    : "border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                    }`}
                            />

                            {touched && error && (
                                <p className="text-red-500 text-xs mt-1">{error}</p>
                            )}
                        </div>
                    );
                }

                // ================= SELECT =================
                if (field.type === FIELD_TYPES.SELECT) {
                    let options = field.options || dynamicOptions || [];

                    // inject "Other"
                    if (field.allowOther) {
                        options = [...options, { value: "__other__", label: "Other" }];
                    }

                    const isOtherSelected = value === "__other__";

                    return (
                        <div key={field.name}>
                            <label className="block text-sm mb-1">
                                {field.label || field.name}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {/* SELECT */}
                            <select
                                name={field.name}
                                value={value}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (val === "__other__") {
                                        formik.setFieldValue(field.name, "__other__");
                                        formik.setFieldValue(`${field.name}_other`, "");
                                    } else {
                                        formik.setFieldValue(field.name, val);
                                        formik.setFieldValue(`${field.name}_other`, "");
                                    }
                                }}
                                onBlur={formik.handleBlur}
                                className={`w-full border rounded px-3 py-2 ${touched && error ? "border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select</option>

                                {options.map((opt) => {
                                    const val =
                                        opt.value ??
                                        (typeof opt === "object"
                                            ? getOptionValue(opt, field)
                                            : opt);

                                    const label =
                                        opt.label ??
                                        (typeof opt === "object"
                                            ? getOptionLabel(opt, field)
                                            : opt);

                                    return (
                                        <option key={`${field.name}-${val}`} value={val}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* OTHER INPUT */}
                            {isOtherSelected && (
                                <input
                                    type="text"
                                    name={`${field.name}_other`}
                                    value={getValue(formik.values, `${field.name}_other`)}
                                    onChange={formik.handleChange}
                                    placeholder={`Enter custom ${field.label}`}
                                    className="mt-2 w-full border rounded px-3 py-2"
                                />
                            )}

                            {touched && error && (
                                <p className="text-red-500 text-xs mt-1">{error}</p>
                            )}
                        </div>
                    );
                }

                // ================= MULTI SELECT =================
                if (field.type === "multi_select") {
                    return (
                        <MultiTagInput
                            key={field.name}
                            label={field.label}
                            value={value || []}
                            options={field.options || []}
                            onChange={(val) => formik.setFieldValue(field.name, val)}
                        />
                    );
                }

                return null;
            })}
        </div>
    );
}