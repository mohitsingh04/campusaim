import React from "react";

export default function FormSwitch({ label, name, formik, activeText = "Verified", inactiveText = "Suspended" }) {

    const checked = formik.values[name];

    const toggle = () => {
        formik.setFieldValue(name, !checked);
    };

    return (
        <div>
            {label && <label className="block text-sm font-medium mb-2">{label}</label>}

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={toggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-green-500" : "bg-red-400"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>

            <p className="mt-1 text-sm text-gray-500">
                {checked ? activeText : inactiveText}
            </p>
        </div>
    );
}