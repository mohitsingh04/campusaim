import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";

import EventBasicDetails from "./event_components/EventBasicDetails";
import EventLocation from "./event_components/EventLocation";
import EventSchedule from "./event_components/EventSchedule";
import EventPartnerAndHost from "./event_components/EventPartnerAndHost";
import EventDescription from "./event_components/EventDescription";
import EventOtherDetails from "./event_components/EventOtherDetails";

import { getErrorResponse } from "../../contexts/Callbacks";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { CityProps, CountryProps, StateProps } from "../../types/types";

export default function EventCreate() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [countries, setCountries] = useState<CountryProps[]>([]);
  const [states, setStates] = useState<StateProps[]>([]);
  const [cities, setCities] = useState<CityProps[]>([]);

  const getLocations = useCallback(async () => {
    try {
      const [cityRes, stateRes, countryRes] = await Promise.allSettled([
        API.get("/cities"),
        API.get("/states"),
        API.get("/countries"),
      ]);

      if (cityRes.status === "fulfilled") setCities(cityRes.value.data);
      if (stateRes.status === "fulfilled") setStates(stateRes.value.data);
      if (countryRes.status === "fulfilled")
        setCountries(countryRes.value.data);
    } catch (error) {
      getErrorResponse(error);
    }
  }, []);

  useEffect(() => {
    getLocations();
  }, [getLocations]);

  const goNext = (values: any) => {
    setFormData((prev: any) => ({ ...prev, ...values }));
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);

      const fd = new FormData();

      fd.append("title", formData.title || "");
      fd.append("description", formData.description || "");
      fd.append("event_website", formData.event_website || "");
      fd.append("event_host_url", formData.event_host_url || "");
      fd.append("isonline", formData.isonline || "");
      fd.append("schedule", JSON.stringify(formData.schedule || []));
      fd.append("language", JSON.stringify(formData.language || []));
      fd.append("event_address", formData.event_address || "");
      fd.append("event_pincode", formData.event_pincode || "");
      fd.append("event_country", formData.event_country || "");
      fd.append("event_state", formData.event_state || "");
      fd.append("event_city", formData.event_city || "");
      fd.append("entrance_type", formData.entrance_type || "");
      fd.append("price", JSON.stringify(formData.price || {}));

      const finalCategory = (formData.category || []).map((c: any) => c.value);
      fd.append("category", JSON.stringify(finalCategory));

      fd.append("host_name", formData.host_name || "");
      if (formData.host_image) fd.append("host_image", formData.host_image);

      (formData.event_partners || []).forEach((p: any, idx: number) => {
        fd.append(`partner_name_${idx}`, p.name || "");
        if (p.logo) fd.append("partner_logos", p.logo);
      });

      fd.append(
        "ticket_booking",
        JSON.stringify({
          start: formData.ticket_booking_start || "",
          end: formData.ticket_booking_end || "",
        })
      );

      fd.append("age_limit", JSON.stringify(formData.age_limit) || "");

      if (formData.featured_image)
        fd.append("featured_image", formData.featured_image);

      const res = await API.post("/events", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Event created successfully!");
      navigate("/dashboard/events");
    } catch (err) {
      getErrorResponse(err, true);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Basic Details",
      component: <EventBasicDetails onNext={goNext} defaultData={formData} />,
    },
    {
      title: "Event Location",
      component: (
        <EventLocation
          onNext={goNext}
          onBack={goBack}
          defaultData={formData}
          countries={countries}
          states={states}
          cities={cities}
        />
      ),
    },
    {
      title: "Event Schedule",
      component: (
        <EventSchedule onNext={goNext} onBack={goBack} defaultData={formData} />
      ),
    },
    {
      title: "Partners & Host",
      component: (
        <EventPartnerAndHost
          onNext={goNext}
          onBack={goBack}
          defaultData={formData}
        />
      ),
    },
    {
      title: "Description",
      component: (
        <EventDescription
          onNext={goNext}
          onBack={goBack}
          defaultData={formData}
        />
      ),
    },
    {
      title: "Other Details",
      component: (
        <EventOtherDetails
          onNext={goNext}
          onBack={goBack}
          defaultData={formData}
          submitting={submitting}
          handleFinalSubmit={handleFinalSubmit}
        />
      ),
    },
  ];

  const getMobileSteps = () => {
    const prev = currentStep > 0 ? currentStep - 1 : null;
    const next = currentStep < steps.length - 1 ? currentStep + 1 : null;

    return [prev, currentStep, next].filter((i) => i !== null) as number[];
  };

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="hidden md:flex justify-between items-center relative">
        <div className="absolute top-5 left-0 w-full h-1 bg-[var(--yp-gray-bg)]" />

        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center w-full"
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all
                  ${
                    isActive
                      ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] scale-110"
                      : isCompleted
                      ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                      : "bg-[var(--yp-gray-bg)] text-[var(--yp-gray-text)]"
                  }
                `}
              >
                {index + 1}
              </div>

              <span
                className={`mt-3 text-xs font-medium text-center w-24
                  ${
                    isActive
                      ? "text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] rounded"
                      : isCompleted
                      ? "text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] rounded"
                      : "text-[var(--yp-gray-text)] bg-[var(--yp-gray-bg)] rounded"
                  }
                `}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="md:hidden flex justify-center gap-5 mt-5">
        {getMobileSteps().map((index) => {
          const step = steps[index];
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold
                  ${
                    isActive
                      ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] scale-110"
                      : isCompleted
                      ? "bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
                      : "bg-[var(--yp-gray-bg)] text-[var(--yp-gray-text)]"
                  }
                `}
              >
                {index + 1}
              </div>

              <span
                className={`text-[11px] mt-1 w-20 text-center
                  ${
                    isActive
                      ? "text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] rounded"
                      : isCompleted
                      ? "text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] rounded"
                      : "text-[var(--yp-gray-text)] bg-[var(--yp-gray-bg)] rounded"
                  }
                `}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <Breadcrumbs
        title="Create Event"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Events", path: "/dashboard/events" },
          { label: "Create" },
        ]}
      />

      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm p-6">
        <StepIndicator />
        <div>{steps[currentStep].component}</div>
      </div>
    </div>
  );
}
