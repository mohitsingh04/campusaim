"use client";

import { UserProps } from "@/types/UserTypes";
import { PasswordInputGroup } from "@/ui/form/FormComponents";
import { useFormik } from "formik";
import API from "@/context/API";
import { useState } from "react";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import ButtonGroupSend from "@/ui/buttons/ButtonGroup";
import { BiLogOut, BiSave } from "react-icons/bi";
import { userChangePasswordValidation } from "@/context/ValidationSchema";
import { LuTrash2, LuX } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import HeadingLine from "@/ui/headings/HeadingLine";

const SecuritySetting = ({ profile }: { profile: UserProps | null }) => {
  const [resLoading, setResLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      id: profile?._id,
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    enableReinitialize: true,
    validationSchema: userChangePasswordValidation,
    onSubmit: async (values, { resetForm }) => {
      setResLoading(true);
      try {
        const response = await API.post("/profile/change-password", values);
        getSuccessResponse(response);
        resetForm();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setResLoading(false);
      }
    },
  });

  // Logout
  const handleLogout = async () => {
    try {
      const response = await API.get("/profile/logout");
      getSuccessResponse(response);
      window.location.reload();
    } catch (error) {
      getErrorResponse(error);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      const response = await API.post(
        `/profile/delete/account/${profile?.uniqueId}`
      );
      getSuccessResponse(response);
      setShowDeleteModal(false);
      router.push(`/auth/delete/account/${profile?.email}`);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const DeleteModal = () =>
    createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-(--primary-bg) rounded-xl p-6 max-w-md w-full shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <HeadingLine title="Confirm Account Deletion" />
            <button
              onClick={() => setShowDeleteModal(false)}
              className="text-(--text-color)"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>
          <p className="text-(--text-color) mb-6">
            Are you sure you want to delete your account? This action is{" "}
            <span className="font-semibold text-(--danger)">irreversible</span>.
            You will also receive a confirmation email.
          </p>
          <div className="flex justify-end gap-3">
            <button
              disabled={deleteLoading}
              onClick={() => setShowDeleteModal(false)}
              className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-(--gray-subtle) bg-(--gray-emphasis)"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteAccount}
              disabled={deleteLoading}
              className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-(--danger-subtle) bg-(--danger) disabled:opacity-75"
            >
              {deleteLoading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="sm:space-y-12 space-y-6">
      <section className="text-(--text-color)">
        <div className="flex flex-col justify-between items-start">
          <div>
            <div className="w-full mb-4">
              <h2 className="sub-heading font-semibold">Security</h2>
              <p>Set your account details</p>
            </div>
          </div>

          {/* Form Inputs */}
          <form
            onSubmit={formik.handleSubmit}
            className="w-full space-y-5 sm:max-w-xl"
          >
            <div className="">
              <PasswordInputGroup
                label="Current Password"
                id="current_password"
                value={formik.values.current_password}
                onChange={formik.handleChange}
                placeholder="Enter your current email"
              />
              {getFormikError(formik, "current_password")}
            </div>
            <div className="">
              <PasswordInputGroup
                label="New Password"
                id="new_password"
                value={formik.values.new_password}
                onChange={formik.handleChange}
                placeholder="Enter your new password"
              />
              {getFormikError(formik, "new_password")}
            </div>
            <div className="">
              <PasswordInputGroup
                label="Confirm Password"
                id="confirm_password"
                value={formik.values.confirm_password}
                onChange={formik.handleChange}
                placeholder="Enter your confirm password"
              />
              {getFormikError(formik, "confirm_password")}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="md:col-span-2 flex justify-end">
              <ButtonGroupSend
                Icon={BiSave}
                label="Save"
                type="submit"
                disable={resLoading}
              />
            </div>
          </form>
        </div>
      </section>
      <div className="border-b border-(--border)"></div>
      <section className="text-(--text-color-emphasis)">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-(--warning-emphasis) bg-(--warning-subtle)"
          >
            <BiLogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-(--danger-emphasis) bg-(--danger-subtle)"
          >
            <LuTrash2 className="w-4 h-4 mr-2" />
            Delete Account
          </button>
        </div>
      </section>

      {/* Portal-based Modal */}
      {showDeleteModal && <DeleteModal />}
    </div>
  );
};

export default SecuritySetting;
