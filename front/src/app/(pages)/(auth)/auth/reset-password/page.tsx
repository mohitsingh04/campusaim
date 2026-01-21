"use client";
import API from "@/context/API";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import { emailValidation } from "@/context/ValidationSchema";
import ButtonGroupSend from "@/ui/buttons/ButtonGroup";
import { InputGroup } from "@/ui/form/FormComponents";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPassword() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: emailValidation,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await API.post("/profile/forgot-password", values);
        getSuccessResponse(response);
        router.push(`/auth/reset-password/send/${values.email}`);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-5">
          <div>
            <InputGroup
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "email")}
          </div>

          <ButtonGroupSend
            type="submit"
            label="Send Reset Link"
            className="w-full"
            disable={formik.isSubmitting}
          />

          {/* Remember password link */}
          <p className="text-center text-xs text-gray-500">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
