import { useState } from "react";
import { useFormik } from "formik";
import { PropertyProps } from "../../../../types/types";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { getErrorResponse } from "../../../../contexts/Callbacks";

interface LocationFormProps {
  countries: { country_name: string }[];
  states: { name: string }[];
  cities: { name: string }[];
  setSelectedCountry: (val: string) => void;
  setSelectedState: (val: string) => void;
  onSubmit: () => void;
  property: PropertyProps | null;
}

export default function AddLocationForm({
  countries,
  states,
  cities,
  setSelectedCountry,
  setSelectedState,
  onSubmit,
  property,
}: LocationFormProps) {
  const [showOtherCountry, setShowOtherCountry] = useState(false);
  const [showOtherState, setShowOtherState] = useState(false);
  const [showOtherCity, setShowOtherCity] = useState(false);

  const formik = useFormik({
    initialValues: {
      property_address: "",
      property_pincode: "",
      property_country: "",
      property_state: "",
      property_city: "",
      property_id: property?._id || "",
      country_name: "",
      state_name: "",
      city_name: "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const submissionData = { ...values };
        if (values.country_name?.trim() !== "") {
          submissionData.property_country = "";
        }
        if (values.state_name?.trim() !== "") {
          submissionData.property_state = "";
        }
        if (values.city_name?.trim() !== "") {
          submissionData.property_city = "";
        }

        const response = await API.post("/location", submissionData);
        toast.success(response.data.message);

        onSubmit();
        setShowOtherCountry(false);
        setShowOtherState(false);
        setShowOtherCity(false);
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Property Address
          </label>
          <input
            type="text"
            name="property_address"
            value={formik.values.property_address}
            onChange={formik.handleChange}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Property Pincode
          </label>
          <input
            type="text"
            name="property_pincode"
            value={formik.values.property_pincode}
            onChange={formik.handleChange}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Country
          </label>
          <select
            name="property_country"
            value={formik.values.property_country}
            onChange={(e) => {
              const value = e.target.value;
              formik.setFieldValue("property_country", value);
              setSelectedCountry(value === "Other" ? "" : value);
              setShowOtherCountry(value === "Other");
            }}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          >
            <option value="">Select Country</option>
            {countries
              ?.sort((a, b) => a.country_name.localeCompare(b.country_name))
              .map((c, index) => (
                <option key={index} value={c.country_name}>
                  {c.country_name}
                </option>
              ))}
            <option value="Other">Other</option>
          </select>
          {showOtherCountry && (
            <input
              type="text"
              name="country_name"
              placeholder="Enter country name"
              value={formik.values.country_name}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            State
          </label>
          <select
            name="property_state"
            value={formik.values.property_state}
            onChange={(e) => {
              const value = e.target.value;
              formik.setFieldValue("property_state", value);
              setSelectedState(value === "Other" ? "" : value);
              setShowOtherState(value === "Other");
            }}
            disabled={
              !formik.values.property_country && !formik.values.country_name
            }
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          >
            <option value="">Select State</option>
            {states
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((s, index) => (
                <option key={index} value={s.name}>
                  {s.name}
                </option>
              ))}
            <option value="Other">Other</option>
          </select>
          {showOtherState && (
            <input
              type="text"
              name="state_name"
              placeholder="Enter state name"
              value={formik.values.state_name}
              onChange={formik.handleChange}
              className="mt-2 w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            City
          </label>
          <select
            name="property_city"
            value={formik.values.property_city}
            onChange={(e) => {
              const value = e.target.value;
              formik.setFieldValue("property_city", value);
              setShowOtherCity(value === "Other");
            }}
            disabled={
              !formik.values.property_state && !formik.values.state_name
            }
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          >
            <option value="">Select City</option>
            {cities
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((city, index) => (
                <option key={index} value={city.name}>
                  {city.name}
                </option>
              ))}
            <option value="Other">Other</option>
          </select>
          {showOtherCity && (
            <input
              type="text"
              name="city_name"
              placeholder="Enter city name"
              value={formik.values.city_name}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
          )}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Save Location
        </button>
      </div>
    </form>
  );
}
