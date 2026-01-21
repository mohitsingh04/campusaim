"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { BiChild, BiGlobe, BiMapPin } from "react-icons/bi";
import { FaDollarSign } from "react-icons/fa";
import { BsTicketDetailed, BsTicketPerforatedFill } from "react-icons/bs";
import { EventProps } from "@/types/Types";
import API from "@/context/API";
import {
  calculateDuration,
  formatDate,
  formatTo12Hour,
  getErrorResponse,
} from "@/context/Callbacks";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import InfoCard from "@/ui/cards/InfoCard";
import HeadingLine from "@/ui/headings/HeadingLine";
import EventPageSkeleton from "@/ui/loader/page/event/EventDetailSkeleton";

const EventDetails = ({}) => {
  const { event_slug } = useParams();
  const [event, setEvent] = useState<EventProps | null>();
  const [loading, setLoading] = useState(true);

  const getEvent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/event/seo/${event_slug}`);
      const data = response.data;

      if (!data) return setEvent(null);

      const finalEvent = { ...data, event_slug: data.slug };
      setEvent(finalEvent);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [event_slug]);

  useEffect(() => {
    getEvent();
  }, [getEvent]);

  if (loading) return <EventPageSkeleton />;

  return (
    <div className="bg-(--secondary-bg) text-(--text-color) py-6 mx-auto px-2 sm:px-8">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Image */}
            <div className="relative aspect-2/1 rounded-custom overflow-hidden shadow-custom transition">
              <Image
                src={
                  event?.featured_image?.[0]
                    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${event.featured_image[0]}`
                    : "/img/default-images/yp-event.webp"
                }
                alt={event?.title || ""}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Description */}
            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <h1 className="heading-lg text-(--text-color-emphasis) font-medium mb-2">
                {event?.title}
              </h1>

              <ReadMoreLess html={event?.description} />

              {/* External Join Link */}
              {event?.event_host_url && (
                <a
                  href={event.event_host_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 btn-shine rounded-custom"
                >
                  Join Now
                </a>
              )}
            </div>

            {/* Event Information */}
            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="Event Information" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {/* Language */}
                {(event?.language?.length || 0) > 0 && (
                  <InfoCard
                    Icon={BiGlobe}
                    title="Languages"
                    value={(event?.language || [])?.join(", ")}
                  />
                )}

                {/* Venue */}
                {(event?.event_city ||
                  event?.event_state ||
                  event?.event_country) && (
                  <InfoCard
                    Icon={BiMapPin}
                    title="Venue"
                    value={[
                      event?.event_city,
                      event?.event_state,
                      event?.event_country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                )}

                {/* Entrance Type */}
                {event?.entrance_type && (
                  <InfoCard
                    Icon={FaDollarSign}
                    title="Entrance Type"
                    value={event.entrance_type}
                  />
                )}

                {/* Ticket Booking Start */}
                {event?.ticket_booking?.start && (
                  <InfoCard
                    Icon={BsTicketPerforatedFill}
                    title="Ticket Booking Start"
                    value={formatDate(event.ticket_booking.start)}
                  />
                )}

                {/* Ticket Booking End */}
                {event?.ticket_booking?.end && (
                  <InfoCard
                    Icon={BsTicketDetailed}
                    title="Ticket Booking End"
                    value={formatDate(event.ticket_booking.end)}
                  />
                )}

                {event?.age_limit?.min && event?.age_limit?.max && (
                  <InfoCard
                    Icon={BiChild}
                    title="Age Limit"
                    value={`${event.age_limit.min} - ${event.age_limit.max}`}
                  />
                )}
              </div>
            </div>

            {/* Event Partners */}
            {(event?.event_partners?.length || 0) > 0 && (
              <div className="bg-(--primary-bg) rounded-custom shadow-custom p-5 transition">
                <HeadingLine title="Our Esteemed Partners" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {event?.event_partners?.map((partner, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-custom overflow-hidden cursor-pointer bg-(--secondary-bg)"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {/* Image */}
                        <Image
                          src={
                            partner?.logo?.[0]
                              ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${partner.logo[0]}`
                              : "/img/default-images/yp-event.webp"
                          }
                          alt={partner?.name}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />

                        {/* Full Overlay (always visible) */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/70 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300"></div>

                        {/* Name — Bottom Left */}
                        <div className="absolute left-4 bottom-4">
                          <span className="text-(--white) font-semibold text-lg drop-shadow-sm">
                            {partner?.name}
                          </span>
                        </div>
                      </div>

                      {/* Shine Animation */}
                      <div className="absolute inset-0 z-20 bg-linear-to-r from-transparent via-(--white)/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1500 ease-in-out"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-1 space-y-8 ">
            <div className="sticky top-24">
              <div className="bg-(--primary-bg) rounded-custom shadow-custom p-5 transition">
                <HeadingLine title="Event Schedule" />

                {/* Schedule Table */}
                <table className="w-full border border-(--border) rounded-custom overflow-hidden">
                  <thead className="bg-(--secondary-bg)">
                    <tr className="text-left text-sm text-(--text-color-emphasis)">
                      <th className="p-2">Date</th>
                      <th className="p-2">Start</th>
                      <th className="p-2">End</th>
                      <th className="p-2">Duration</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(event?.schedule?.length || 0) > 0 ? (
                      event?.schedule?.map((item: any, i: number) => {
                        const duration = calculateDuration(
                          item?.start_time || "",
                          item?.end_time || ""
                        );

                        return (
                          <tr
                            key={i}
                            className="border-t text-sm bg-(--secondary-bg) hover:bg-(--primary-bg) transition"
                          >
                            <td className="p-2">{formatDate(item?.date)}</td>
                            <td className="p-2">
                              {formatTo12Hour(item?.start_time) || "-"}
                            </td>
                            <td className="p-2">
                              {formatTo12Hour(item?.end_time) || "-"}
                            </td>
                            <td className="p-2">{duration}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          className="p-3 text-center text-(--text-color)"
                          colSpan={4}
                        >
                          No schedule available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Host Section */}
              </div>
              {(event?.host?.image?.length || 0) > 0 && event?.host?.name && (
                <div className="bg-(--primary-bg) rounded-custom shadow-custom p-6 mt-6 text-center">
                  <HeadingLine title="Event Host" />

                  <div className="group relative rounded-custom overflow-hidden cursor-pointer bg-(--secondary-bg)">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={
                          event.host.image?.[0]
                            ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${event.host.image?.[0]}`
                            : "/img/default-images/yp-user.webp"
                        }
                        alt={event.host.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/70 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300"></div>
                      <div className="absolute left-4 bottom-4">
                        <span className="text-(--white) font-semibold text-lg drop-shadow-sm">
                          {event.host.name}
                        </span>
                      </div>
                    </div>
                    <div className="absolute inset-0 z-20 bg-linear-to-r from-transparent via-(--white)/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1500 ease-in-out"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
