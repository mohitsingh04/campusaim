import { generateSlug } from "@/contexts/Callbacks";
import { EventProps } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { LuCalendar, LuTrendingUp } from "react-icons/lu";

const Sidebar = ({
  event,
  allEvent,
}: {
  event: EventProps | null;
  allEvent: EventProps[];
}) => {
  const [events, setEvents] = useState<EventProps[]>([]);

  useEffect(() => {
    if (!event || !allEvent.length) return;

    // Exclude current event
    const otherEvents = allEvent.filter(
      (item) => item.uniqueId !== event.uniqueId
    );

    // Normalize current event categories
    const currentCategories = (event.category || []).map(String);

    // Find related events (share at least one category)
    const relatedEvents = otherEvents.filter((item) => {
      const itemCategories = (item.category || []).map(String);
      return itemCategories.some((cat) => currentCategories.includes(cat));
    });

    let finalEvents: EventProps[] = [];

    if (relatedEvents.length > 0) {
      // Shuffle related
      const shuffled = [...relatedEvents].sort(() => 0.5 - Math.random());
      finalEvents = shuffled.slice(0, 5);
    } else {
      // No related → show 5 random events
      const shuffled = [...otherEvents].sort(() => 0.5 - Math.random());
      finalEvents = shuffled.slice(0, 5);
    }

    setEvents(finalEvents);
  }, [event, allEvent]);

  return (
    <div className="space-y-8 sticky top-24">
      <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <LuTrendingUp className="h-5 w-5 text-purple-600" />
          <span>Related Events</span>
        </h3>

        <div className="space-y-4">
          {events.map((ev, index) => (
            <Link
              key={index}
              href={`/event/${generateSlug(ev.title)}`}
              className="flex space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300 ease-in-out">
                  <Image
                    src={
                      ev?.featured_image?.[0]
                        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${ev.featured_image[0]}`
                        : "/img/default-images/yp-event.webp"
                    }
                    alt={ev.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                  {ev.title}
                </h4>
                <div className="flex items-center space-x-1 mt-1">
                  <LuCalendar className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 transition-opacity duration-300">
                    {new Date(ev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {events.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No events available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
