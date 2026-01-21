"use client";
import { phoneInputClass } from "@/common/ExtraData";
import API from "@/context/API";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import { getToken } from "@/context/getAssets";
import { registreValidation } from "@/context/ValidationSchema";
import ButtonGroupSend from "@/ui/buttons/ButtonGroup";
import { InputGroup, PasswordInputGroup } from "@/ui/form/FormComponents";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PhoneInput from "react-phone-input-2";

export default function Page() {
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
      username: "",
      name: "",
      email: "",
      mobile_no: "",
      password: "",
      confirm_password: "",
      terms: false,
      role: "User",
    },
    validationSchema: registreValidation,
    validate: (values) => {
      const errors: any = {};
      if (!values.terms) {
        errors.terms = "You must accept the Terms & Conditions";
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await API.post(`/profile/register`, values);
        getSuccessResponse(response);
        router.push(`/auth/verify-email/${values?.email}`);
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
          {/* Username */}
          <div>
            <InputGroup
              id="username"
              type="text"
              placeholder="Enter your username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "username")}
          </div>
          <div>
            <InputGroup
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "name")}
          </div>
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

          {/* Mobile */}
          <div>
            <PhoneInput
              country={"in"}
              value={formik.values.mobile_no}
              onChange={(value) => formik.setFieldValue("mobile_no", value)}
              onBlur={formik.handleBlur}
              countryCodeEditable={false}
              enableSearch={true}
              inputClass={phoneInputClass?.input}
              buttonClass={phoneInputClass?.button}
              dropdownClass={phoneInputClass?.dropdown}
            />
            {getFormikError(formik, "mobile_no")}
          </div>

          {/* Password */}
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

          {/* Confirm Password */}
          <div>
            <PasswordInputGroup
              id="confirm_password"
              placeholder="Enter Confirm Password"
              value={formik.values.confirm_password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "confirm_password")}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="terms"
              type="checkbox"
              name="terms"
              checked={formik.values.terms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <label
              htmlFor="terms"
              className="text-xs text-gray-600 leading-tight"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Terms & Conditions
              </Link>
            </label>
          </div>
          {getFormikError(formik, "terms")}

          {/* Submit */}
          <ButtonGroupSend
            type="submit"
            label="Register"
            className="w-full"
            disable={formik.isSubmitting}
          />
          <p className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
