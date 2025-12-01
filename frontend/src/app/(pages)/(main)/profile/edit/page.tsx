"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { LuMail, LuUser, LuMapPin, LuCircleUser } from "react-icons/lu";
import Link from "next/link";
import { CityProps, CountryProps, StateProps, UserProps } from "@/types/types";
import API from "@/contexts/API";
import { getProfile } from "@/contexts/getAssets";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { EditProfileValidation } from "@/contexts/ValidationSchema";
import ProfileEditLoader from "@/components/Loader/Profile/ProfileEditLoader";

const EditProfileForm = () => {
  const [country, setCountry] = useState<CountryProps[]>([]);
  const [states, setStates] = useState<StateProps[]>([]);
  const [cities, setCities] = useState<CityProps[]>([]);
  const [filteredStates, setFilteredStates] = useState<StateProps[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityProps[]>([]);
  const [profile, setProfile] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [resLoading, setResLoading] = useState(false);
  const router = useRouter();

  const getProfileUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  const getCountries = useCallback(async () => {
    try {
      const response = await API.get("/countries");
      setCountry(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getStates = useCallback(async () => {
    try {
      const response = await API.get("/states");
      setStates(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getCities = useCallback(async () => {
    try {
      const response = await API.get(`/cities`);
      setCities(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getCities();
  }, [getCities]);

  useEffect(() => {
    getStates();
  }, [getStates]);

  useEffect(() => {
    getCountries();
  }, [getCountries]);

  const formik = useFormik({
    initialValues: {
      username: profile?.username || "",
      name: profile?.name || "",
      email: profile?.email || "",
      mobile_no: profile?.mobile_no || "",
      alt_mobile_no: profile?.alt_mobile_no || "",
      address: profile?.address || "",
      pincode: profile?.pincode || "",
      country: profile?.country || "",
      state: profile?.state || "",
      city: profile?.city || "",
    },
    enableReinitialize: true,
    validationSchema: EditProfileValidation,
    onSubmit: async (values) => {
      setResLoading(true);
      const userPayload = {
        username: values.username,
        name: values.name,
        email: values.email,
        mobile_no: values.mobile_no,
        alt_mobile_no: values.alt_mobile_no,
      };
      const locationPayload = {
        userId: profile?.uniqueId,
        address: values.address,
        pincode: values.pincode,
        state: values?.state,
        city: values.city,
        country: values.country,
      };

      try {
        const [userRes, locRes] = await Promise.all([
          API.patch(`/profile/user/${profile?._id}`, userPayload),
          API.patch(`/profile/location`, locationPayload),
        ]);
        if (userRes && locRes) {
          toast.success(userRes.data.message);
          router.push(`/profile`);
        }
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        toast.error(
          err.response?.data.error || "Something went wrong. Please try again."
        );
      } finally {
        setResLoading(false);
      }
    },
  });

  useEffect(() => {
    setFilteredStates(
      states.filter((item) => item.country_name === formik.values.country)
    );
  }, [states, formik.values.country]);

  useEffect(() => {
    setFilteredCities(
      cities.filter((item) => item.state_name === formik.values.state)
    );
  }, [cities, formik.values.state]);

  if (loading) {
    return <ProfileEditLoader />;
  }

  const renderInput = (
    name: keyof typeof formik.initialValues,
    type: string,
    icon: React.ReactNode,
    placeholder = ""
  ) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1 capitalize"
      >
        {name.replace(/_/g, " ")}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          id={name}
          name={name}
          type={type}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          placeholder={placeholder || name}
          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 border-gray-300`}
        />
      </div>
      {formik.touched[name] && formik.errors[name] && (
        <p className="text-red-500 text-sm mt-1">{formik.errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {renderInput(
              "username",
              "text",
              <LuCircleUser className="w-4 h-4" />
            )}
            {renderInput("name", "text", <LuUser className="w-4 h-4" />)}
            {renderInput("email", "email", <LuMail className="w-4 h-4" />)}

            {/* Mobile No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile No
              </label>
              <PhoneInput
                country={"in"}
                value={formik.values.mobile_no}
                onChange={(value) => formik.setFieldValue("mobile_no", value)}
                onBlur={() => formik.setFieldTouched("mobile_no", true)}
                inputClass={`!w-full !pl-14 !pr-4 !py-6 !rounded-lg !text-base !border transition-all duration-300 outline-none`}
                buttonClass="!border-r !border-gray-300 !bg-white !rounded-l-lg"
                containerClass="relative w-full"
              />
              {formik.touched.mobile_no && formik.errors.mobile_no && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.mobile_no}
                </p>
              )}
            </div>

            {/* Alt Mobile No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt. Mobile No
              </label>
              <PhoneInput
                country={"in"}
                value={formik.values.alt_mobile_no}
                onChange={(value) =>
                  formik.setFieldValue("alt_mobile_no", value)
                }
                onBlur={() => formik.setFieldTouched("alt_mobile_no", true)}
                inputClass={`!w-full !pl-14 !pr-4 !py-6 !rounded-lg !text-base !border transition-all duration-300 outline-none`}
                buttonClass="!border-r !border-gray-300 !bg-white !rounded-l-lg"
                containerClass="relative w-full"
              />
              {formik.touched.alt_mobile_no && formik.errors.alt_mobile_no && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.alt_mobile_no}
                </p>
              )}
            </div>

            {/* Address & Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput("address", "text", <LuMapPin className="w-4 h-4" />)}
              {renderInput("pincode", "text", <LuMapPin className="w-4 h-4" />)}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 appearance-none border-gray-300 rounded-xl border outline-none bg-white transition-all duration-200`}
              >
                <option value="">-- Select Country --</option>
                {country?.map((item, index) => (
                  <option value={item.country_name} key={index}>
                    {item.country_name}
                  </option>
                ))}
              </select>
              {formik.touched.country && formik.errors.country && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.country}
                </p>
              )}
            </div>

            {/* State & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 border-gray-300 appearance-none rounded-xl border outline-none bg-white transition-all duration-200`}
                >
                  <option value="">-- Select State --</option>
                  {filteredStates?.map((item, index) => (
                    <option key={index} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {formik.touched.state && formik.errors.state && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.state}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 border-gray-300 rounded-xl border appearance-none outline-none bg-white transition-all duration-200`}
                >
                  <option value="">-- Select City --</option>
                  {filteredCities?.map((item, index) => (
                    <option key={index} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {formik.touched.city && formik.errors.city && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.city}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-35"
                disabled={resLoading}
              >
                Save
              </button>
              <Link
                href="/profile"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
