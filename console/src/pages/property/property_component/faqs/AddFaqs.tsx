import { useMemo, useState } from "react";
import { useFormik } from "formik";
import JoditEditor from "jodit-react";
import { API } from "../../../../contexts/API";
import { toast } from "react-hot-toast";
import {
  DashboardOutletContextProps,
  PropertyProps,
} from "../../../../types/types";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";
import { useOutletContext } from "react-router-dom";
import { FaqValidation } from "../../../../contexts/ValidationsSchemas";
import {
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";

interface AddFaqProps {
  onAddSuccess: () => void;
  property: PropertyProps | null;
}

export default function AddFaq({ onAddSuccess, property }: AddFaqProps) {
  const { authUser } = useOutletContext<DashboardOutletContextProps>();
  const [answer, setAnswer] = useState("");
  const editorConfig = useMemo(() => getEditorConfig(), []);

  const formik = useFormik({
    initialValues: {
      userId: authUser?._id || "",
      property_id: property?._id || "",
      question: "",
    },
    enableReinitialize: true,
    validationSchema: FaqValidation,
    onSubmit: async (values, { resetForm }) => {
      if (!answer.trim()) {
        toast.error("Answer cannot be empty");
        return;
      }
      try {
        const res = await API.post("/faqs", {
          userId: values?.userId,
          property_id: values?.property_id,
          question: values.question,
          answer,
        });
        toast.success(res.data.message || "FAQ added successfully");
        resetForm();
        setAnswer("");
        onAddSuccess();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  return (
    <div className="mb-8 border-b border-[var(--yp-border-primary)] bg-[var(--yp-primary)] p-4 sm:p-6">
      <form onSubmit={formik.handleSubmit}>
        {/* Question Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Question
          </label>
          <input
            type="text"
            name="question"
            placeholder="Enter your question"
            value={formik.values.question}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
          {getFormikError(formik, "question")}
        </div>

        {/* Answer Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Answer
          </label>
          <JoditEditor
            value={answer}
            config={editorConfig}
            onBlur={(newContent) => setAnswer(newContent)}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          + Add FAQ
        </button>
      </form>
    </div>
  );
}
