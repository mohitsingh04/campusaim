"use client";
import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import { HeadingProps } from "@/ui/headings/MainHeading";
import { PropertyProps } from "@/types/PropertyTypes";
import Link from "next/link";
import { generateSlug } from "@/context/Callbacks";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";

const PropertyCarousel = ({ properties }: { properties: PropertyProps[] }) => {
  const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;
  const { theme } = useTheme();
  const isLight = theme === "light";

  const { first20, randomList } = useMemo(() => {
    if (!properties) return { first20: [], randomList: [] };

    const validProperties = properties.filter(
      (p) => p?.property_logo?.[0] && p.property_logo[0].trim() !== ""
    );

    const first = validProperties.slice(0, 20);
    const rest = validProperties.slice(20);

    const shuffled = [...rest].sort(() => 0.5 - Math.random());
    const random = shuffled.slice(0, 20);

    const finalFirst =
      first.length < 10 ? [...first, ...first, ...first] : first;
    const finalRandom =
      random.length < 10 ? [...random, ...random, ...random] : random;

    return { first20: finalFirst, randomList: finalRandom };
  }, [properties]);

  const swiperOptions = {
    modules: [Autoplay],
    loop: true,
    speed: 3000,
    spaceBetween: 20,
    slidesPerView: 2,
    loopedSlides: 10,
    allowTouchMove: false,
    breakpoints: {
      320: { slidesPerView: 3, spaceBetween: 12 },
      480: { slidesPerView: 4, spaceBetween: 14 },
      640: { slidesPerView: 5, spaceBetween: 16 },
      768: { slidesPerView: 6, spaceBetween: 18 },
      1024: { slidesPerView: 8, spaceBetween: 20 },
      1280: { slidesPerView: 8, spaceBetween: 22 },
    },
    className: "mySwiper !pb-0",
  };

  if (properties?.length <= 0) return null;

  return (
    <section className="bg-(--primary-bg) py-10 px-4 sm:px-8 text-(--text-color)">
      <style jsx global>{`
        .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>

      <div className="mb-10">
        <HeadingProps
          tag={`${properties?.length}+ Partnered for Excellence`}
          title="Partnered "
          activetitle="Institutes"
          subtitle="Partnered for Excellence. We collaborate only with India's leading, certified yoga institutions to ensure authentic, professional learning."
        />
      </div>

      <div className="mb-10" dir="ltr">
        <Swiper
          {...swiperOptions}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
        >
          {first20.map((prop, index) => (
            <SwiperSlide key={`top-${index}`}>
              <Link
                href={`/${generateSlug(prop?.category)}/${generateSlug(
                  prop?.property_slug
                )}/overview`}
                className="flex items-center relative justify-center w-16 h-16 md:w-20 md:h-20 cursor-pointer overflow-hidden transition-transform hover:scale-105"
              >
                <Image
                  src={`${MEDIA_URL}/${prop.property_logo[0]}`}
                  alt={prop.property_name}
                  fill
                  className={`object-contain rounded-custom ${
                    isLight ? "grayscale-0" : "grayscale hover:grayscale-0"
                  } brightness-110 transition`}
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div dir="rtl">
        <Swiper
          {...swiperOptions}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
        >
          {randomList.map((prop, index) => (
            <SwiperSlide key={`bottom-${index}`} dir="ltr">
              <Link
                href={`/${generateSlug(prop?.category)}/${generateSlug(
                  prop?.property_slug
                )}/overview`}
                className="flex relative items-center justify-center w-16 h-16 md:w-20 md:h-20 cursor-pointer overflow-hidden transition-transform hover:scale-105"
              >
                <Image
                  src={`${MEDIA_URL}/${prop.property_logo[0]}`}
                  alt={prop.property_name}
                  fill
                  className={`object-contain rounded-custom ${
                    isLight ? "grayscale-0" : "grayscale hover:grayscale-0"
                  } brightness-110 transition`}
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default PropertyCarousel;
