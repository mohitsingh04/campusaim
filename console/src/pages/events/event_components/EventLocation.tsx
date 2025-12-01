import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CityProps, CountryProps, StateProps } from "../../../types/types";
import { getFormikError } from "../../../contexts/Callbacks";
import ToggleButton from "../../../ui/button/ToggleButton";

interface StepLocationProps {
  onNext: (values: any) => void;
  defaultData: any;
  onBack: () => void;
  countries: CountryProps[];
  states: StateProps[];
  cities: CityProps[];
}

export default function EventLocation({
  onNext,
  defaultData,
  onBack,
  countries,
  states,
  cities,
}: StepLocationProps) {
  const [filteredStates, setFilteredStates] = useState<StateProps[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityProps[]>([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    if (defaultData?.event_country)
      setSelectedCountry(defaultData.event_country);
    if (defaultData?.event_state) setSelectedState(defaultData.event_state);
  }, [defaultData]);

  useEffect(() => {
    if (!selectedCountry) {
      setFilteredStates([]);
      return;
    }
    const result = states.filter((s) => s.country_name === selectedCountry);
    setFilteredStates(result);
  }, [selectedCountry, states]);

  useEffect(() => {
    if (!selectedState) {
      setFilteredCities([]);
      return;
    }
    const result = cities.filter((c) => c.state_name === selectedState);
    setFilteredCities(result);
  }, [selectedState, cities]);

  const formik = useFormik({
    initialValues: {
      isonline: defaultData?.isonline || false,
      event_host_url: defaultData?.event_host_url || "",
      event_address: defaultData?.event_address || "",
      event_pincode: defaultData?.event_pincode || "",
      event_country: defaultData?.event_country || "",
      event_state: defaultData?.event_state || "",
      event_city: defaultData?.event_city || "",
    },

    validationSchema: Yup.object({
      isonline: Yup.boolean(),

      event_host_url: Yup.string().when("isonline", {
        is: true,
        then: (schema) =>
          schema.required("Host URL is required").url("Invalid URL"),
        otherwise: (schema) => schema.notRequired(),
      }),

      event_address: Yup.string().when("isonline", {
        is: false,
        then: (schema) => schema.required("Address is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      event_pincode: Yup.string().when("isonline", {
        is: false,
        then: (schema) => schema.required("Pincode is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      event_country: Yup.string().when("isonline", {
        is: false,
        then: (schema) => schema.required("Country is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      event_state: Yup.string().when("isonline", {
        is: false,
        then: (schema) => schema.required("State is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      event_city: Yup.string().when("isonline", {
        is: false,
        then: (schema) => schema.required("City is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),

    onSubmit: (values) => {
      onNext(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* ONLINE TOGGLE BUTTON */}
      <div>
        <ToggleButton
          label="Online Event"
          enabled={formik.values.isonline}
          onToggle={() => {
            const newVal = !formik.values.isonline;
            formik.setFieldValue("isonline", newVal);

            if (newVal) {
              // Clear physical location fields if switched to ONLINE
              formik.setFieldValue("event_address", "");
              formik.setFieldValue("event_pincode", "");
              formik.setFieldValue("event_country", "");
              formik.setFieldValue("event_state", "");
              formik.setFieldValue("event_city", "");

              setSelectedCountry("");
              setSelectedState("");
            }
          }}
        />
      </div>

      {/* HOST URL when ONLINE */}
      {formik.values.isonline && (
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Event Host URL
          </label>
          <input
            type="url"
            name="event_host_url"
            value={formik.values.event_host_url}
            onChange={formik.handleChange}
            placeholder="https://zoom.com/xyz"
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
                       rounded-lg bg-[var(--yp-input-primary)]
                       text-[var(--yp-text-primary)]"
          />
          {getFormikError(formik, "event_host_url")}
        </div>
      )}

      {/* PHYSICAL LOCATION when OFFLINE */}
      {!formik.values.isonline && (
        <>
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Event Address
            </label>
            <input
              type="text"
              name="event_address"
              value={formik.values.event_address}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
                         rounded-lg bg-[var(--yp-input-primary)]
                         text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "event_address")}
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Pincode
            </label>
            <input
              type="text"
              name="event_pincode"
              value={formik.values.event_pincode}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
                         rounded-lg bg-[var(--yp-input-primary)]
                         text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "event_pincode")}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Country
            </label>
            <select
              name="event_country"
              value={formik.values.event_country}
              onChange={(e) => {
                const value = e.target.value;
                formik.setFieldValue("event_country", value);
                setSelectedCountry(value);

                formik.setFieldValue("event_state", "");
                formik.setFieldValue("event_city", "");
                setSelectedState("");
              }}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
                         rounded-lg bg-[var(--yp-input-primary)]
                         text-[var(--yp-text-primary)]"
            >
              <option value="">Select Country</option>
              {countries
                .sort((a, b) => a.country_name.localeCompare(b.country_name))
                .map((c, idx) => (
                  <option key={idx} value={c.country_name}>
                    {c.country_name}
                  </option>
                ))}
            </select>
            {getFormikError(formik, "event_country")}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              State
            </label>
            <select
              name="event_state"
              value={formik.values.event_state}
              onChange={(e) => {
                const value = e.target.value;
                formik.setFieldValue("event_state", value);
                setSelectedState(value);
                formik.setFieldValue("event_city", "");
              }}
              disabled={!formik.values.event_country}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
                         rounded-lg bg-[var(--yp-input-primary)]
                         text-[var(--yp-text-primary)]"
            >
              <option value="">Select State</option>
              {filteredStates
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((s, idx) => (
                  <option key={idx} value={s.name}>
                    {s.name}
                  </option>
                ))}
            </select>
            {getFormikError(formik, "event_state")}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              City
            </label>
            <select
              name="event_city"
              value={formik.values.event_city}
              onChange={(e) =>
                formik.setFieldValue("event_city", e.target.value)
              }
              disabled={!formik.values.event_state}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
                         rounded-lg bg-[var(--yp-input-primary)]
                         text-[var(--yp-text-primary)]"
            >
              <option value="">Select City</option>
              {filteredCities
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c, idx) => (
                  <option key={idx} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
            {getFormikError(formik, "event_city")}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-sm font-medium
                     text-[var(--yp-gray-text)] bg-[var(--yp-gray-bg)]"
        >
          Back
        </button>

        <button
          type="submit"
          className="px-6 py-2 rounded-lg text-sm font-medium
                     text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Next
        </button>
      </div>
    </form>
  );
}
