"use client";

import { phoneInputClass } from "@/common/ExtraData";
import { UserProps } from "@/types/UserTypes";
import { InputGroup } from "@/ui/form/FormComponents";
import PhoneInput from "react-phone-input-2";
import ProfileImage from "./_profile_components/ProfileImage";
import { useFormik } from "formik";
import API from "@/context/API";
import { useState } from "react";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import ButtonGroupSend from "@/ui/buttons/ButtonGroup";
import { BiSave } from "react-icons/bi";
import { userEditValidation } from "@/context/ValidationSchema";
import SettingsHeader from "../SettingHeader";

const ProfileTab = ({ profile }: { profile: UserProps | null }) => {
  const [resLoading, setResLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: profile?.username || "",
      name: profile?.name || "",
      alt_mobile_no: profile?.alt_mobile_no || "",
    },
    enableReinitialize: true,
    validationSchema: userEditValidation,
    onSubmit: async (values) => {
      setResLoading(true);
      try {
        const response = await API.patch(
          `/profile/user/${profile?._id}`,
          values
        );
        getSuccessResponse(response);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setResLoading(false);
      }
    },
  });

  return (
    <div className="sm:space-y-12 space-y-6">
      <section className="text-(--text-color)">
        <div className="flex flex-col justify-between items-start">
          <div>
            <SettingsHeader label="Profile" text="Set your account details" />
          </div>

          <div className="flex justify-between w-full">
            <div className="my-6">
              <ProfileImage profile={profile} />
            </div>
            {/* Form Inputs */}
            <form
              onSubmit={formik.handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full sm:max-w-xl mx-auto p-1 sm:p-0"
            >
              <div>
                <InputGroup
                  label="Username"
                  type="text"
                  id="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  placeholder="Enter Your Username"
                />
                {getFormikError(formik, "username")}
              </div>

              <div>
                <InputGroup
                  label="Name"
                  type="text"
                  id="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  placeholder="Enter Your Name"
                />
                {getFormikError(formik, "name")}
              </div>

              <div className="md:col-span-2">
                <InputGroup
                  label="Email"
                  type="email"
                  id="email"
                  value={profile?.email}
                  onChange={formik.handleChange}
                  placeholder="Enter your email"
                  disable={true}
                />
                {/* {getFormikError(formik, "email")} */}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs text-(--text-color) mb-1">
                  Mobile Number
                </label>
                <PhoneInput
                  country={"in"}
                  value={profile?.mobile_no}
                  onChange={(val) => formik.setFieldValue("mobile_no", val)}
                  countryCodeEditable={false}
                  enableSearch={true}
                  inputClass={phoneInputClass?.input}
                  buttonClass={phoneInputClass?.button}
                  dropdownClass={phoneInputClass?.dropdown}
                  disabled={true}
                />
                {/* {getFormikError(formik, "mobile_no")} */}
              </div>

              {/* Alternate Mobile Number */}
              <div>
                <label className="block text-xs text-(--text-color) mb-1">
                  Alternate Mobile Number
                </label>
                <PhoneInput
                  country={"in"}
                  value={formik.values.alt_mobile_no}
                  onChange={(val) => formik.setFieldValue("alt_mobile_no", val)}
                  countryCodeEditable={false}
                  enableSearch={true}
                  inputClass={phoneInputClass?.input}
                  buttonClass={phoneInputClass?.button}
                  dropdownClass={phoneInputClass?.dropdown}
                />
                {getFormikError(formik, "alt_mobile_no")}
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
        </div>
      </section>
    </div>
  );
};

export default ProfileTab;
