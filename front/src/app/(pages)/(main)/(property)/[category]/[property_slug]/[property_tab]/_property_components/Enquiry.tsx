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
import { phoneInputClass } from "@/common/ExtraData";
import HeadingLine from "@/ui/headings/HeadingLine";
import EnquirySubmitted from "@/ui/submits/EnquirySubmitted";
import { UserProps } from "@/types/UserTypes";
import { getProfile } from "@/context/getAssets";
import EnquiryFormSkeleton from "@/ui/loader/ui/EnquiryFormSkeleton";

const EnquiryForm = ({ property }: { property: PropertyProps }) => {
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfileUser = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  const formik = useFormik({
    initialValues: {
      userId: profile?._id || "",
      property_id: property?.uniqueId || "",
      property_name: property?.property_name || "",
      name: profile?.name || "",
      email: profile?.email || "",
      contact: profile?.mobile_no || "",
      people: "1",
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      city: profile?.city || "",
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
    getFieldDataSimple(property?.courses, "course_name") ?? [];
  const finalCourseOptions = [...courseOptions, "Other"];

  if (submitted) return <EnquirySubmitted setSubmitted={setSubmitted} />;
  if (loading) return <EnquiryFormSkeleton />;

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
                onChange={(value) =>
                  formik.setFieldValue("contact", value)
                }
                onBlur={() =>
                  formik.setFieldTouched("contact", true)
                }
                inputClass={`${phoneInputClass.input} w-full`}
                buttonClass={phoneInputClass.button}
                dropdownClass={phoneInputClass.dropdown}
              />
            </div>
            {getFormikError(formik, "contact")}
          </div>

          {/* People */}
          <div className="w-full">
            <InputGroup
              label="Number of People"
              type="number"
              id="people"
              value={formik.values.people}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "people")}
          </div>

          {/* Date */}
          <div className="w-full">
            <InputGroup
              label="Arrival Date"
              type="date"
              id="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "date")}
          </div>

          {/* City */}
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
          {property?.courses?.length > 0 && (
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
