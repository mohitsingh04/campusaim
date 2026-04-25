import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from "yup";
import toast from 'react-hot-toast';
import InputMask from 'react-input-mask';
import { API, CampusaimAPI } from '../../../services/API';
import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import { ArrowLeft } from "lucide-react";
import { capitalizeWords } from '../../../utils/format';
import FormInput from '../../../components/ui/Form/FormInput';
import FormPhoneInput from '../../../components/ui/Form/FormPhoneInput';

export default function AddCounselor() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [counselor, setCounselor] = useState(null);

    const fetchRoles = async () => {
        try {
            const { data } = await CampusaimAPI.get("/profile/role");
            const counselor = data.filter((a) => (a.role === "Counselor"));
            setCounselor(counselor[0]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch roles.");
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const validationSchema = Yup.object({
        username: Yup.string()
            .transform((value) => value?.toLowerCase().trim()) // force lowercase + trim
            .matches(/^[a-z0-9]+$/, "Only lowercase letters and numbers allowed (no spaces).")
            .min(2, "Username must contain at least 2 characters.")
            .max(30, "Username cannot exceed 30 characters.")
            .required("Username is required."),
        name: Yup.string()
            .required("Name is required.")
            .matches(/^(?!.*\s{2})[A-Za-z\s]+$/, 'Name can contain only alphabets and single spaces.')
            .min(2, "Name must contain atleast 2 characters"),
        email: Yup.string()
            .email("Invalid email")
            .required("Email is required."),
        mobile_no: Yup.string()
            .required("Mobile number is required.")
            .transform(value => value.replace(/\s/g, ""))
            .matches(/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit mobile number"),
    });

    const initialValues = {
        username: "",
        name: "",
        email: "",
        mobile_no: "",
        bio: "",
        role: counselor?._id, // ✅ default value
    };


    const handleSubmit = async (values) => {
        const toastId = toast.loading("Adding...");

        try {
            const response = await CampusaimAPI.post(`/add-user`, values);
            toast.success(response.data.message || "Added successfully!", { id: toastId });
            navigate("/dashboard/users/counselors");
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
        { value: 'counselor', label: 'Counselor' },
    ]

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Counselor", to: "/dashboard/users/counselors" },
                    { label: "Add", active: true },
                ]}
                actions={
                    <Link
                        to="/dashboard/users/counselors"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back
                    </Link>
                }
            />

            <div className="">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Add a Counselor</h2>

                    <div className="space-y-6">
                        <form
                            onSubmit={formik.handleSubmit}
                            className="space-y-8 bg-gray-50 p-6 rounded-2xl border border-gray-200"
                        >

                            {/* Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <FormInput
                                    label="Username"
                                    name="username"
                                    placeholder="Enter username..."
                                    formik={formik}
                                    trimOnBlur
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .toLowerCase()        // enforce lowercase
                                            .replace(/\s+/g, ""); // remove spaces

                                        formik.setFieldValue("username", value);
                                    }}
                                />

                                <FormInput
                                    label="Full Name"
                                    name="name"
                                    placeholder="Enter full name..."
                                    formik={formik}
                                    transform={capitalizeWords}
                                    trimOnBlur
                                />

                                {/* Email */}
                                <div className="space-y-1">
                                    <FormInput
                                        label="Email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter email"
                                        formik={formik}
                                    />
                                </div>

                                {/* Mobile no. */}
                                <div className="space-y-1">
                                    <FormPhoneInput
                                        label="Mobile no."
                                        name="mobile_no"
                                        formik={formik}
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
                                    {formik.isSubmitting ? "Creating..." : "Create Counselor"}
                                </button>
                            </div>
                        </form>

                    </div>

                </div>
            </div>
        </div>
    );
};
