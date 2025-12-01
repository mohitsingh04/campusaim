import { useCallback, useEffect, useState } from "react";
import { Calendar, Pencil } from "lucide-react";
import { API } from "../../contexts/API";
import { useOutletContext, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import Badge from "../../ui/badge/Badge";
import {
  formatDateWithoutTime,
  getErrorResponse,
  getStatusColor,
  to12Hour,
} from "../../contexts/Callbacks";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";
import {
  CategoryProps,
  CityProps,
  CountryProps,
  DashboardOutletContextProps,
  EventsProps,
  StateProps,
} from "../../types/types";
import EventBasicDetailsEditModal from "./event_components/edit_modals/EventBasicDetailsEdit";
import EventLocationEditModal from "./event_components/edit_modals/EventLocationEdit";
import EventScheduleEditModal from "./event_components/edit_modals/EventScheduleEdit";
import EventDescriptionEditModal from "./event_components/edit_modals/EventDescriptionEdit";
import EventOtherDetailsEditModal from "./event_components/edit_modals/EventOtherEdit";
import EventFeaturedImageEditModal from "./event_components/edit_modals/EventFeaturedImageEdit";
import EventPartnerAndHostEditModal from "./event_components/edit_modals/EventHostEdit";
import EventPartnersEditModal from "./event_components/edit_modals/EventPartnerEdit";

export default function EventView() {
  const [event, setEvent] = useState<EventsProps | null>(null);
  const { objectId } = useParams();
  const [loading, setLoading] = useState(true);
  const { categories } = useOutletContext<DashboardOutletContextProps>();

  const [isBasicEdit, setIsBasicEdit] = useState(false);
  const [isLocEdit, setIsLocEdit] = useState(false);
  const [isSchEdit, setIsSchEdit] = useState(false);
  const [isDesEdit, setIsDesEdit] = useState(false);
  const [otherEdit, setOtherEdit] = useState(false);
  const [isImageEdit, setIsImageEdit] = useState(false);
  const [isHostEdit, setIsHostEdit] = useState(false);
  const [isPartnerEdit, setIsPartnerEdit] = useState(false);

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

  const getEvent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/event/${objectId}`);
      const data = response.data;

      const finalData = {
        ...data,
        categoryId: data?.category,
        category: data?.category.map((item: CategoryProps) => {
          const found = categories?.find(
            (cat) => String(cat?._id) === String(item)
          );
          return found?.category_name;
        }),
      };

      setEvent(finalData);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [objectId, categories]);

  useEffect(() => {
    getEvent();
  }, [getEvent]);

  if (loading) return <ViewSkeleton />;
  if (!event)
    return <p className="text-center text-gray-500">No event found.</p>;

  return (
    <div>
      <Breadcrumbs
        title="Event Details"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Events", path: `/dashboard/events` },
          { label: event?.title || "" },
        ]}
      />

      <EventBasicDetailsEditModal
        isOpen={isBasicEdit}
        onClose={() => setIsBasicEdit(false)}
        data={event}
        onSave={getEvent}
      />
      <EventLocationEditModal
        isOpen={isLocEdit}
        onClose={() => setIsLocEdit(false)}
        countries={countries}
        states={states}
        cities={cities}
        onSave={getEvent}
        data={event}
      />
      <EventScheduleEditModal
        isOpen={isSchEdit}
        onClose={() => setIsSchEdit(false)}
        data={event}
        onSave={getEvent}
      />
      <EventDescriptionEditModal
        isOpen={isDesEdit}
        onClose={() => setIsDesEdit(false)}
        data={event}
        onSave={getEvent}
      />
      <EventOtherDetailsEditModal
        isOpen={otherEdit}
        onClose={() => setOtherEdit(false)}
        data={event}
        onSave={getEvent}
      />
      <EventFeaturedImageEditModal
        isOpen={isImageEdit}
        onClose={() => setIsImageEdit(false)}
        data={event}
        onSave={getEvent}
      />
      <EventPartnerAndHostEditModal
        isOpen={isHostEdit}
        onClose={() => setIsHostEdit(false)}
        data={event}
        onSave={getEvent}
      />
      <EventPartnersEditModal
        isOpen={isPartnerEdit}
        onClose={() => setIsPartnerEdit(false)}
        data={event}
        onSave={getEvent}
      />

      <main className="rounded-2xl bg-[var(--yp-primary)] shadow-sm overflow-hidden">
        {/* Hero Section */}
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden">
          <img
            src={
              event?.featured_image?.[0]
                ? `${import.meta.env.VITE_MEDIA_URL}/events/${
                    event.featured_image[0]
                  }`
                : "/img/default-images/yp-event.webp"
            }
            className="w-full h-full object-cover"
            alt={event?.title}
          />

          <button
            onClick={() => setIsImageEdit(true)}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 p-2 rounded-full z-10"
          >
            <Pencil className="text-[var(--yp-text-primary)]" size={18} />
          </button>

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
            <h2 className="text-3xl font-bold">{event?.title}</h2>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-10">
          <EditableSection
            title="Basic Details"
            onEdit={() => setIsBasicEdit(true)}
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Entrance Type" value={event.entrance_type} />
              {event.price && (
                <InfoCard
                  label="Price"
                  value={
                    <div>
                      {event.price?.INR && <p>₹{event.price?.INR}</p>}
                      {event.price?.USD && <p>${event.price?.USD}</p>}
                      {event.price?.EUR && <p>€{event.price?.EUR}</p>}
                    </div>
                  }
                />
              )}

              {event?.language?.length > 0 && (
                <InfoCard label="Languages" value={event.language.join(", ")} />
              )}

              {event?.category?.length > 0 && (
                <InfoCard
                  label="Categories"
                  value={event.category.join(", ")}
                />
              )}

              {event?.status && (
                <InfoCard
                  label="Status"
                  value={
                    <Badge
                      label={event.status}
                      color={getStatusColor(event.status)}
                    />
                  }
                />
              )}
              {event?.isonline && (
                <InfoCard
                  label="Online"
                  value={
                    <Badge
                      label={event.isonline ? "Online" : "Offline"}
                      color={event?.isonline ? "green" : "red"}
                    />
                  }
                />
              )}
            </div>
          </EditableSection>

          {/* Location */}
          {(event.event_address ||
            event.event_city ||
            event.event_state ||
            event.event_country ||
            event.event_pincode) && (
            <EditableSection
              title="Event Location"
              onEdit={() => setIsLocEdit(true)}
            >
              <div className="p-4 rounded-lg bg-[var(--yp-secondary)]">
                <p className="text-sm leading-relaxed text-[var(--yp-text-primary)]">
                  {[
                    event.event_address,
                    event.event_city,
                    event.event_state,
                    event.event_country,
                    event.event_pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </EditableSection>
          )}

          {event.event_host_url && (
            <EditableSection title="Event Host URL" onEdit={() => {}}>
              <div className="p-4 rounded-lg bg-[var(--yp-secondary)]">
                <p className="text-sm leading-relaxed text-[var(--yp-text-primary)]">
                  {event.event_host_url}
                </p>
              </div>
            </EditableSection>
          )}
          {event.event_website && (
            <EditableSection title="Event Website" onEdit={() => {}}>
              <div className="p-4 rounded-lg bg-[var(--yp-secondary)]">
                <p className="text-sm leading-relaxed text-[var(--yp-text-primary)]">
                  {event.event_website}
                </p>
              </div>
            </EditableSection>
          )}
          {/* Schedule */}
          {event?.schedule?.length > 0 && (
            <EditableSection title="Schedule" onEdit={() => setIsSchEdit(true)}>
              <ul className="space-y-3">
                {event.schedule.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-3 bg-[var(--yp-secondary)] rounded-xl"
                  >
                    <Calendar size={18} className="text-[var(--yp-main)]" />
                    <span>
                      {formatDateWithoutTime(s.date)} •{" "}
                      {s.start_time && s.end_time
                        ? `${to12Hour(s.start_time)} - ${to12Hour(s.end_time)}`
                        : s.start_time || s.end_time}
                    </span>
                  </li>
                ))}
              </ul>
            </EditableSection>
          )}

          {/* Host & Partners */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Host */}
            {event?.host?.name && event?.host?.image?.length > 0 && (
              <EditableSection title="Host" onEdit={() => setIsHostEdit(true)}>
                {event?.host?.name && (
                  <div className="p-4 bg-[var(--yp-secondary)] rounded-xl flex flex-col items-center gap-3">
                    <img
                      src={
                        event.host.image?.[0]
                          ? `${import.meta.env.VITE_MEDIA_URL}/events/${
                              event.host.image[0]
                            }`
                          : "/img/default-images/yp-user.webp"
                      }
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <p className="text-sm font-medium text-[var(--yp-main)]">
                      {event.host.name}
                    </p>
                  </div>
                )}
              </EditableSection>
            )}
            {/* Partners */}
            {event?.event_partners?.length > 0 && (
              <EditableSection
                title="Partners"
                onEdit={() => setIsPartnerEdit(true)}
              >
                {event?.event_partners?.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {event.event_partners.map((p, i) => (
                      <div
                        key={i}
                        className="p-4 bg-[var(--yp-secondary)] rounded-xl flex flex-col items-center gap-2"
                      >
                        <img
                          src={
                            p.logo?.[0]
                              ? `${import.meta.env.VITE_MEDIA_URL}/events/${
                                  p.logo[0]
                                }`
                              : "/img/default-images/yp-user.webp"
                          }
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <p className="text-sm font-medium text-[var(--yp-main)]">
                          {p.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </EditableSection>
            )}
          </div>

          {/* Description */}
          <EditableSection
            title="Description"
            onEdit={() => setIsDesEdit(true)}
          >
            <div className="p-4 bg-[var(--yp-secondary)] rounded-xl">
              <ReadMoreLess>{event.description}</ReadMoreLess>
            </div>
          </EditableSection>

          {/* Other Info */}
          <EditableSection
            title="Other Details"
            onEdit={() => setOtherEdit(true)}
          >
            <div className="p-4 bg-[var(--yp-secondary)] rounded-xl space-y-4">
              {/* Ticket Booking */}
              <div className="text-[var(--yp-text-primary)]">
                <p className="text-sm font-medium text-[var(--yp-main)]">
                  Ticket Booking Duration
                </p>
                {event.ticket_booking?.start || event.ticket_booking?.end ? (
                  <p className="text-sm opacity-80 mt-1">
                    {event.ticket_booking?.start
                      ? formatDateWithoutTime(event.ticket_booking.start)
                      : "—"}{" "}
                    to{" "}
                    {event.ticket_booking?.end
                      ? formatDateWithoutTime(event.ticket_booking.end)
                      : "—"}
                  </p>
                ) : (
                  <p className="text-sm opacity-60">No ticket booking info.</p>
                )}
              </div>
              <div className="text-[var(--yp-text-primary)]">
                <p className="text-sm font-medium text-[var(--yp-main)]">
                  Age Limit
                </p>
                {event.age_limit?.min || event.age_limit?.max ? (
                  <p className="text-sm opacity-80 mt-1">
                    {event.age_limit?.min ? `Min: ${event.age_limit.min}` : ""}
                    {event.age_limit?.min && event.age_limit?.max ? " | " : ""}
                    {event.age_limit?.max ? `Max: ${event.age_limit.max}` : ""}
                  </p>
                ) : (
                  <p className="text-sm opacity-60">No age limit specified.</p>
                )}
              </div>
            </div>
          </EditableSection>
        </div>
      </main>
    </div>
  );
}

function EditableSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: any;
}) {
  return (
    <section className="relative group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[var(--yp-text-primary)]">
          {title}
        </h3>
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 transition bg-[var(--yp-secondary)] p-2 rounded-full hover:shadow"
        >
          <Pencil size={16} className="text-[var(--yp-main)]" />
        </button>
      </div>
      {children}
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-5 bg-[var(--yp-secondary)] rounded-xl shadow-sm hover:shadow transition">
      <p className="text-sm font-medium text-[var(--yp-main)]">{label}</p>
      <p className="mt-1 text-sm text-[var(--yp-text-primary)]">{value}</p>
    </div>
  );
}
