"use client";
import API from "@/context/API";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import { getToken } from "@/context/getAssets";
import { loginValidation } from "@/context/ValidationSchema";
import ButtonGroupSend from "@/ui/buttons/ButtonGroup";
import { InputGroup, PasswordInputGroup } from "@/ui/form/FormComponents";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (token) {
        router.push("/");
      }
    };

    checkToken();
  }, [router]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidation,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await API.post(`/profile/login`, values);
        getSuccessResponse(response);
        window.location.reload();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });
  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-5">
          <div>
            <InputGroup
              id="email"
              type="text"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "email")}
          </div>
          <div>
            <PasswordInputGroup
              id="password"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "password")}
          </div>
          <div className="flex justify-end items-center text-xs">
            <Link
              href="/auth/reset-password"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <ButtonGroupSend
            type="submit"
            label="Login"
            className="w-full"
            disable={formik.isSubmitting}
          />
          <p className="text-center text-xs text-gray-500">
            Don&apos;t have an account?
            <Link
              href="/auth/register"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              {" "}
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
