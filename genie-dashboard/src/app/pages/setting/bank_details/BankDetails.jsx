import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import DEFAULT_IMAGE from "../../../assets/images/No_Image_Available.jpg";
import { API } from "../../../services/API";
import { useNavigate } from "react-router-dom";
import BankDetailsSkeleton from "./BankDetailsSkeleton.jsx";

const BASE_URL = import.meta.env.VITE_MEDIA_URL;

function BankDetails() {
  const navigate = useNavigate();
  const [passbookPreview, setPassbookPreview] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get profile on mount
  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const { data } = await API.get("/profile");
        setAuthUser(data?.data);
      } catch (error) {
        toast.error(error.message || "Failed to fetch profile");
      }
    };
    fetchAuthUser();
  }, []);

  // Fetch bank details once authUser is set
  useEffect(() => {
    if (!authUser?._id) return;

    const fetchBankDetails = async () => {
      try {
        const { data } = await API.get(`/bank-details/${authUser._id}`);
        const details = data?.data;
        setBankDetails(details);

        if (details?.passbookOrCancelCheckbookImgCompressed) {
          setPassbookPreview(`${BASE_URL}${details.passbookOrCancelCheckbookImgCompressed}`);
        }
      } catch (err) {
        const status = err.response?.status;
        const errorMessage = err.response?.data?.error || "";

        if (status === 500 || errorMessage.toLowerCase().includes("not found")) {
          setBankDetails(null);
        } else {
          toast.error("Failed to Bank Details");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankDetails();
  }, [authUser]);

  const validationSchema = Yup.object({
    beneficiaryName: Yup.string().min(2, "Too short").required("Beneficiary name is required"),
    accountNumber: Yup.string().required("Account number is required"),
    bankName: Yup.string().required("Bank name is required"),
    ifscCode: Yup.string().required("IFSC code is required"),
  });

  const initialValues = {
    beneficiaryName: bankDetails?.beneficiaryName || "",
    accountNumber: bankDetails?.accountNumber || "",
    bankName: bankDetails?.bankName || "",
    ifscCode: bankDetails?.ifscCode || "",
    passbookOrCancelCheckbookImg: "",
  };

  const handleSubmit = async (values) => {
    const toastId = toast.loading("Saving...");

    try {
      const formData = new FormData();
      formData.append("userId", authUser?._id);
      formData.append("beneficiaryName", values.beneficiaryName);
      formData.append("accountNumber", values.accountNumber);
      formData.append("bankName", values.bankName);
      formData.append("ifscCode", values.ifscCode);
      formData.append("passbookOrCancelCheckbookImg", values.passbookOrCancelCheckbookImg);

      const response = await API.put(`/bank-details/${authUser?._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response?.data?.message || "Updated successfully!", { id: toastId });
      navigate(0); // Refresh page
    } catch (error) {
      toast.error(error?.response?.data?.error || "Something went wrong.", { id: toastId });
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  const handleFileChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      formik.setFieldValue("passbookOrCancelCheckbookImg", file);
      setPassbookPreview(URL.createObjectURL(file));
    }
  };

  if (!authUser || isLoading) {
    return <BankDetailsSkeleton />;
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Bank Details</h2>

      <form onSubmit={formik.handleSubmit} className="space-y-6" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Beneficiary Name */}
          <InputField
            label="Beneficiary Name"
            name="beneficiaryName"
            formik={formik}
            placeholder="Enter Beneficiary Name"
          />

          {/* Account Number */}
          <InputField
            label="Account Number"
            name="accountNumber"
            formik={formik}
            placeholder="Enter Account Number"
          />

          {/* Bank Name */}
          <InputField
            label="Bank Name"
            name="bankName"
            formik={formik}
            placeholder="Enter Bank Name"
          />

          {/* IFSC Code */}
          <InputField
            label="IFSC Code"
            name="ifscCode"
            formik={formik}
            placeholder="Enter IFSC Code"
          />

          {/* Passbook/Cheque Upload */}
          <div className="space-y-2 w-full max-w-xs">
            <label className="block text-sm font-medium text-gray-700">
              Passbook/Cancelled Cheque Image
            </label>
            <div className="relative group w-full rounded-lg overflow-hidden shadow border border-gray-200">
              <img
                src={passbookPreview || DEFAULT_IMAGE}
                alt="Passbook Preview"
                className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />
              <div className="hidden md:flex absolute inset-0 bg-black bg-opacity-40 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer text-white bg-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-700">
                  Change Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>
            <div className="md:hidden">
              <label className="block w-full cursor-pointer bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 text-sm">
                Change Image
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Saving..." : "Save Bank Details"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BankDetails;

// Reusable InputField Component
const InputField = ({ label, name, formik, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
    />
    {formik.touched[name] && formik.errors[name] && (
      <p className="text-red-500 text-sm mt-1">{formik.errors[name]}</p>
    )}
  </div>
);
