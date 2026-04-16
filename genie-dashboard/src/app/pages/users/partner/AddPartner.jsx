import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from "yup";
import toast from 'react-hot-toast';
import InputMask from 'react-input-mask';
import { API } from '../../../services/API';
import Select from "react-select";
import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import { ArrowLeft } from "lucide-react";

export default function AddPartner() {
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Name is required.")
            .matches(/^(?!.*\s{2})[A-Za-z\s]+$/, 'Name can contain only alphabets and single spaces.')
            .min(2, "Name must contain atleast 2 characters"),
        email: Yup.string()
            .email("Invalid email")
            .required("Email is required."),
        contact: Yup.string()
            .required("Contact number is required.")
            .transform(value => value.replace(/\s/g, ""))
            .matches(/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit contact number"),
        role: Yup.string()
            .required("Role is required.")
    });

    const initialValues = {
        name: "",
        email: "",
        contact: "",
        bio: "",
        role: "partner", // ✅ default value
    };


    const handleSubmit = async (values) => {
        const toastId = toast.loading("Adding...");

        try {
            const response = await API.post(`/add-user`, values);
            toast.success(response.data.message || "Added successfully!", { id: toastId });
            navigate("/dashboard/users/partners");
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Something went wrong. Please try again.";
            toast.error(errorMessage);
            toast.dismiss(toastId);
        }
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true
    });

    const options = [
        { value: 'partner', label: 'Partner' },
    ]

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Partner", to: "/dashboard/users/partners" },
                    { label: "Add", active: true },
                ]}
                actions={
                    <Link
                        to="/dashboard/users/partners"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back
                    </Link>
                }
            />

            <div className="">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Add a Partner</h2>

                    <div className="space-y-6">
                        <form
                            onSubmit={formik.handleSubmit}
                            className="space-y-8 bg-gray-50 p-6 rounded-2xl border border-gray-200"
                        >

                            {/* Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter full name..."
                                        className={`w-full h-11 px-4 rounded-xl border bg-white transition
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${formik.touched.name && formik.errors.name
                                                ? "border-red-500 focus:ring-red-400"
                                                : "border-gray-300"
                                            }`}
                                        {...formik.getFieldProps("name")}
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                        <p className="text-xs text-red-500">{formik.errors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter email address..."
                                        className={`w-full h-11 px-4 rounded-xl border bg-white transition
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${formik.touched.email && formik.errors.email
                                                ? "border-red-500 focus:ring-red-400"
                                                : "border-gray-300"
                                            }`}
                                        {...formik.getFieldProps("email")}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <p className="text-xs text-red-500">{formik.errors.email}</p>
                                    )}
                                </div>

                                {/* Contact */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Contact Number
                                    </label>
                                    <div className="flex h-11 rounded-xl overflow-hidden border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-500">
                                        <span className="flex items-center px-4 bg-gray-100 text-sm text-gray-600 border-r">
                                            +91
                                        </span>
                                        <InputMask
                                            mask="99999 99999"
                                            maskChar=""
                                            {...formik.getFieldProps("contact")}
                                        >
                                            {(inputProps) => (
                                                <input
                                                    {...inputProps}
                                                    type="text"
                                                    placeholder="Enter contact number..."
                                                    className="flex-1 px-4 outline-none text-sm"
                                                />
                                            )}
                                        </InputMask>
                                    </div>
                                    {formik.touched.contact && formik.errors.contact && (
                                        <p className="text-xs text-red-500">{formik.errors.contact}</p>
                                    )}
                                </div>

                                {/* Role */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Role
                                    </label>
                                    <Select
                                        options={options}
                                        isDisabled
                                        isSearchable={false}
                                        value={options.find(
                                            opt => opt.value === formik.values.role
                                        )}
                                        className="text-sm"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: "44px",
                                                borderRadius: "12px",
                                                backgroundColor: "#f9fafb",
                                                borderColor: "#d1d5db",
                                            }),
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                    className="inline-flex items-center justify-center px-6 h-11 rounded-xl
                bg-blue-600 text-white text-sm font-medium
                hover:bg-blue-700 transition
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {formik.isSubmitting ? "Creating..." : "Create Partner"}
                                </button>
                            </div>
                        </form>

                    </div>

                </div>
            </div>
        </div>
    );
};
