"use client";
import { UserProps } from "@/types/UserTypes";
import { InputGroup, SelectGroup } from "@/ui/form/FormComponents";
import { useFormik } from "formik";
import API from "@/context/API";
import { useCallback, useEffect, useState } from "react";
import {
  getErrorResponse,
  getFieldDataSimple,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import ButtonGroupSend from "@/ui/buttons/ButtonGroup";
import { BiSave } from "react-icons/bi";
import { userLocationEditValidation } from "@/context/ValidationSchema";
import { CityProps, CountryProps, StateProps } from "@/types/Types";
import SettingsHeader from "../SettingHeader";

const LocationTab = ({ profile }: { profile: UserProps | null }) => {
  const [country, setCountry] = useState<CountryProps[]>([]);
  const [states, setStates] = useState<StateProps[]>([]);
  const [cities, setCities] = useState<CityProps[]>([]);
  const [filteredStates, setFilteredStates] = useState<StateProps[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityProps[]>([]);
  const [resLoading, setResLoading] = useState(false);

  const getCountries = useCallback(async () => {
    try {
      const response = await API.get("/countries");
      setCountry(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  const getStates = useCallback(async () => {
    try {
      const response = await API.get("/states");
      setStates(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  const getCities = useCallback(async () => {
    try {
      const response = await API.get(`/cities`);
      setCities(response.data);
    } catch (error) {
      getErrorResponse(error, true);
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
      userId: profile?.uniqueId,
      address: profile?.address || "",
      pincode: profile?.pincode || "",
      city: profile?.city || "",
      state: profile?.state || "",
      country: profile?.country || "",
    },
    enableReinitialize: true,
    validationSchema: userLocationEditValidation,
    onSubmit: async (values) => {
      setResLoading(true);
      try {
        const response = await API.patch(`/profile/location`, values);
        getSuccessResponse(response);
      } catch (error) {
        getErrorResponse(error);
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

  return (
    <div className="sm:space-y-12 space-y-6">
      <section className="text-(--text-color)">
        <div className="flex flex-col justify-between items-start">
          <div>
            <SettingsHeader label="Location" text="Set your account details" />
          </div>
          <form
            onSubmit={formik.handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full sm:max-w-xl p-1 sm:p-0"
          >
            <div>
              <InputGroup
                label="Address"
                type="text"
                id="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                placeholder="Enter Your Address"
              />
              {getFormikError(formik, "address")}
            </div>

            <div>
              <InputGroup
                label="Pincode"
                type="text"
                id="pincode"
                value={formik.values.pincode}
                onChange={formik.handleChange}
                placeholder="Enter Your Pincode"
              />
              {getFormikError(formik, "pincode")}
            </div>

            <div className="md:col-span-2">
              <SelectGroup
                label="Country"
                id="country"
                options={getFieldDataSimple(country, "country_name")}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.country}
                placeholder="Select Your Country"
              />
              {getFormikError(formik, "country")}
            </div>

            {/* Mobile Number */}
            <div>
              <SelectGroup
                label="State"
                id="state"
                options={getFieldDataSimple(filteredStates, "name")}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.state}
                placeholder="Select Your State"
              />
              {getFormikError(formik, "state")}
            </div>

            {/* Alternate Mobile Number */}
            <div>
              <SelectGroup
                label="City"
                id="city"
                options={getFieldDataSimple(filteredCities, "name")}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.city}
                placeholder="Select Your City"
              />
              {getFormikError(formik, "city")}
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
    </div>
  );
};

export default LocationTab;
