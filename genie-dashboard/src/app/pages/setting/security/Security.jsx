import { Eye, EyeOff, Save } from "lucide-react";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { API } from "../../../services/API";
import { useNavigate } from "react-router-dom";
import SecuritySkeleton from "./SecuritySkeleton.jsx";
import Button from "../../../components/ui/Button/Button.jsx";

function Security() {
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const isGoogleOnly = authUser?.provider === "google";

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

  const validationSchema = Yup.object({
    currentPassword: isGoogleOnly
      ? Yup.string()
      : Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .required("New password is required")
      .min(6, "Password should be at least 6 characters"),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const initialValues = {
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const handleSubmit = async (values) => {
    const toastId = toast.loading("Saving...");

    try {
      const response = await API.post(`/change-password`, values);
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


  if (!authUser) {
    return <SecuritySkeleton />;
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div>
          {isGoogleOnly && (
            <div className="bg-blue-50 border p-3 rounded text-sm mb-3 text-blue-700">
              You signed in using Google. Set a password to enable email login.
            </div>
          )}
          <div className="space-y-4">
            {/* Current Password */}
            {!isGoogleOnly && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 border-gray-300 ${formik.touched.currentPassword && formik.errors.currentPassword
                      ? "border-red-500"
                      : ""
                      }`}
                    value={formik.values.currentPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formik.touched.currentPassword && formik.errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.currentPassword}</p>
                )}
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 ${formik.touched.newPassword && formik.errors.newPassword ? "border-red-500" : ""
                    }`}
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.newPassword}</p>
                )}
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 ${formik.touched.confirmNewPassword && formik.errors.confirmNewPassword
                    ? "border-red-500"
                    : ""
                    }`}
                  value={formik.values.confirmNewPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formik.touched.confirmNewPassword && formik.errors.confirmNewPassword && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.confirmNewPassword}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={formik.isSubmitting}
          >
            {isGoogleOnly ? "Set Password" : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Security;
