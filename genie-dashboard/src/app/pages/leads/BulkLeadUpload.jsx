import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API } from "../../services/API";
import Button from "../../components/ui/Button/Button";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";

export default function BulkLeadUpload() {
    const navigate = useNavigate();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [filePreview, setFilePreview] = useState(null);

    const validationSchema = Yup.object({
        file: Yup.mixed().required("Please select a file"),
    });

    const initialValues = {
        file: null,
    };

    const handleSubmit = async (values) => {
        const toastId = toast.loading("Uploading...");
        const formData = new FormData();
        formData.append("file", values.file);

        try {
            const response = await API.post(`/add-bulk-leads`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percent = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(percent);
                },
            });

            toast.success(response.data.message || "Uploaded successfully!", {
                id: toastId,
            });
            setUploadProgress(0);
            navigate("/dashboard/leads/all");
        } catch (error) {
            const errorMessage =
                error.response?.data?.error || "Something went wrong. Please try again.";
            toast.error(errorMessage);
            toast.dismiss(toastId);
            setUploadProgress(0);
        }
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
    });

    // Handle file selection + preview
    const handleFileChange = (e) => {
        const file = e.currentTarget.files[0];
        formik.setFieldValue("file", file);
        if (file) {
            setFilePreview({
                name: file.name,
                size: (file.size / 1024).toFixed(2) + " KB",
                type: file.type || "Unknown",
            });
        } else {
            setFilePreview(null);
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Leads", to: "/dashboard/leads/all" },
                    { label: "Bulk Upload", active: true },
                ]}
            />

            {/* Main Content */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Bulk Lead Upload
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload Excel/CSV file to import multiple leads at once.
                        </p>
                    </div>

                    <a
                        href="/excel/sample-leads.xlsx"
                        download
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        ⬇ Download Sample Format
                    </a>
                </div>

                <form
                    onSubmit={formik.handleSubmit}
                    encType="multipart/form-data"
                    className="max-w-3xl mx-auto"
                >
                    {/* Upload Card */}
                    <div
                        className={`relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 text-center cursor-pointer
        ${formik.touched.file && formik.errors.file
                                ? "border-red-400 bg-red-50"
                                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                            }`}
                        onClick={() => document.getElementById("fileInput").click()}
                    >
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-2xl shadow-inner">
                                📁
                            </div>

                            <p className="text-gray-700 font-medium">
                                Drag & Drop your file here or{" "}
                                <span className="text-blue-600 underline">browse</span>
                            </p>

                            <p className="text-xs text-gray-500">
                                Supported formats: .xlsx, .xls, .csv • Max size 2MB
                            </p>
                        </div>

                        <input
                            id="fileInput"
                            type="file"
                            name="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileChange}
                            onBlur={formik.handleBlur}
                        />
                    </div>

                    {formik.errors.file && formik.touched.file && (
                        <p className="text-sm text-red-500 mt-2">{formik.errors.file}</p>
                    )}

                    {/* File Preview */}
                    {filePreview && (
                        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                📄 Selected File
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                    <p className="text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900 truncate">
                                        {filePreview.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Size</p>
                                    <p className="font-medium text-gray-900">
                                        {filePreview.size}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Type</p>
                                    <p className="font-medium text-gray-900">
                                        {filePreview.type}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress > 0 && (
                        <div className="mt-6">
                            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>

                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            📊 File Instructions
                        </h3>
                        <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                            <li>Ensure header names match: name, email, contact, course, city, percentage</li>
                            <li>Phone numbers should be valid Indian numbers</li>
                            <li>Percentage can be 60 or 60%</li>
                        </ul>
                    </div>

                    {/* Submit */}
                    <div className="mt-8 flex justify-center">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={formik.isSubmitting}
                            className="px-10"
                        >
                            🚀 Upload Leads
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
