import { useFormik } from "formik";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { useNavigate, useOutletContext } from "react-router-dom";
import { DashboardOutletContextProps } from "../../types/types";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import { FeedBackValidation } from "../../contexts/ValidationsSchemas";
import { getErrorResponse, getFormikError } from "../../contexts/Callbacks";
import EditSkeleton from "../../ui/skeleton/EditPageSkeleton";
import { FeedbackData } from "../../common/FeedbackData";

export default function FeedbackGive() {
  const { authUser } = useOutletContext<DashboardOutletContextProps>();
  const [feedback, setFeedback] = useState<any>("");
  const [loading, setLoading] = useState(true);
  const redirector = useNavigate();

  const getFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/feedback/user/${authUser?.uniqueId}`);
      setFeedback(response.data || "");
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [authUser?.uniqueId]);

  useEffect(() => {
    getFeedback();
  }, [getFeedback]);

  useEffect(() => {
    if (!loading) {
      if (feedback) {
        redirector(`/dashboard/settings?tab=feedback`);
      }
    }
  }, [redirector, feedback, loading]);

  const formik = useFormik({
    initialValues: {
      userId: authUser?.uniqueId || "",
      reaction: "",
      message: "",
    },
    enableReinitialize: true,
    validationSchema: FeedBackValidation,
    onSubmit: async (values) => {
      try {
        const response = await API.post(`/give-feedback`, values);
        toast.success(
          response.data.message || "Feedback submitted successfully!"
        );
        window.location.reload();
        redirector("/dashboard");
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  if (loading) {
    return <EditSkeleton />;
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="w-full">
        <Breadcrumbs
          title="Give Feedback"
          breadcrumbs={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Give Feedback" },
          ]}
        />
      </div>

      {/* Feedback Card */}
      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm p-6">
        <div className="p-4 sm:p-6">
          {/* Rating */}
          <div className="text-center mb-6">
            <h6 className="font-semibold text-[var(--yp-muted)] mb-4 text-sm sm:text-base">
              How was your experience?
            </h6>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {FeedbackData.map((rate) => {
                const Icon = rate.icon;
                const isSelected = formik.values.reaction === rate.label;
                return (
                  <div
                    key={rate.label}
                    className="flex flex-col items-center cursor-pointer w-20 sm:w-auto"
                    onClick={() => formik.setFieldValue("reaction", rate.label)}
                  >
                    <span
                      className={`
                        p-2 sm:p-3 rounded-full transition-all duration-300 transform ${
                          rate.bg
                        } ${rate.color}
                        ${
                          !isSelected &&
                          `hover:scale-110 opacity-45 hover:opacity-80`
                        }
                        ${isSelected ? "scale-110 sm:scale-125" : ""}
                      `}
                    >
                      <Icon size={28} className="sm:w-9 sm:h-9" />
                    </span>
                    <small
                      className={`mt-2 text-xs sm:text-sm text-center leading-tight ${
                        isSelected
                          ? "font-semibold " + rate.color
                          : "text-[var(--yp-muted)]"
                      }`}
                    >
                      {rate.label}
                    </small>
                  </div>
                );
              })}
            </div>
            {getFormikError(formik, "reaction")}
          </div>

          {/* Textarea */}
          <div className="mb-4">
            <label className="block font-medium text-[var(--yp-muted)] mb-2 text-sm sm:text-base">
              Your Feedback
            </label>
            <textarea
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              rows={4}
              placeholder="Write your feedback here..."
              {...formik.getFieldProps("message")}
            />
            {getFormikError(formik, "message")}
          </div>

          {/* Button */}
          <div className="text-right">
            <button
              onClick={() => formik.handleSubmit()}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
