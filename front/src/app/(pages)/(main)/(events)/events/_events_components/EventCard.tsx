import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import { EventProps } from "@/types/Types";
import Link from "next/link";
import Image from "next/image";
import { LuMapPin } from "react-icons/lu";
import { formatDate } from "@/context/Callbacks";
import { FiAward } from "react-icons/fi";
import { IoCalendarOutline } from "react-icons/io5";

const EventCard = ({
  event,
  isListView,
}: {
  event: EventProps;
  isListView: boolean;
}) => {
  if (!event) return null;

  const slug = `/event/${event.event_slug}`;

  const imageSrc = event?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/events/${event.featured_image[0]}`
    : "/img/default-images/yp-event.webp";

  const eventDate = formatDate(event.schedule?.[0]?.date);

  const locationParts = [event?.event_city, event?.event_state]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`bg-(--primary-bg) rounded-custom shadow-custom transition-all duration-300 overflow-hidden group cursor-pointer
      ${
        isListView ? "flex flex-col md:flex-row h-full" : "flex flex-col h-full"
      }`}
    >
      <div
        className={`overflow-hidden ${
          isListView ? "w-full md:w-80 lg:w-96 shrink-0" : "w-full"
        }`}
      >
        <Link href={slug}>
          <div
            className={`relative w-full ${
              isListView ? "h-56 md:h-full" : "aspect-2/1 min-h-48"
            }`}
          >
            <Image
              src={imageSrc}
              fill
              alt={event?.title || "Event Image"}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-1 gap-4 h-full">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <Link href={slug}>
              <h2 className="sub-heading font-semibold hover:text-(--main) line-clamp-2 mb-2">
                {event?.title || "Unnamed course"}
              </h2>
            </Link>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FiAward className="text-(--main) w-4 h-4" />
                <p>{event.entrance_type}</p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <IoCalendarOutline className="text-(--main) w-4 h-4" />
                <p>{eventDate}</p>
              </div>
              {locationParts && (
                <div className="flex items-center gap-2 col-span-2 text-sm">
                  <LuMapPin className="text-(--main) w-4 h-4" />
                  <p>{locationParts}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FIXED BOTTOM BUTTON */}
        <div className="mt-auto">
          <ButtonGroup
            label="View Details"
            href={slug}
            className="w-full"
            disable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
