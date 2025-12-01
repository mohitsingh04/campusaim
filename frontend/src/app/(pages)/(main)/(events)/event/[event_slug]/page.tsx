"use client";
import React, { useCallback, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { LuCalendar, LuClock, LuUsers, LuDollarSign } from "react-icons/lu";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import API from "@/contexts/API";
import { AdminProps, CategoryProps, EventProps } from "@/types/types";
import { formatDate, formatTo12Hour, generateSlug } from "@/contexts/Callbacks";
import Sidebar from "./_event_components/sidebar";
import BlogDetailLoader from "@/components/Loader/Blog/BlogDetailLoader";
import Image from "next/image";
import ReadMoreLess from "@/components/read-more/ReadMoreLess";

const EventDetailPage: React.FC = () => {
  const { event_slug } = useParams();
  const [event, setEvent] = useState<EventProps | null>(null);
  const [users, setUsers] = useState<AdminProps[]>([]);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [allEvent, setAllEvent] = useState<EventProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, categoriesRes] = await Promise.all([
          API.get(`/profile/users`),
          API.get(`/category`),
        ]);
        setUsers(usersRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const getCategoryById = useCallback(
    (id: string) => {
      const cat = categories.find((c) => c._id === id);
      return cat?.category_name || "Unknown Category";
    },
    [categories]
  );

  const getEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/events`);
      const data = response.data.filter(
        (item: EventProps) => item.status === "Active"
      );
      setAllEvent(data);

      const mainEvent: EventProps = data.find(
        (item: EventProps) => generateSlug(item.title) === event_slug
      );
      if (!mainEvent) return;

      // Processed Event Object
      const finalEvent: EventProps = {
        ...mainEvent,
        category: mainEvent?.category?.map((id: any) => getCategoryById(id)),
      };

      setEvent(finalEvent);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [event_slug, getCategoryById]);

  useEffect(() => {
    if (users.length && categories.length) {
      getEvents();
    }
  }, [users, categories, getEvents]);

  useEffect(() => {
    if (!event && !loading) {
      notFound();
    }
  }, [event, loading]);

  return (
    <>
      {!loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: "Events", path: "/events" },
                { label: event?.title || "Event" },
              ]}
            />
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Featured Image */}
                <div className="relative w-full aspect-[2/1]">
                  <Image
                    src={
                      event?.featured_image?.[0]
                        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${event.featured_image[0]}`
                        : "/img/default-images/yp-event.webp"
                    }
                    alt={event?.title || "Event Featured"}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>

                <div className="p-8">
                  {/* Categories + Schedule */}
                  <div className="flex flex-wrap gap-2 items-center mb-6">
                    {event?.category?.map((category) => (
                      <span
                        key={category}
                        className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {event?.title}
                  </h1>
                  <h2 className="text-sm text-gray-500 mb-4 leading-tight">
                    {[
                      event?.event_address,
                      event?.event_city,
                      event?.event_state,
                      event?.event_country,
                      event?.event_pincode,
                    ]?.join(", ")}
                  </h2>

                  <ReadMoreLess htmlText={event?.description || ""} />

                  {/* Additional Info Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-sm flex flex-wrap gap-6">
                    {/* Language */}
                    {(event?.language?.length || 0) > 0 && (
                      <div className="flex items-center gap-2">
                        <LuUsers className="h-5 w-5 text-purple-600" />
                        <span className="text-gray-700 font-medium">
                          Language: {event?.language.join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    {event?.price && (
                      <div className="flex items-center gap-2">
                        <LuDollarSign className="h-5 w-5 text-purple-600" />
                        <span className="text-gray-700 font-medium">
                          {event.price.USD}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </article>

              {event?.host?.image?.[0] && event?.host?.name && (
                <div className="bg-white rounded-2xl mt-6 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center gap-6">
                  {/* Host Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-purple-100">
                      <Image
                        src={
                          event.host.image?.[0]
                            ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${event.host.image[0]}`
                            : "/img/default-images/yp-user.webp"
                        }
                        alt={event.host.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-semibold mb-1">
                        Event Host
                      </p>
                      <p className="font-medium text-gray-900">
                        {event.host.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(event?.schedule?.length || 0) > 0 && (
                <div className="bg-white rounded-2xl shadow-sm mt-6 p-6 overflow-x-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <LuClock className="h-6 w-6 text-purple-600 flex-shrink-0" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Event Schedule
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead className="bg-purple-50 text-purple-700 font-semibold">
                        <tr>
                          <th className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <LuCalendar className="h-4 w-4" /> Date
                            </div>
                          </th>

                          <th className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <LuClock className="h-4 w-4" /> Start Time
                            </div>
                          </th>

                          <th className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <LuClock className="h-4 w-4" /> End Time
                            </div>
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {event?.schedule?.map((item, index) => (
                          <tr
                            key={index}
                            className="bg-white hover:bg-purple-50 transition-colors"
                          >
                            <td className="py-3 px-6 text-gray-700">
                              {formatDate(item?.date)}
                            </td>

                            <td className="py-3 px-6 text-gray-700">
                              {formatTo12Hour(item?.start_time) || "N/A"}
                            </td>

                            <td className="py-3 px-6 text-gray-700">
                              {formatTo12Hour(item?.end_time) || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Ticket Booking Info */}
              {event?.ticket_booking && (
                <div className="bg-white rounded-2xl mt-6 p-6 shadow-sm flex items-center gap-4">
                  <div className="flex-shrink-0 text-purple-600">
                    <LuCalendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      Ticket Booking Period
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                      {formatDate(event.ticket_booking.start)} —{" "}
                      {formatDate(event.ticket_booking.end)}
                    </p>
                  </div>
                </div>
              )}

              {(event?.event_partners?.length || 0) > 0 && (
                <div className="bg-white rounded-2xl mt-6 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <LuUsers className="h-6 w-6 text-purple-600 flex-shrink-0" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Event Partners
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {event?.event_partners?.map((partner, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center text-center bg-white rounded-2xl p-5 shadow-sm hover:shadow-sm transition-shadow duration-300"
                      >
                        <div className="relative w-24 h-24 mb-3">
                          <Image
                            src={
                              partner.logo?.[0]
                                ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${partner.logo[0]}`
                                : "/img/default-images/yp-user.webp"
                            }
                            alt={partner.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {partner.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar event={event} allEvent={allEvent} />
            </div>
          </div>
        </div>
      ) : (
        <BlogDetailLoader />
      )}
    </>
  );
};

export default EventDetailPage;
