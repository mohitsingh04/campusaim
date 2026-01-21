import React, { useCallback, useEffect, useState } from "react";
import { LuX, LuUser, LuMail, LuPhone, LuMessageSquare } from "react-icons/lu";
import { FaHome } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import { UserProps } from "@/types/UserTypes";
import { PropertyProps } from "@/types/PropertyTypes";
import API from "@/context/API";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import HeadingLine from "@/ui/headings/HeadingLine";

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
      getErrorResponse(error, true);
    }
  }, []);

  const getProperty = useCallback(async () => {
    try {
      const response = await API.get(`/property/slug/${property_slug}`);
      setProperty(response.data);
    } catch (error) {
      getErrorResponse(error, true);
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
          userId: user?._id,
          name: user?.name,
          email: user?.email,
          contact: user?.mobile_no,
          property_id: property.uniqueId,
          property_name: property.property_name,
          message: values.enquiryMessage,
        });
        getSuccessResponse(response);
        closeModal();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setLoading(false);
      }
    },
  });

  const details = [
    {
      icon: <LuUser className="text-(--text-color-emphasis)" />,
      label: "Name",
      value: user?.name || "-",
    },
    {
      icon: <LuMail className="text-(--text-color-emphasis)" />,
      label: "Email",
      value: user?.email || "-",
    },
    {
      icon: <LuPhone className="text-(--text-color-emphasis)" />,
      label: "Contact",
      value: user?.mobile_no || "-",
    },
    {
      icon: <FaHome className="text-(--text-color-emphasis)" />,
      label: "Institute",
      value: property?.property_name || "-",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-(--primary-bg) rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-(--primary-bg) px-6 py-4 border-b border-(--border) flex items-center justify-between sticky top-0 z-10">
          <HeadingLine title="Enquiry Form" className="m-0!" />
          <button
            onClick={closeModal}
            className="text-(--text-color) hover:text-(--text-color-emphasis) p-2 rounded-lg transition-all"
          >
            <LuX className="h-4 w-4" />
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
                  className="flex items-center justify-between bg-(--secondary-bg) rounded-xl px-4 py-3 shadow-xs"
                >
                  <div className="flex items-center space-x-2">
                    {d.icon}
                    <span className="text-sm text-(--text-color)">
                      {d.label}
                    </span>
                  </div>
                  <span className="text-(--text-color-emphasis) text-xs font-normal">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Enquiry textarea */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-normal text-(--text-color-emphasis)">
                <LuMessageSquare className="text-(--text-color-emphasis)" />
                <span>Your Enquiry</span>
              </label>
              <textarea
                id="enquiryMessage"
                {...formik.getFieldProps("enquiryMessage")}
                rows={4}
                placeholder="Write your enquiry here..."
                className={`w-full border border-(--border) rounded-custom placeholder:text-(--text-color) px-3 py-2 text-sm focus:ring-2 focus:ring-(--border) focus:outline-none`}
              />
              {getFormikError(formik, "enquiryMessage")}
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end space-x-3 bg-(--primary-bg)  p-4 border-t border-(--border)">
            <button
              type="button"
              onClick={closeModal}
              className="flex items-center gap-1 bg-(--secondary-bg) px-2.5 py-1.5 rounded-custom text-(--text-color-emphasis)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1 btn-shine px-2.5 py-1.5 rounded-custom"
            >
              {loading ? "Sending..." : "Send Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
