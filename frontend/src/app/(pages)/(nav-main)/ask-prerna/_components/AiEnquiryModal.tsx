import API from "@/contexts/API";
import { PropertyProps, UserProps } from "@/types/types";
import React, { useCallback, useEffect, useState } from "react";
import {
  LuFileText,
  LuX,
  LuUser,
  LuMail,
  LuPhone,
  LuMessageSquare,
} from "react-icons/lu";
import { FaHome } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface AiEnquiryModalProps {
  closeModal: () => void;
  property_slug: string;
}

export function AiEnquiryModal({
  closeModal,
  property_slug,
}: AiEnquiryModalProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const [property, setProperty] = useState<PropertyProps | null>(null);
  const [loading, setLoading] = useState(false);

  const getUser = useCallback(async () => {
    try {
      const response = await API.get(`/profile/detail`);
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getProperty = useCallback(async () => {
    try {
      const response = await API.get(`/property/slug/${property_slug}`);
      setProperty(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [property_slug]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    getProperty();
  }, [getProperty]);

  const formik = useFormik({
    initialValues: {
      enquiryMessage: "",
    },
    validationSchema: Yup.object({
      enquiryMessage: Yup.string()
        .min(3, "Enquiry must be at least 10 characters")
        .required("Enquiry message is required"),
    }),
    onSubmit: async (values) => {
      if (!user || !property) return;
      setLoading(true);
      try {
        const response = await API.post("/add/enquiry", {
          userId: user.uniqueId,
          name: user.name,
          email: user.email,
          contact: user.mobile_no,
          property_id: property.uniqueId,
          property_name: property.property_name,
          message: values.enquiryMessage,
        });
        Swal.fire({
          text: response.data.message || "Enquiry submitted successfully!",
          title: "Successfull",
          icon: "success",
        }).then(() => {
          closeModal();
        });
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to submit enquiry");
      } finally {
        setLoading(false);
      }
    },
  });

  const details = [
    {
      icon: <LuUser className="text-gray-900" />,
      label: "Name",
      value: user?.name || "-",
    },
    {
      icon: <LuMail className="text-gray-900" />,
      label: "Email",
      value: user?.email || "-",
    },
    {
      icon: <LuPhone className="text-gray-900" />,
      label: "Contact",
      value: user?.mobile_no || "-",
    },
    {
      icon: <FaHome className="text-gray-900" />,
      label: "Institute",
      value: property?.property_name || "-",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <LuFileText className="h-6 w-6 text-gray-900" />
            <h2 className="text-2xl font-bold text-gray-900">Enquiry Form</h2>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="p-4 space-y-3">
            {/* User + Property details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              {details.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 shadow-xs"
                >
                  <div className="flex items-center space-x-2">
                    {d.icon}
                    <span className="text-sm text-gray-700">{d.label}</span>
                  </div>
                  <span className="text-gray-900 text-xs font-normal">{d.value}</span>
                </div>
              ))}
            </div>

            {/* Enquiry textarea */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-normal text-gray-700">
                <LuMessageSquare className="text-gray-900" />
                <span>Your Enquiry</span>
              </label>
              <textarea
                id="enquiryMessage"
                {...formik.getFieldProps("enquiryMessage")}
                rows={4}
                placeholder="Write your enquiry here..."
                className={`w-full border ${
                  formik.touched.enquiryMessage && formik.errors.enquiryMessage
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:outline-none`}
              />
              {formik.touched.enquiryMessage &&
                formik.errors.enquiryMessage && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.enquiryMessage}
                  </p>
                )}
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end space-x-3 bg-gradient-to-r from-gray-50 to-indigo-50  p-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-3 border-2 border-gray-900 hover:border-gray-800 rounded-xl text-gray-900 hover:text-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
