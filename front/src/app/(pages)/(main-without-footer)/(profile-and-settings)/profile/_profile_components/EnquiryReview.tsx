import React, { useState } from "react";
import { LuX, LuUser, LuMail, LuPhone } from "react-icons/lu";
import { useFormik } from "formik";
import { UserProps } from "@/types/UserTypes";
import API from "@/context/API";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import HeadingLine from "@/ui/headings/HeadingLine";
import { FeedbackData } from "@/common/FeedbackData";
import { enquiryReviewSchema } from "@/context/ValidationSchema";

interface EnquiryReviewModalProps {
  closeModal: () => void;
  profile: UserProps | null;
  enquiry: any;
}

export function EnquiryReviewModal({
  closeModal,
  profile,
  enquiry,
}: EnquiryReviewModalProps) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      reaction: "",
      feedbackMessage: "",
    },
    validationSchema: enquiryReviewSchema,
    onSubmit: async (values) => {
      if (!profile || !enquiry) return;
      setLoading(true);
      try {
        const response = await API.post("/enquiry/review", {
          enquiry_id: enquiry._id,
          reaction: values.reaction,
          message: values.feedbackMessage,
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
      value: profile?.name || "-",
    },
    {
      icon: <LuMail className="text-(--text-color-emphasis)" />,
      label: "Email",
      value: profile?.email || "-",
    },
    {
      icon: <LuPhone className="text-(--text-color-emphasis)" />,
      label: "Contact",
      value: profile?.mobile_no || "-",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-(--primary-bg) w-full sm:max-w-2xl rounded-custom m-2 shadow-custom max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
          <HeadingLine title="Share Your Experience" className="m-0!" />
          <button
            onClick={closeModal}
            className="text-(--text-color) hover:text-(--text-color-emphasis) p-2 rounded-lg"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={formik.handleSubmit}>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* User Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {details.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-(--secondary-bg) rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    {d.icon}
                    <span className="text-sm">{d.label}</span>
                  </div>
                  <span className="text-xs text-(--text-color-emphasis)">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Reaction */}

            <div className="space-y-2">
              <label className="text-sm text-(--text-color-emphasis)">
                How was your experience?
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {FeedbackData.map((item) => {
                  const Icon = item.icon;
                  const isActive = formik.values.reaction === item.label;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() =>
                        formik.setFieldValue("reaction", item.label)
                      }
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all
                      ${
                        isActive
                          ? `${item.bg} ${item.color} scale-105`
                          : "bg-(--secondary-bg) text-(--text-color)"
                      }
                    `}
                    >
                      <Icon className="text-2xl" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {getFormikError(formik, "reaction")}
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <label className="text-sm text-(--text-color-emphasis)">
                Your Feedback
              </label>
              <textarea
                rows={3}
                {...formik.getFieldProps("feedbackMessage")}
                className="w-full border border-(--border) rounded-custom px-3 py-2 text-sm"
                placeholder="Share your experience after resolving the enquiry..."
              />
              {getFormikError(formik, "feedbackMessage")}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-(--border)">
            <button
              type="button"
              onClick={closeModal}
              className="bg-(--secondary-bg) px-4 py-2 rounded-custom"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-shine px-4 py-2 rounded-custom"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
