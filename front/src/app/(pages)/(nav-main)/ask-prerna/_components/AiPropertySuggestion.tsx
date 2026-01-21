"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { FaVolumeUp } from "react-icons/fa";
import {
  BsBuilding,
  BsStarFill,
  BsEnvelope,
  BsEye,
  BsRobot,
} from "react-icons/bs";
import Link from "next/link";
import { useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FaVolumeXmark } from "react-icons/fa6";
import { PropertyProps } from "@/types/PropertyTypes";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import API from "@/context/API";
import {
  generateSlug,
  getErrorResponse,
  stripHtmlNoLimit,
} from "@/context/Callbacks";
import { useTheme } from "@/hooks/useTheme";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content?: string;
  index?: number;
  timestamp: string;
  property?: PropertyProps[];
  property_summary?: PropertyProps | null | undefined;
}

export const AiPropertySugesstion = ({
  property,
  index,
  setMessages,
  setIsEnquiryModal,
  setIsLoading,
}: {
  property: PropertyProps[];
  index: number;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsEnquiryModal: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isSpeaking, speakText, stopSpeaking } = useTextToSpeech();
  const { chat_id } = useParams();
  const { theme } = useTheme();

  const handlePropertyEnquiryModal = async (property_slug: string) => {
    try {
      setIsEnquiryModal(property_slug);
    } catch (error) {
      getErrorResponse(error, true);
    }
  };

  const handlePropertySearchOnClick = useCallback(
    async (property_name: string, objectId: string) => {
      const userMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "user",
        content: property_name,
        timestamp: `${new Date()}`,
      };

      setMessages((prev) => [...prev, userMessage]);
      await new Promise((resolve) => setTimeout(resolve, 0));
      setIsLoading(true);

      try {
        const response = await API.post(`/ai/prerna/property`, {
          objectId: objectId,
          userTime: Date.now(),
          chat_id: chat_id,
        });

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.data.message,
          timestamp: `${new Date()}`,
          property: response.data?.data,
          property_summary: response?.data?.summary_data,
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        getErrorResponse(error, true);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          timestamp: `${new Date()}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [chat_id, setMessages, setIsLoading]
  );

  return (
    <div className=" max-w-[calc(100vw-60px)] sm:max-w-7xl sm:w-auto w-full">
      <div className="relative ">
        {/* Navigation Buttons */}
        <button
          className={`prev-button-${index} absolute -left-4 sm:-left-6 md:-left-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-(--primary-bg) text-(--text-color-emphasis) rounded-full shadow-custom hover:opacity-80 transition hidden sm:flex items-center justify-center`}
        >
          <LuChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          className={`next-button-${index} absolute -right-4 sm:-right-6 md:-right-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3  bg-(--primary-bg) text-(--text-color-emphasis) rounded-full shadow-custom hover:opacity-80 transition hidden sm:flex items-center justify-center`}
        >
          <LuChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Autoplay, Navigation]}
          navigation={{
            prevEl: `.prev-button-${index}`,
            nextEl: `.next-button-${index}`,
          }}
          spaceBetween={16}
          slidesPerView={1}
          autoplay={{ delay: 4000, pauseOnMouseEnter: true }}
          breakpoints={{
            480: { slidesPerView: 1, spaceBetween: 18 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 22 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 3, spaceBetween: 28 },
          }}
          className="pb-8"
        >
          {property?.map((item, idx) => {
            const cleanText = stripHtmlNoLimit(item?.property_description);

            return (
              <SwiperSlide key={idx} className="p-0.5">
                <div className="group relative bg-(--primary-bg) rounded-custom shadow-custom transition-all duration-300 overflow-hidden">
                  <div className="absolute top-2.5 right-2.5 z-10">
                    {item?.property_description && isSpeaking ? (
                      <button
                        className="bg-(--text-color-emphasis) hover:opacity-80 text-(--primary-bg) p-1.5 sm:p-2 rounded-full shadow-custom transition"
                        onClick={stopSpeaking}
                        title="Stop Speaking"
                      >
                        <FaVolumeXmark className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    ) : (
                      <button
                        className="bg-(--text-color-emphasis) hover:opacity-80 text-(--primary-bg) p-1.5 sm:p-2 rounded-full shadow-custom transition"
                        onClick={() => speakText(cleanText)}
                        title="Speak Institute Overview"
                      >
                        <FaVolumeUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>

                  {/* Featured Image */}
                  {item.featured_image?.[0] ? (
                    <div className="relative h-36 sm:h-44 md:h-48 w-full overflow-hidden">
                      <Image
                        fill
                        src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${item.featured_image[0]}`}
                        alt={item.property_name || "Property image"}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-36 sm:h-44 md:h-48 w-full bg-(--secondary-bg) flex items-center justify-center">
                      <BsBuilding className="text-(--text-color-emphasis) text-2xl sm:text-3xl" />
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      {/* Property Logo */}
                      {item.property_logo?.[0] && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center bg-(--secondary-bg) rounded-lg overflow-hidden shrink-0">
                          <Image
                            fill
                            src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${item.property_logo[0]}`}
                            alt={item?.property_name}
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {item.property_slug ? (
                          <h2
                            onClick={() =>
                              handlePropertySearchOnClick(
                                item?.property_name,
                                item?.objectId
                              )
                            }
                            className="text-sm sm:text-base font-semibold text-(--text-color-emphasis) truncate cursor-pointer hover:underline"
                          >
                            {item.property_name}
                          </h2>
                        ) : (
                          <h2 className="text-sm sm:text-base font-semibold text-(--text-color-emphasis) truncate">
                            {item.property_name}
                          </h2>
                        )}
                        {(item.property_city ||
                          item.property_state ||
                          item.property_country) && (
                          <p className="text-[11px] sm:text-xs text-(--text-color) truncate">
                            {[
                              item.property_city,
                              item.property_state,
                              item.property_country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Company Logo */}
                      {item.property_slug ? (
                        <div className="w-5  h-5 relative shrink-0 bg-(--text-color-emphasis) rounded">
                          <Image
                            fill
                            src={
                              theme === "light"
                                ? "/img/logo/logo-small-white.png"
                                : "/img/logo/logo-small-black.png"
                            }
                            alt="Company Logo"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <BsRobot className="text-(--text-color-emphasis) w-5 h-5 shrink-0" />
                      )}
                    </div>

                    {/* Types */}
                    <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs text-(--text-color)">
                      {item.academic_type && (
                        <p className="flex items-center gap-1.5">
                          <LuChevronRight className="text-(--text-color) w-3 h-3" />
                          <span>{item.academic_type}</span>
                        </p>
                      )}
                      {item.property_type && (
                        <p className="flex items-center gap-1.5">
                          <LuChevronRight className="text-(--text-color) w-3 h-3" />
                          <span>{item.property_type}</span>
                        </p>
                      )}
                    </div>

                    {/* Rating / Reviews */}
                    {((item?.average_rating || 0) > 0 ||
                      (item?.total_reviews || 0) > 0) && (
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-(--text-color)">
                        <BsStarFill className="text-(--warning) w-3 h-3" />
                        {item.average_rating && (
                          <span>{item.average_rating}/5</span>
                        )}
                        {item.total_reviews && (
                          <span className="text-(--text-color)">
                            ({item.total_reviews} reviews)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {item.property_description && (
                      <p
                        className="text-[11px] sm:text-xs text-(--text-color) line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: item.property_description,
                        }}
                      />
                    )}

                    {/* Buttons */}
                    {item?.property_slug && (
                      <div className="flex gap-2 pt-2 sm:pt-3">
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-(--secondary-bg) text-(--text-color) text-[11px] sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-custom transition-all duration-200 shadow-custom hover:opacity-80"
                          title={item.property_slug || item.property_name || ""}
                          onClick={() =>
                            handlePropertyEnquiryModal(item?.property_slug)
                          }
                        >
                          <BsEnvelope className="w-3 h-3 sm:w-4 sm:h-4" />
                          Enquiry
                        </button>
                        <Link
                          href={`/${generateSlug(
                            item?.academic_type || ""
                          )}/${generateSlug(item?.property_slug)}/overview`}
                          target="_blank"
                          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 btn-shine px-3 sm:px-4 py-2 rounded-custom"
                          title={item?.property_name}
                        >
                          <BsEye className="w-3 h-3 sm:w-4 sm:h-4" />
                          View
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};
