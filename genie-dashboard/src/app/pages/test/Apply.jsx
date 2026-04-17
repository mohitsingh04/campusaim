import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { API } from "../../services/API";
import { getValidRef } from "../../utils/refTracker";

const contactRegex = /^[6-9]\d{9}$/;

const validationSchema = Yup.object({
    name: Yup.string().trim().required("Name is required"),
    contact: Yup.string()
        .required("Contact is required")
        .matches(contactRegex, "Enter valid 10-digit Indian mobile number"),
    email: Yup.string()
        .required("Email is required")
        .email("Invalid email format"),
    course: Yup.string().trim().required("Course is required"),
    state: Yup.string().trim().nullable(),
    city: Yup.string().trim().nullable(),
});

const sanitize = (value = "") =>
    value.replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function Apply() {
    const [apiError, setApiError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const formik = useFormik({
        initialValues: {
            name: "",
            contact: "",
            email: "",
            course: "",
            state: "",
            city: "",
        },
        validationSchema,
        validateOnBlur: true,
        validateOnChange: false,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            setApiError("");
            setSuccessMsg("");

            try {
                const refCode = getValidRef(); // ✅ validated + expiry-safe

                const payload = {
                    name: values.name.trim(),
                    contact: values.contact.trim(),
                    email: values.email.trim().toLowerCase(),
                    preferences: {
                        courseName: values.course.trim(),
                        preferredState: values.state?.trim() || "",
                        preferredCity: values.city?.trim() || "",
                    },
                    ref_code: refCode || null,
                };

                const res = await API.post("/add/test/leads", payload);

                if (res?.data) {
                    setSuccessMsg("Lead submitted successfully!");
                    resetForm();
                }
            } catch (err) {
                console.error("Lead submission failed:", err);
                setApiError(err.response?.data?.error || "Something went wrong");
            } finally {
                setSubmitting(false);
            }
        },
    });

    // ✅ Prefill course from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const course = params.get("course");

        if (course) {
            formik.setFieldValue("course", course);
        }
    }, []);

    const handleSanitizedChange = (e) => {
        const { name, value } = e.target;
        formik.setFieldValue(name, sanitize(value));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl">
                <h2 className="text-xl font-semibold mb-6 text-center">
                    Enquiry Form
                </h2>

                {apiError && (
                    <div className="mb-4 text-sm text-red-600">{apiError}</div>
                )}
                {successMsg && (
                    <div className="mb-4 text-sm text-green-600">{successMsg}</div>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
                    <InputField label="Student Name *" name="name" formik={formik} onChange={handleSanitizedChange} />

                    <InputField label="Contact Number *" name="contact" maxLength={10} formik={formik} onChange={handleSanitizedChange} />

                    <InputField label="Email *" name="email" formik={formik} onChange={handleSanitizedChange} />

                    <InputField label="Interested Course *" name="course" formik={formik} onChange={handleSanitizedChange} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="State" name="state" formik={formik} onChange={handleSanitizedChange} />
                        <InputField label="City" name="city" formik={formik} onChange={handleSanitizedChange} />
                    </div>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                    >
                        {formik.isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function InputField({ label, name, formik, onChange, maxLength }) {
    const hasError = formik.touched[name] && formik.errors[name];

    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
                type="text"
                name={name}
                value={formik.values[name]}
                onChange={onChange}
                onBlur={formik.handleBlur}
                maxLength={maxLength}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${hasError
                        ? "border-red-500 focus:ring-red-400"
                        : "focus:ring-blue-500"
                    }`}
            />
            {hasError && (
                <p className="text-xs text-red-600 mt-1">{formik.errors[name]}</p>
            )}
        </div>
    );
}