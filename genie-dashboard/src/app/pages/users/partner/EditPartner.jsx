import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from "yup";
import toast from 'react-hot-toast';
import InputMask from 'react-input-mask';
import { ArrowBigLeft, ArrowLeft } from 'lucide-react';
import { API, CampusaimAPI } from '../../../services/API';
import Breadcrumbs from '../../../components/ui/BreadCrumb/Breadcrumbs';
import Button from '../../../components/ui/Button/Button';

function EditPartner() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [partnerData, setPartnerData] = useState(null);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const partnerRes = await CampusaimAPI.get(`/fetch-partner/${id}`);
                const partner = partnerRes?.data?.data;
                setPartnerData(partner);
            } catch (error) {
                console.error("Error fetching partner:", error.message);
            }
        };
        const fetchRoles = async () => {
            try {
                const roleRes = await CampusaimAPI.get(`/profile/role`);
                const rolesData = Array.isArray(roleRes?.data)
                    ? roleRes.data
                    : roleRes?.data?.data || [];
                setRoles(rolesData);
            } catch (error) {
                console.error("Error fetching role:", error.message);
                setRoles([]);
            }
        };

        fetchRoles();
        fetchData();
    }, [id]);

    const validationSchema = Yup.object({
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
            .matches(/^(\+91|0)?[6-9][0-9]{9}$/, "Please enter a valid Indian mobile number"),
        role: Yup.string()
            .required("Role is required.")
    });

    const initialValues = {
        name: partnerData?.name || "",
        email: partnerData?.email || "",
        mobile_no: partnerData?.mobile_no || "",
        role: partnerData?.role || "",
        verified: Boolean(partnerData?.verified),
    };


    const handleSubmit = async (values) => {
        const toastId = toast.loading("Saving...");

        try {
            const response = await CampusaimAPI.put(`/update-user/${partnerData?._id}`, values);
            toast.success(response.data.message || "Updated successfully!", { id: toastId });
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

    return (
        <div className="space-y-6">
            {/* Breadcrumb Section */}
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Partner", to: "/dashboard/users/partners" },
                    { label: "Partner View" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate("/dashboard/users/partners")}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back
                        </button>
                    </div>
                }
            />

            <div className="">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Details</h2>

                    <div className="space-y-6">
                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name..."
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.touched.name && formik.errors.name ? 'border-red-500' : ''}`}
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.name && formik.touched.name
                                        ? <small className="text-red-500">{formik.errors.name}</small>
                                        : null
                                    }
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email..."
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.email && formik.touched.email
                                        ? <small className="text-red-500">{formik.errors.email}</small>
                                        : null
                                    }
                                </div>

                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                    <div className="flex rounded-lg shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-sm select-none">
                                            +91
                                        </span>
                                        <InputMask
                                            mask="99999 99999"
                                            maskChar=""
                                            name="mobile_no"
                                            value={formik.values.mobile_no}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        >
                                            {(inputProps) => (
                                                <input
                                                    {...inputProps}
                                                    type="text"
                                                    className={`w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${formik.touched.mobile_no && formik.errors.mobile_no ? "border-red-500" : ""
                                                        }`}
                                                    placeholder="Enter your mobile number..."
                                                />
                                            )}
                                        </InputMask>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        name="role"
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.touched.role && formik.errors.role ? 'border-red-500' : ''} disabled:cursor-not-allowed`}
                                        value={formik.values.role}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={true}
                                    >
                                        <option value="">Select Role</option>
                                        {roles?.length > 0 &&
                                            roles.map((item) => (
                                                <option key={item._id} value={item._id}>
                                                    {item.role}
                                                </option>
                                            ))}
                                    </select>
                                    {formik.errors.role && formik.touched.role
                                        ? <small className="text-red-500">{formik.errors.role}</small>
                                        : null
                                    }
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {/* Verify Toggle */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Manual Verify
                                    </label>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={formik.values.verified}
                                        onClick={() =>
                                            formik.setFieldValue("verified", !formik.values.verified)
                                        }
                                        onBlur={formik.handleBlur}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
      ${formik.values.verified ? "bg-green-500" : "bg-red-400"}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
        ${formik.values.verified ? "translate-x-6" : "translate-x-1"}`}
                                        />
                                    </button>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {formik.values.verified ? "Verified" : "Suspended"}
                                    </p>
                                </div>

                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    loading={formik.isSubmitting}
                                >
                                    Update
                                </Button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditPartner
