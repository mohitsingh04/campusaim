import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API } from "../../../services/API";
import DEFAULT_IMAGE from "../../../assets/images/No_Image_Available.jpg";
import { useNavigate } from "react-router-dom";
import DocumentsSkeleton from "./DocumentsSkeleton.jsx";

const BASE_URL = import.meta.env.VITE_MEDIA_URL;

function Documents() {
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState(null);
  const [panFrontPreview, setPanFrontPreview] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [documents, setDocuments] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Get profile
  useEffect(() => {
    const getAuthUserData = async () => {
      try {
        const { data } = await API.get("/profile");
        setAuthUser(data?.data);
      } catch (error) {
        toast.error(error.message || "Failed to fetch profile");
      }
    };

    getAuthUserData();
  }, []);

  // Get documents after authUser is set
  useEffect(() => {
    if (!authUser?._id) return;

    const fetchDocuments = async () => {
      try {
        const { data } = await API.get(`/documents/${authUser._id}`);
        const docs = data?.data;
        setDocuments(docs);

        // Set initial previews from DB
        if (docs?.aadhaarCardFrontImgCompressed)
          setAadhaarFrontPreview(`${BASE_URL}${docs.aadhaarCardFrontImgCompressed}`);
        if (docs?.aadhaarCardBackImgCompressed)
          setAadhaarBackPreview(`${BASE_URL}${docs.aadhaarCardBackImgCompressed}`);
        if (docs?.panCardFrontImgCompressed)
          setPanFrontPreview(`${BASE_URL}${docs.panCardFrontImgCompressed}`);
      } catch (err) {
        const status = err.response?.status;
        const errorMessage = err.response?.data?.error || "";

        if (status === 500 || errorMessage.toLowerCase().includes("not found")) {
          setDocuments(null);
        } else {
          toast.error("Failed to Documents");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [authUser]);

  const validationSchema = Yup.object({
    aadhaarCardNumber: Yup.string()
      .required("Aadhaar number is required")
      .matches(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),

    panCardNumber: Yup.string()
      .required("PAN number is required")
      .matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN format (ABCDE1234F)"
      ),
  });

  const initialValues = {
    userId: authUser?._id || "",
    aadhaarCardNumber: documents?.aadhaarCardNumber || "",
    aadhaarCardFrontImg: "",
    aadhaarCardBackImg: "",
    panCardNumber: documents?.panCardNumber || "",
    panCardFrontImg: "",
  };

  const handleSubmit = async (values) => {
    const toastId = toast.loading("Saving...");

    try {
      const formData = new FormData();
      formData.append("userId", authUser?._id);
      formData.append("aadhaarCardNumber", values.aadhaarCardNumber);
      formData.append("aadhaarCardFrontImg", values.aadhaarCardFrontImg);
      formData.append("aadhaarCardBackImg", values.aadhaarCardBackImg);
      formData.append("panCardNumber", values.panCardNumber);
      formData.append("panCardFrontImg", values.panCardFrontImg);

      const response = await API.put(`/documents/${authUser?._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response?.data?.message || "Updated successfully!", {
        id: toastId,
      });
      navigate(0);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Something went wrong. Please try again.";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  const handleFileChange = (e, fieldName, setPreview) => {
    const file = e.currentTarget.files[0];
    if (file) {
      formik.setFieldValue(fieldName, file);
      setPreview(URL.createObjectURL(file));
    }
  };

  if (!authUser || isLoading) {
    return <DocumentsSkeleton />;
  }

  const renderImageUploader = (label, preview, setPreview, fieldName) => (
    <div className="space-y-2 w-full max-w-xs">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative group w-full rounded-lg overflow-hidden shadow border border-gray-200">
        <img
          src={preview || DEFAULT_IMAGE}
          alt={label}
          className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        <div className="hidden md:flex absolute inset-0 bg-black bg-opacity-40 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <label className="cursor-pointer text-white bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 text-sm">
            Change Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, fieldName, setPreview)}
            />
          </label>
        </div>
      </div>
      <div className="md:hidden">
        <label className="block w-full cursor-pointer bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 text-sm">
          Change Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, fieldName, setPreview)}
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Documents</h2>
      <form onSubmit={formik.handleSubmit} className="space-y-6" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aadhaar Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhaar Card Number
            </label>
            <input
              type="text"
              name="aadhaarCardNumber"
              placeholder="Enter 12-digit Aadhaar Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={12}
              value={formik.values.aadhaarCardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                formik.setFieldValue("aadhaarCardNumber", value);
              }}
              onBlur={formik.handleBlur}
            />
            {formik.touched.aadhaarCardNumber && formik.errors.aadhaarCardNumber && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.aadhaarCardNumber}
              </p>
            )}
          </div>

          {/* PAN Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PAN Card Number
            </label>
            <input
              type="text"
              name="panCardNumber"
              placeholder="Enter PAN Number (ABCDE1234F)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={10}
              value={formik.values.panCardNumber}
              onChange={(e) => {
                formik.setFieldValue("panCardNumber", e.target.value.toUpperCase());
              }}
              onBlur={formik.handleBlur}
            />
            {formik.touched.panCardNumber && formik.errors.panCardNumber && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.panCardNumber}
              </p>
            )}
          </div>

          {/* Aadhaar Front */}
          {renderImageUploader(
            "Aadhaar Card Front Image",
            aadhaarFrontPreview,
            setAadhaarFrontPreview,
            "aadhaarCardFrontImg"
          )}

          {/* Aadhaar Back */}
          {renderImageUploader(
            "Aadhaar Card Back Image",
            aadhaarBackPreview,
            setAadhaarBackPreview,
            "aadhaarCardBackImg"
          )}

          {/* PAN Front */}
          {renderImageUploader(
            "PAN Card Front Image",
            panFrontPreview,
            setPanFrontPreview,
            "panCardFrontImg"
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Saving..." : "Save Documents"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Documents;
