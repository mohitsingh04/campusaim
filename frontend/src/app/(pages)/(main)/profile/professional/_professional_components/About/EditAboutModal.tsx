import { UserProps } from "@/types/types";
import React from "react";
import { LuX } from "react-icons/lu";
import { useFormik } from "formik";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import API from "@/contexts/API";
import { ProfileAboutValidation } from "@/contexts/ValidationSchema";

interface EditAboutModalProps {
  profile: UserProps | null;
  onSave: () => void;
  onClose: () => void;
}

const EditAboutModal: React.FC<EditAboutModalProps> = ({
  profile,
  onSave,
  onClose,
}) => {
  const formik = useFormik({
    initialValues: {
      userId: profile?.uniqueId || "",
      heading: profile?.heading || "",
      about: profile?.about || "",
    },
    validationSchema: ProfileAboutValidation,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const response = await API.patch("/profile/bio", values);
        toast.success(response.data.message);
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        toast.error(err.response?.data.error || "Something Went Wrong");
      } finally {
        onSave();
        onClose();
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Edit About Section
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
            >
              <LuX className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Heading
            </label>
            <input
              type="text"
              name="heading"
              value={formik.values.heading}
              onChange={formik.handleChange}
              maxLength={200}
              placeholder="Your professional headline"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
            {formik.touched.heading && formik.errors.heading && (
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.heading}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              About Description
            </label>
            <textarea
              name="about"
              value={formik.values.about}
              onChange={formik.handleChange}
              placeholder="Tell us about yourself, your experience, goals, and what makes you unique..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
              maxLength={600}
            />
            {formik.touched.about && formik.errors.about && (
              <p className="text-xs text-red-500 mt-1">{formik.errors.about}</p>
            )}
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Write a compelling description that highlights your strengths
                and experience
              </p>
              <span className="text-sm text-gray-500">
                {formik.values.about.length}/600
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-purple-200 hover:bg-purple-600 border-2 border-purple-600 text-black hover:text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 to-indigo-600 hover:bg-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAboutModal;
