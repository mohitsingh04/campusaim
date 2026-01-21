"use client";
import { useEffect } from "react";
import { useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import API from "@/context/API";
import { PasswordInputGroup } from "@/ui/form/FormComponents";
import ButtonGroupSend from "@/ui/buttons/ButtonGroup";

export default function ResetPassword() {
  const { token } = useParams();
  const router = useRouter();

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await API.get(`/profile/reset/${token}`);
        getSuccessResponse(response);
      } catch (error) {
        getErrorResponse(error);
        router.push("/");
      }
    };
    verifyToken();
  }, [token, router]);

  const formik = useFormik({
    initialValues: {
      new_password: "",
      confirm_password: "",
      token,
    },
    // validationSchema: ResetPasswordValidation,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await API.post("/profile/reset", values);
        getSuccessResponse(response);
        router.push("/");
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* New Password */}
        <div className="relative">
          <PasswordInputGroup
            id="new_password"
            placeholder="Enter your password"
            value={formik.values.new_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {getFormikError(formik, "new_password")}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <PasswordInputGroup
            id="confirm_password"
            placeholder="Confirm your password"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {getFormikError(formik, "confirm_password")}
        </div>

        {/* Submit Button */}
        <ButtonGroupSend
          type="submit"
          label="Reset Password"
          className="w-full"
          disable={formik.isSubmitting}
        />
      </form>
    </>
  );
}
