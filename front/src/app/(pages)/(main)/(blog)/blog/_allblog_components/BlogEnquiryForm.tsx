"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import { BlogsProps } from "@/types/BlogTypes";
import { InputGroup, TextareaGroup } from "@/ui/form/FormComponents";
import PhoneInput from "react-phone-input-2";
import ButtonGroupSend from "@/ui/buttons/ButtonGroup";
import { phoneInputClass } from "@/common/ExtraData";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import HeadingLine from "@/ui/headings/HeadingLine";
import { blogEnquiryValidation } from "@/context/ValidationSchema";
import API from "@/context/API";
import EnquirySubmitted from "@/ui/submits/EnquirySubmitted";
import { UserProps } from "@/types/UserTypes";

const BlogEnquiryForm = ({ blog }: { blog: BlogsProps | null }) => {
  const [submitted, setSubmitted] = React.useState(false);
  const [user, setUser] = useState<UserProps | null>(null);

  const getUser = useCallback(async () => {
    try {
      const response = await API.get(`/profile/detail`);
      setUser(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      mobile_no: user?.mobile_no || "",
      message: "",
      blogId: blog?.uniqueId || "",
    },
    enableReinitialize: true,
    validationSchema: blogEnquiryValidation,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await API.post(`/blog/create/enquiry`, values);
        getSuccessResponse(response);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
        setSubmitted(true);
        resetForm();
      }
    },
  });
  if (submitted) return <EnquirySubmitted setSubmitted={setSubmitted} />;

  return (
    <div className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom p-5">
      <HeadingLine title="Send Enquiry" />

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="relative">
            <InputGroup
              label="Full Name"
              id="name"
              type="text"
              placeholder="Enter your full name"
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            {getFormikError(formik, "name")}
          </div>

          {/* Email */}
          <div className="relative">
            <InputGroup
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            {getFormikError(formik, "email")}
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label
            htmlFor="mobile_no"
            className="block text-sm text-(--text-color) mb-1"
          >
            Contact Number
          </label>

          <PhoneInput
            country={"in"}
            value={formik.values.mobile_no}
            onChange={(phone) => formik.setFieldValue("mobile_no", phone)}
            inputClass={phoneInputClass?.input}
            dropdownClass={phoneInputClass?.dropdown}
            buttonClass={phoneInputClass?.button}
          />

          {getFormikError(formik, "mobile_no")}
        </div>

        {/* Message */}
        <div>
          <TextareaGroup
            label="Message"
            id="message"
            placeholder="Write your message here..."
            onChange={formik.handleChange}
            value={formik.values.message}
          />
          {getFormikError(formik, "message")}
        </div>

        {/* Submit */}
        <ButtonGroupSend
          label="Send Enquiry"
          type="submit"
          disable={formik.isSubmitting}
          isSubmitting={formik.isSubmitting}
          className="w-full"
        />
      </form>
    </div>
  );
};

export default BlogEnquiryForm;
