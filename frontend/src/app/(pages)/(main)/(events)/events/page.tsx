"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";
import API from "@/contexts/API";
import { stripHtmlAndLimit } from "@/contexts/Callbacks";
import { EventProps, CategoryProps, UserProps } from "@/types/types";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import BlogLoader from "@/components/Loader/Blog/BlogLoader";
import FeaturedEvent from "./_all_event_components/FeaturedEvent";
import EventCard from "./_all_event_components/EventCard";
import Pagination from "./_all_event_components/Pagination";

const EventPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvent] = useState<EventProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;
  const [events, setEvents] = useState<EventProps[]>([]);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [category, setCategory] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategory = useCallback(async () => {
    try {
      const response = await API.get(`/category`);
      setCategory(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const response = await API.get(`/profile/users`);
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    getCategory();
  }, [getCategory]);

  const getEvents = useCallback(async () => {
    if (users?.length <= 0 && category?.length <= 0) return;
    setLoading(false);
    try {
      const response = await API.get(`/events`);
      const data = response.data.filter((item:EventProps) => item.status === "Active");

      const enrichedEvents = data.map((event: EventProps) => {
        const EventCategories = event?.category.map((catId) => {
          const cat = category.find((c) => c._id === catId);
          return cat?.category_name || "Unknown Category";
        });

        return {
          title: event.title,
          description: event.description,
          category: EventCategories,
          event_date: event.schedule?.[0]?.date,
          event_time: event.schedule?.[0]?.start_time,
          featured_image: event?.featured_image,
        };
      });

      setEvents(enrichedEvents);
      setFilteredEvent(
        enrichedEvents.filter((_: EventProps[], index: number) => index !== 0)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [users, category]);

  useEffect(() => {
    getEvents();
  }, [users, category, getEvents]);

  const featuredEvent = events[0];
  const regularEvents = useMemo(
    () => events.filter((_, index) => index !== 0),
    [events]
  );

  useEffect(() => {
    let filtered = regularEvents;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stripHtmlAndLimit(event?.description)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvent(filtered);
    setCurrentPage(1);
  }, [searchTerm, regularEvents]);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + eventsPerPage
  );

  return (
    <div>
      {!loading ? (
        <div className="bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div>
              <Breadcrumb items={[{ label: "Events" }]} />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {featuredEvent && currentPage === 1 && (
              <FeaturedEvent event={featuredEvent} />
            )}
            <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md w-full">
                  <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search events"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>
                <div>
                  <p className="text-gray-600 flex items-center space-x-2">
                    <span>
                      {filteredEvents.length === regularEvents.length ? (
                        <>
                          Showing all{" "}
                          <span className="font-bold text-purple-600">
                            {filteredEvents.length}
                          </span>{" "}
                          Events
                        </>
                      ) : (
                        `Found ${filteredEvents.length} event${
                          filteredEvents.length !== 1 ? "s" : ""
                        }`
                      )}
                    </span>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-purple-600 bg-purple-50 px-3 py-2 rounded-xl hover:text-purple-700 text-sm font-medium flex items-center cursor-pointer hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`}
            >
              {currentEvents.map((event, index) => (
                <EventCard key={index} event={event} index={index} />
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LuSearch className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No events found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search terms to discover great content.
                  </p>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      ) : (
        <BlogLoader />
      )}
    </div>
  );
};

export default EventPage;
