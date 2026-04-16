import React from "react";
import Select from "react-select";

export default function FormSelect({ label, name, formik, options = [], placeholder = "Select" }) {

    const error = formik.touched[name] && formik.errors[name];

    const selectedOption = options.find(opt => opt.value === formik.values[name]) || null;

    const handleChange = (option) => {
        formik.setFieldValue(name, option ? option.value : "");
    };

    return (
        <div>
            {label && <label className="block text-sm font-medium mb-2">{label}</label>}

            <Select
                options={options}
                value={selectedOption}
                onChange={handleChange}
                onBlur={() => formik.setFieldTouched(name, true)}
                placeholder={placeholder}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                    control: (base, state) => ({
                        ...base,
                        minHeight: 38,
                        borderColor: error ? "#ef4444" : base.borderColor,
                        boxShadow: "none",
                        "&:hover": { borderColor: error ? "#ef4444" : "#2563eb" }
                    })
                }}
            />

            {error && (
                <p className="text-red-500 text-sm mt-1">{formik.errors[name]}</p>
            )}
        </div>
    );
}