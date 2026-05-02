import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API, CampusaimAPI } from "../../services/API";
import { capitalizeWords } from "../../utils/format";
import FormTextarea from "../../components/ui/Form/FormTextarea";

const validationSchema = Yup.object({
    _id: Yup.string().required("Category is required"), // ✅ MUST
    name: Yup.string()
        .required("Name is required.")
        .min(2),
});

const initialValues = {
    _id: "", // ✅ category id will go here
    name: "",
    description: "",
};

export default function AddNiche() {
    const navigate = useNavigate();
    const [category, setCategory] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await CampusaimAPI.get("/category");
                const filteredCat = res.data.filter((a) => a.parent_category === "Academic Type");
                setCategory(filteredCat);
            } catch (error) {
                toast.error("Internal server error.");
                console.error(error)
            }
        };
        fetchCategories();
    }, []);

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

    const stripHtml = (html) => html?.replace(/<[^>]+>/g, "") || "";

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
                            <select
                                name="_id"
                                value={formik.values._id}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const selected = category.find(c => c._id === id);

                                    formik.setFieldValue("_id", id);
                                    formik.setFieldValue("name", selected?.category_name || "");

                                    // ✅ NEW: autofill description
                                    formik.setFieldValue(
                                        "description",
                                        stripHtml(selected?.description)
                                    );
                                }}
                                onBlur={formik.handleBlur}
                                className="border rounded-md px-2 py-1 w-full"
                            >
                                <option value="">Select Category</option>
                                {category.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        {item.category_name}
                                    </option>
                                ))}
                            </select>
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
