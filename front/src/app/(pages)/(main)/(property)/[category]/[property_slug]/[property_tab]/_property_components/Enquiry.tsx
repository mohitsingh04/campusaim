"use client";

import ButtonGroupSend from "@/ui/buttons/ButtonGroup";
import {
  InputGroup,
  SelectGroup,
  TextareaGroup,
} from "@/ui/form/FormComponents";
import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  getErrorResponse,
  getFieldDataSimple,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import { enquirySchema } from "@/context/ValidationSchema";
import API from "@/context/API";
import { PropertyProps } from "@/types/PropertyTypes";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { phoneInputClass } from "@/common/ExtraData";
import HeadingLine from "@/ui/headings/HeadingLine";
import EnquirySubmitted from "@/ui/submits/EnquirySubmitted";
import EnquiryFormSkeleton from "@/ui/loader/ui/EnquiryFormSkeleton";
import useGetAuthUser from "@/hooks/fetch-hooks/useGetAuthUser";

const EnquiryForm = ({ property }: { property: PropertyProps }) => {
  const [submitted, setSubmitted] = useState(false);
  const { authUser, authLoading } = useGetAuthUser();
  const [courseList, setCourseList] = useState<{ course_name: string }[]>([]);

  const getCourseList = useCallback(async () => {
    try {
      const response = await API.get(`/property-course/names/${property?._id}`);
      setCourseList(response?.data);
    } catch (error) {
      getErrorResponse(error);
    }
  }, [property?._id]);

  useEffect(() => {
    getCourseList();
  }, [getCourseList]);

  const formik = useFormik({
    initialValues: {
      userId: authUser?._id || "",
      property_id: property?._id || "",
      property_name: property?.property_name || "",
      name: authUser?.name || "",
      email: authUser?.email || "",
      contact: authUser?.mobile_no || "",
      city: authUser?.city || "",
      preferred_course: "",
      message: "",
    },
    validationSchema: enquirySchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await API.post(`/add/enquiry`, values);
        getSuccessResponse(response);
        setSubmitted(true);
        resetForm();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const courseOptions =
    (courseList?.length || 0) > 0
      ? getFieldDataSimple(courseList, "course_name")
      : [];
  const finalCourseOptions = [...courseOptions, "Other"];

  if (submitted) return <EnquirySubmitted setSubmitted={setSubmitted} />;
  if (authLoading) return <EnquiryFormSkeleton />;

  return (
    <div
      id="enquiry"
      className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom p-5"
    >
      <HeadingLine title="Enquiry Form" />

      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="w-full">
            <InputGroup
              label="Enter Your Name"
              id="name"
              placeholder="Enter your full name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "name")}
          </div>

          {/* Email */}
          <div className="w-full">
            <InputGroup
              label="Email"
              type="email"
              id="email"
              placeholder="you@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "email")}
          </div>

          {/* Phone */}
          <div className="w-full">
            <label className="text-xs mb-1 block">Phone</label>
            <div className="w-full">
              <PhoneInput
                country="in"
                value={formik.values.contact}
                onChange={(value) => formik.setFieldValue("contact", value)}
                onBlur={() => formik.setFieldTouched("contact", true)}
                inputClass={`${phoneInputClass.input} w-full`}
                buttonClass={phoneInputClass.button}
                dropdownClass={phoneInputClass.dropdown}
              />
            </div>
            {getFormikError(formik, "contact")}
          </div>

          <div className="w-full">
            <InputGroup
              label="Your City"
              id="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "city")}
          </div>

          {/* Course */}
          {(courseList?.length || 0) > 0 && (
            <div className="w-full">
              <SelectGroup
                label="Preferred Course"
                id="preferred_course"
                options={finalCourseOptions}
                value={formik.values.preferred_course}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Select Course"
              />
              {getFormikError(formik, "preferred_course")}
            </div>
          )}

          {/* Message */}
          <div className="md:col-span-2 w-full">
            <TextareaGroup
              label="Message"
              id="message"
              value={formik.values.message}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your message"
            />
            {getFormikError(formik, "message")}
          </div>

          {/* Submit */}
          <div className="md:col-span-2 w-full">
            <ButtonGroupSend
              label="Send Enquiry"
              type="submit"
              className="w-full"
              disable={formik.isSubmitting}
              isSubmitting={formik.isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnquiryForm;
