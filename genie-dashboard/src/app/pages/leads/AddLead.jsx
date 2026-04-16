import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import InputMask from "react-input-mask";
import { ChevronDown, ArrowLeft, User, MapPin, GraduationCap, Settings } from "lucide-react";
import { API } from "../../services/API";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";

/* ============================
   Validation & Initial Values
============================ */
const currentYear = new Date().getFullYear();

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required.").min(2, "Min 2 characters"),
    email: Yup.string().required("Email is required.").email("Invalid email address"),
    contact: Yup.string()
        .required("Contact number is required.")
        .transform((v) => (v ? v.replace(/\s/g, "") : ""))
        .matches(/^(\+91|0)?[6-9][0-9]{9}$/, "Invalid Indian contact"),
    city: Yup.string().max(80).nullable(),
    state: Yup.string().max(80).nullable(),
    pincode: Yup.string().matches(/^\d{6}$/, "Invalid pincode").nullable(),
    academics: Yup.object({
        passingYear: Yup.number().nullable().min(1980).max(currentYear),
        percentage: Yup.number().nullable().min(0).max(100),
    }),
});

const initialValues = {
    name: "", contact: "", email: "", address: "", city: "", state: "", pincode: "",
    academics: { qualification: "", boardOrUniversity: "", passingYear: "", percentage: "", stream: "" },
    preferences: { courseName: "", courseType: "", specialization: "", preferredState: "", preferredCity: "", collegeType: "Any" },
};

/* ============================
   Main Component
============================ */
const AddLead = () => {
    const navigate = useNavigate();
    const [openSection, setOpenSection] = useState("basic");

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const payload = { ...values, contact: values.contact.replace(/\s/g, "") };
                await API.post("/leads", payload);
                toast.success("Lead added successfully");
                navigate("/dashboard/leads/all");
            } catch (error) {
                toast.error(error?.response?.data?.error || "Something went wrong!");
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Helper to check if a section has errors to highlight the accordion
    const hasSectionError = (fields) => {
        return fields.some(field => {
            const error = field.split('.').reduce((obj, key) => obj?.[key], formik.errors);
            const touched = field.split('.').reduce((obj, key) => obj?.[key], formik.touched);
            return error && touched;
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Leads", to: "/dashboard/leads/all" },
                    { label: "Add Lead" },
                ]}
                actions={[{ label: "Back", to: "/dashboard/leads/all", Icon: ArrowLeft, variant: "primary" }]}
            />

            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <Accordion
                    id="basic"
                    title="Basic Information"
                    icon={<User size={18} />}
                    isOpen={openSection === "basic"}
                    toggle={() => setOpenSection(openSection === "basic" ? "" : "basic")}
                    hasError={hasSectionError(['name', 'email', 'contact'])}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        <Input label="Name*" name="name" placeholder="Enter full name" formik={formik} />
                        <Input label="Email*" name="email" type="email" placeholder="Enter email address" formik={formik} />
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Contact Number*</label>
                            <InputMask
                                mask="99999 99999"
                                maskChar=""
                                name="contact"
                                value={formik.values.contact}
                                onChange={(e) => formik.setFieldValue("contact", e.target.value.replace(/\D/g, ""))}
                                onBlur={formik.handleBlur}
                            >
                                {(props) => (
                                    <input {...props} className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                )}
                            </InputMask>
                            {formik.touched.contact && formik.errors.contact && <p className="text-red-500 text-xs mt-1">{formik.errors.contact}</p>}
                        </div>
                    </div>
                </Accordion>

                <Accordion
                    id="location"
                    title="Address & Location"
                    icon={<MapPin size={18} />}
                    isOpen={openSection === "location"}
                    toggle={() => setOpenSection(openSection === "location" ? "" : "location")}
                    hasError={hasSectionError(['city', 'state', 'pincode'])}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        <Input label="Address" name="address" formik={formik} />
                        <Input label="City" name="city" formik={formik} />
                        <Input label="State" name="state" formik={formik} />
                        <Input label="Pincode" name="pincode" formik={formik} />
                    </div>
                </Accordion>

                <Accordion
                    id="academics"
                    title="Academic Details"
                    icon={<GraduationCap size={18} />}
                    isOpen={openSection === "academics"}
                    toggle={() => setOpenSection(openSection === "academics" ? "" : "academics")}
                    hasError={hasSectionError(['academics.passingYear', 'academics.percentage'])}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        <Input label="Qualification" name="academics.qualification" formik={formik} />
                        <Input label="Board / University" name="academics.boardOrUniversity" formik={formik} />
                        <Input label="Passing Year" name="academics.passingYear" type="number" formik={formik} />
                        <Input label="Percentage" name="academics.percentage" type="number" formik={formik} />
                        <Input label="Stream" name="academics.stream" formik={formik} />
                    </div>
                </Accordion>

                <Accordion
                    id="preferences"
                    title="Course Preferences"
                    icon={<Settings size={18} />}
                    isOpen={openSection === "preferences"}
                    toggle={() => setOpenSection(openSection === "preferences" ? "" : "preferences")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        <Input label="Course Name" name="preferences.courseName" formik={formik} />
                        <FormSelect label="Course Type" name="preferences.courseType" formik={formik} options={["UG", "PG", "Diploma", "PhD"]} />
                        <Input label="Specialization" name="preferences.specialization" formik={formik} />
                        <FormSelect label="College Type" name="preferences.collegeType" formik={formik} options={["Government", "Private", "Any"]} />
                    </div>
                </Accordion>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-sm"
                    >
                        {formik.isSubmitting ? "Saving..." : "Add Lead"}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ---------------- Reusable Components ---------------- */

const Accordion = ({ title, icon, children, isOpen, toggle, hasError }) => (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'shadow-md border-blue-200' : 'bg-white'}`}>
        <button
            type="button"
            onClick={toggle}
            className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${hasError ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}`}
        >
            <div className="flex items-center gap-3">
                <span className={`${hasError ? 'text-red-500' : 'text-blue-600'}`}>{icon}</span>
                <span className={`font-semibold ${hasError ? 'text-red-700' : 'text-gray-800'}`}>{title}</span>
                {hasError && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Errors</span>}
            </div>
            <ChevronDown className={`transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} size={20} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="border-t bg-white">{children}</div>
        </div>
    </div>
);

const getValue = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj) ?? "";

const Input = ({ label, name, type = "text", placeholder = "", formik }) => {
    const error = getValue(formik.errors, name);
    const touched = getValue(formik.touched, name);

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={getValue(formik.values, name)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-3 py-2 outline-none transition-all focus:ring-2 ${touched && error ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'}`}
            />
            {touched && error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

const FormSelect = ({ label, name, options, formik }) => {
    const error = getValue(formik.errors, name);
    const touched = getValue(formik.touched, name);

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
            <select
                name={name}
                value={getValue(formik.values, name)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${touched && error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
            >
                <option value="">Select</option>
                {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {touched && error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default AddLead;