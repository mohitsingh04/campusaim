import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { useParams } from "react-router-dom";
import {
  CityProps,
  CountryProps,
  EventsProps,
  StateProps,
} from "../../../../types/types";

export default function EventLocationEditModal({
  isOpen,
  onClose,
  data,
  countries,
  states,
  cities,
  onSave,
}: {
  isOpen: boolean;
  onClose: any;
  data: EventsProps;
  countries: CountryProps[];
  states: StateProps[];
  cities: CityProps[];
  onSave: () => void;
}) {
  const { objectId } = useParams();

  const [filteredStates, setFilteredStates] = useState<StateProps[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityProps[]>([]);

  // Selected country & state for filtering
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  // Load default selected values
  useEffect(() => {
    if (data?.event_country) {
      setSelectedCountry(data.event_country);
    }
    if (data?.event_state) {
      setSelectedState(data.event_state);
    }
  }, [data]);

  // Filter states when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setFilteredStates([]);
      return;
    }

    const result = states.filter((s) => s.country_name === selectedCountry);

    setFilteredStates(result);
  }, [selectedCountry, states]);

  // Filter cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setFilteredCities([]);
      return;
    }

    const result = cities.filter((c) => c.state_name === selectedState);

    setFilteredCities(result);
  }, [selectedState, cities]);

  // Formik
  const formik = useFormik({
    initialValues: {
      event_address: data?.event_address || "",
      event_pincode: data?.event_pincode || "",
      event_country: data?.event_country || "",
      event_state: data?.event_state || "",
      event_city: data?.event_city || "",
    },

    validationSchema: Yup.object({
      event_address: Yup.string().required("Address is required"),
      event_pincode: Yup.string().required("Pincode is required"),
      event_country: Yup.string().required("Country is required"),
      event_state: Yup.string().required("State is required"),
      event_city: Yup.string().required("City is required"),
    }),

    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);

      try {
        const formData = new FormData();
        formData.append("event_address", values.event_address || "");
        formData.append("event_pincode", values.event_pincode || "");
        formData.append("event_country", values.event_country || "");
        formData.append("event_state", values.event_state || "");
        formData.append("event_city", values.event_city || "");

        const response = await API.patch(`/event/${objectId}`, formData);

        toast.success(response.data.message || "Event updated successfully!");
        onSave();
        onClose();
      } catch (err) {
        getErrorResponse(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[var(--yp-primary)] rounded-xl shadow-lg p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--yp-text-secondary)]"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-[var(--yp-text-primary)] mb-4">
          Edit Location Details
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Address */}
          <div>
            <label className="block mb-2 text-sm text-[var(--yp-text-secondary)]">
              Event Address
            </label>
            <input
              type="text"
              name="event_address"
              value={formik.values.event_address}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-[var(--yp-input-primary)]
                        text-[var(--yp-text-primary)] border-[var(--yp-border-primary)]"
            />
            {getFormikError(formik, "event_address")}
          </div>

          {/* Pincode */}
          <div>
            <label className="block mb-2 text-sm text-[var(--yp-text-secondary)]">
              Pincode
            </label>
            <input
              type="text"
              name="event_pincode"
              value={formik.values.event_pincode}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-[var(--yp-input-primary)]
                        text-[var(--yp-text-primary)] border-[var(--yp-border-primary)]"
            />
            {getFormikError(formik, "event_pincode")}
          </div>

          {/* Country */}
          <div>
            <label className="block mb-2 text-sm text-[var(--yp-text-secondary)]">
              Country
            </label>

            <select
              name="event_country"
              value={formik.values.event_country}
              onChange={(e) => {
                const v = e.target.value;
                formik.setFieldValue("event_country", v);
                setSelectedCountry(v);
                setSelectedState("");

                // reset dependent fields
                formik.setFieldValue("event_state", "");
                formik.setFieldValue("event_city", "");
              }}
              className="w-full px-3 py-2 border rounded-lg bg-[var(--yp-input-primary)]
                        text-[var(--yp-text-primary)] border-[var(--yp-border-primary)]"
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
            <label className="block mb-2 text-sm text-[var(--yp-text-secondary)]">
              State
            </label>

            <select
              name="event_state"
              value={formik.values.event_state}
              disabled={!formik.values.event_country}
              onChange={(e) => {
                const v = e.target.value;
                formik.setFieldValue("event_state", v);
                setSelectedState(v);
                formik.setFieldValue("event_city", "");
              }}
              className="w-full px-3 py-2 border rounded-lg bg-[var(--yp-input-primary)]
                        text-[var(--yp-text-primary)] border-[var(--yp-border-primary)]"
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
            <label className="block mb-2 text-sm text-[var(--yp-text-secondary)]">
              City
            </label>

            <select
              name="event_city"
              value={formik.values.event_city}
              disabled={!formik.values.event_state}
              onChange={(e) =>
                formik.setFieldValue("event_city", e.target.value)
              }
              className="w-full px-3 py-2 border rounded-lg bg-[var(--yp-input-primary)]
                        text-[var(--yp-text-primary)] border-[var(--yp-border-primary)]"
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

          {/* Buttons */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[var(--yp-red-bg)]
                         text-[var(--yp-red-text)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[var(--yp-blue-bg)]
                         text-[var(--yp-blue-text)]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
