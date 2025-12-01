import { LogOut, Trash2, X, Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { useState } from "react";
import { createPortal } from "react-dom";
import { API } from "../../../../contexts/API";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { DashboardOutletContextProps } from "../../../../types/types";

export default function SecuritySettings() {
  const navigate = useNavigate();
  const { authUser } = useOutletContext<DashboardOutletContextProps>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Password visibility state
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      id: authUser?._id,
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      current_password: Yup.string().required("Current password is required"),
      new_password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("New password is required"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password")], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await API.post("/profile/change-password", values);
        toast.success(response.data.message || "Password updated successfully");
        resetForm();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  // Logout
  const handleLogout = async () => {
    try {
      const response = await API.get("/profile/logout");
      toast.success(response?.data?.message || "Logged out successfully");
      window.location.reload();
    } catch (error) {
      getErrorResponse(error);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      const response = await API.post(
        `/profile/delete/account/${authUser?.uniqueId}`
      );
      toast.success(
        response.data.message ||
          "Account deleted successfully. Please check your email."
      );
      setShowDeleteModal(false);
      navigate(`/auth/delete/account/${authUser?.email}`);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Input field with password toggle
  const PasswordInput = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    show,
    toggleShow,
    placeholder,
  }: any) => (
    <div>
      <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--yp-muted)]"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );

  // --- Portal for Modal ---
  const DeleteModal = () =>
    createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-[var(--yp-primary)] rounded-xl p-6 max-w-md w-full shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[var(--yp-text-primary)]">
              Confirm Account Deletion
            </h3>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="text-[var(--yp-muted)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[var(--yp-muted)] mb-6">
            Are you sure you want to delete your account? This action is{" "}
            <span className="font-semibold text-[var(--yp-red-text)]">
              irreversible
            </span>
            . You will also receive a confirmation email.
          </p>
          <div className="flex justify-end gap-3">
            <button
              disabled={deleteLoading}
              onClick={() => setShowDeleteModal(false)}
              className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-[var(--yp-text-primary)] bg-[var(--yp-tertiary)]"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteAccount}
              disabled={deleteLoading}
              className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-[var(--yp-red-bg)] bg-[var(--yp-red-text)]"
            >
              {deleteLoading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="lg:col-span-3">
      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
            Change Password
          </h2>

          <PasswordInput
            label="Current Password"
            name="current_password"
            value={formik.values.current_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.current_password && formik.errors.current_password
                ? formik.errors.current_password
                : ""
            }
            show={showCurrent}
            toggleShow={() => setShowCurrent(!showCurrent)}
            placeholder="Enter current password"
          />

          <PasswordInput
            label="New Password"
            name="new_password"
            value={formik.values.new_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.new_password && formik.errors.new_password
                ? formik.errors.new_password
                : ""
            }
            show={showNew}
            toggleShow={() => setShowNew(!showNew)}
            placeholder="Enter new password"
          />

          <PasswordInput
            label="Confirm Password"
            name="confirm_password"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.confirm_password && formik.errors.confirm_password
                ? formik.errors.confirm_password
                : ""
            }
            show={showConfirm}
            toggleShow={() => setShowConfirm(!showConfirm)}
            placeholder="Confirm new password"
          />

          <div className="flex justify-between items-center">
            <Link
              to="/forgot-password"
              className="text-sm text-[var(--yp-main)] hover:underline"
            >
              Forgot Password?
            </Link>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              {formik.isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>

        {/* Logout & Delete Account */}
        <div className="p-6 border-t border-[var(--yp-border-primary)] space-y-4">
          <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
            Account Actions
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-[var(--yp-text-primary)] bg-[var(--yp-tertiary)]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-[var(--yp-red-bg)] bg-[var(--yp-red-text)]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Portal-based Modal */}
      {showDeleteModal && <DeleteModal />}
    </div>
  );
}
