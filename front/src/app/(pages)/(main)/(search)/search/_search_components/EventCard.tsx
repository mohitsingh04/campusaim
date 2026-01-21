import { generateSlug } from "@/context/Callbacks";
import { EventProps } from "@/types/Types";
import Link from "next/link";
import { BiCalendarEvent } from "react-icons/bi";
import { LuMapPin } from "react-icons/lu";
import { TbTimelineEventPlus } from "react-icons/tb";

export default function EventCard({ event }: { event: EventProps }) {
  return (
    <section className="w-full">
      <div className="bg-(--primary-bg) text-(--text-color) p-4 sm:p-6 rounded-custom shadow-custom flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-2">
        <div className="flex items-center sm:items-start gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-(--main-light) text-(--main-emphasis) rounded-full flex items-center justify-center shrink-0">
            <TbTimelineEventPlus className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <div className="flex flex-col">
            <Link
              href={`/event/${generateSlug(event?.event_slug)}`}
              className="sub-heading font-semibold text-(--text-color-emphasis) hover:text-(--main) line-clamp-1"
            >
              {event?.title}
            </Link>

            {(() => {
              const locationParts = [
                event?.event_city,
                event?.event_state,
              ].filter(Boolean);
              if (locationParts.length === 0) return null;

              return (
                <div className="flex items-center text-(--text-color) gap-1 ms-2">
                  <LuMapPin className="w-4 h-4 text-(--main)" />
                  <h2 className="heading-sm">{locationParts.join(", ")}</h2>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-end justify-end sm:justify-start">
          <BiCalendarEvent className="w-3 h-3 sm:w-6 sm:h-6 " />
          <h3 className="text-xs sm:text-lg font-bold">Event</h3>
        </div>
      </div>
    </section>
  );
}
