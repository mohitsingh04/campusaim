import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import EditAdminSkeletonPage from "./skeleton-page/EditAdminSkeletonPage";
import { API, CampusaimAPI } from "../../../services/API";
import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import FormInput from "../../../components/ui/Form/FormInput";
import { capitalizeWords } from "../../../utils/format";
import FormSelect from "../../../components/ui/Form/FormSelect";
import FormTextarea from "../../../components/ui/Form/FormTextarea";
import FormPhoneInput from "../../../components/ui/Form/FormPhoneInput";
import FormSwitch from "../../../components/ui/Form/FormSwitch";

const formatPhoneForUI = (phone = "") => {
    if (!phone) return "";

    // remove +91
    const number = phone.replace(/^\+91/, "");

    // format: 91863 04782
    return number.replace(/(\d{5})(\d{5})/, "$1 $2");
};

const formatPhoneForDB = (phone = "") => {
    if (!phone) return "";

    // remove spaces + non-digits
    const digits = phone.replace(/\D/g, "");

    // ensure 10 digits
    if (digits.length !== 10) return "";

    return `+91${digits}`;
};

const validationSchema = Yup.object({
    username: Yup.string()
        .required("Username is required")
        .min(2, "Minimum 2 characters"),
    name: Yup.string()
        .required("Name is required")
        .matches(/^(?!.*\s{2})[A-Za-z\s]+$/, "Only alphabets allowed")
        .min(2, "Minimum 2 characters"),
    email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),
    mobile_no: Yup.string()
        .required("Mobile number required")
        .transform(v => v ? v.replace(/\s/g, "") : "")
        .matches(/^(\+91|0)?[6-9][0-9]{9}$/, "Invalid Indian number"),
    role: Yup.string().required("Role required"),
    verified: Yup.boolean()
});

// ========================= API SERVICES =========================

const fetchAdmin = async (id) => {
    if (!id) throw new Error("Admin ID required");
    const { data } = await CampusaimAPI.get(`/fetch-admins/${id}`);
    console.log(data)
    return data?.data;
};

// ========================= COMPONENT =========================

export default function EditAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ========================= DATA FETCHING =========================

    const { data: adminData, isLoading } = useQuery({
        queryKey: ["admin", id],
        queryFn: () => fetchAdmin(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 10, // Cache for 10 mins
    });

    // ========================= MUTATION =========================

    const updateAdminMutation = useMutation({
        mutationFn: (values) => CampusaimAPI.put(`/update-user/${id}`, values),
        onSuccess: (res) => {
            toast.success(res?.data?.message || "Admin updated successfully");
            // Invalidate both the list and specific admin cache
            queryClient.invalidateQueries({ queryKey: ["admins"] });
            queryClient.invalidateQueries({ queryKey: ["admin", id] });
            navigate("/dashboard/admins");
        },
        onError: (error) => {
            const msg = error?.response?.data?.message || error?.response?.data?.error || "Update failed";
            toast.error(msg);
        }
    });

    // ========================= FORM CONFIG =========================

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            username: adminData?.username || "",
            name: adminData?.name || "",
            email: adminData?.email || "",
            mobile_no: formatPhoneForUI(adminData?.mobile_no) || "",
            role: adminData?.role || "",
            verified: !!adminData?.verified
        },
        validationSchema,
        onSubmit: (values) => {
            // Optimization: Only submit if data has actually changed
            if (!formik.dirty) {
                toast.error("No changes detected");
                return;
            }
            updateAdminMutation.mutate(values);
        }
    });

    if (isLoading) return <EditAdminSkeletonPage />;

    return (
        <div className="space-y-6 pb-10">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Admins", to: "/dashboard/admins" },
                    { label: "Edit" },
                    { label: adminData?.name || "Profile", active: true }
                ]}
                actions={[
                    { label: "Back", to: "/dashboard/admins", Icon: ArrowLeft, variant: "primary" }
                ]}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Edit</h2>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-8">
                    {/* SECTION: Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormInput
                            label="username"
                            name="username"
                            placeholder="johndoe"
                            formik={formik}
                            trimOnBlur
                        />
                        <FormInput
                            label="Full Name"
                            name="name"
                            placeholder="John Doe"
                            formik={formik}
                            transform={capitalizeWords}
                            trimOnBlur
                        />
                        <FormInput
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="admin@company.com"
                            formik={formik}
                        />
                        <FormPhoneInput
                            label="Mobile Number"
                            name="mobile_no"
                            formik={formik}
                        />
                    </div>

                    {/* SECTION: Detailed Profile */}
                    <div className="space-y-6 pt-4 border-t border-gray-50">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 max-w-md">
                            <FormSwitch
                                label="Verify Account Status"
                                name="verified"
                                formik={formik}
                                description="Manually verify this user to grant full platform access."
                            />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/admins")}
                            className="px-5 py-2.5 rounded-xl border font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateAdminMutation.isPending || !formik.dirty}
                            className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all
                                ${updateAdminMutation.isPending || !formik.dirty
                                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                                    : "bg-blue-600 hover:bg-blue-700 active:transform active:scale-95"}`}
                        >
                            {updateAdminMutation.isPending ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}