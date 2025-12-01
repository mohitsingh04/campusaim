import React from "react";
import { LuArrowRight, LuCalendar, LuClock } from "react-icons/lu";
import Link from "next/link";
import {
  stripHtmlAndLimit,
  generateSlug,
  formatTo12Hour,
} from "@/contexts/Callbacks";
import { EventProps } from "@/types/types";
import Image from "next/image";

const FeaturedEvent = ({ event }: { event: EventProps }) => {
  return (
    <div className="relative bg-purple-600 rounded-3xl overflow-hidden shadow-2xl mb-16">
      <div className="absolute inset-0 bg-black/30"></div>

      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url(${
            event?.featured_image?.[0]
              ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${event.featured_image[0]}`
              : "/img/default-images/yp-event.webp"
          })`,
        }}
      ></div>

      <div className="relative p-8 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-2">
              <span className="text-white text-sm font-medium">
                {event?.category?.[0]}
              </span>
            </div>

            <Link href={`/event/${generateSlug(event?.title)}`}>
              <h2 className="text-3xl lg:text-4xl font-bold text-white hover:text-purple-100 mb-1 leading-tight">
                {event?.title}
              </h2>
            </Link>

            {event?.description && (
              <p className="text-purple-100 text-lg mb-2 leading-relaxed">
                {stripHtmlAndLimit(event?.description, 240)}
              </p>
            )}

            <div className="flex items-center space-x-6 text-purple-200 mb-4">
              <div className="flex items-center space-x-1">
                <LuCalendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(event?.event_date).toLocaleDateString()}
                </span>
              </div>
              {event?.event_time && (
                <div className="flex items-center space-x-1">
                  <LuClock className="h-4 w-4" />
                  <span className="text-sm">
                    {formatTo12Hour(event?.event_time)}
                  </span>
                </div>
              )}
            </div>

            <Link
              href={`/event/${generateSlug(event?.title)}`}
              className="inline-flex items-center space-x-2 bg-white text-purple-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span>Read Full Article</span>
              <LuArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="hidden lg:block">
            <Link
              href={`/event/${generateSlug(event?.title)}`}
              className="block"
            >
              <div className="relative w-full aspect-[2/1] rounded-2xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image
                  src={
                    event?.featured_image?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${event.featured_image[0]}`
                      : "/img/default-images/yp-event.webp"
                  }
                  alt={event?.title}
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedEvent;
