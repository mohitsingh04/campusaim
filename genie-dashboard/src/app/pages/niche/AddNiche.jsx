import React from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API } from "../../services/API";
import FormInput from "../../components/ui/Form/FormInput";
import { capitalizeWords } from "../../utils/format";
import FormTextarea from "../../components/ui/Form/FormTextarea";

export default function AddNiche() {
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Name is required.")
            .trim("Name cannot start or end with spaces.")
            .matches(
                /^(?! )[A-Za-z]+(?: [A-Za-z]+)*$/,
                "Name can contain only alphabets and single spaces, without leading or trailing spaces."
            ).min(2, "Name must contain at least 2 characters"),
    });

    const initialValues = {
        name: "",
        description: "",
    };

    const handleSubmit = async (values) => {
        try {
            const { data } = await API.post("/niche", values);

            toast.success(data?.message || "Niche added successfully");
            navigate("/dashboard/niche/all");
        } catch (error) {
            const message =
                error?.response?.data?.error || "Something went wrong!";
            toast.error(message);
        }
    };

    /* ============================
       Formik Hook
    ============================ */
    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: handleSubmit,
    });

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <Breadcrumbs
                    items={[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: "Niche", to: "/dashboard/niche/all" },
                        { label: "Add", active: true },
                    ]}
                    actions={[
                        {
                            label: "Back",
                            to: `/dashboard/niche/all`,
                            Icon: ArrowLeft,
                            variant: "primary",
                        },
                    ]}
                />

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Add Niche</h2>
                    <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <FormInput
                                label="Name"
                                name="name"
                                placeholder="Enter niche"
                                formik={formik}
                                transform={capitalizeWords}
                                trimOnBlur
                            />
                        </div>

                        {/* Description */}
                        <FormTextarea
                            label="Description"
                            name="description"
                            rows={6}
                            placeholder="Description!"
                            formik={formik}
                        />

                        {/* Submit */}
                        <div className="md:col-span-2 flex justify-end mt-3">
                            <button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed"
                            >
                                {formik.isSubmitting
                                    ? "Adding..."
                                    : "Add"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
