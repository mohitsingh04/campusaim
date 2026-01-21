"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { generateSlug, getErrorResponse } from "@/context/Callbacks";
import API from "@/context/API";
import { PropertyProps } from "@/types/PropertyTypes";
import { CategoryProps } from "@/types/Types";
import HeadingLine from "@/ui/headings/HeadingLine";
import Image from "next/image";
import Link from "next/link";
import RelatedInstitutesSkeleton from "@/ui/loader/ui/RelatedInstitutesSkeleton";

const RelatedInstitute = ({
  property,
  category,
}: {
  property: PropertyProps;
  category: CategoryProps[];
}) => {
  const [relatedProperties, setRelatedProperties] = useState<PropertyProps[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const getCategoryById = (id: string) => {
    const cat = category?.find((item) => item.uniqueId === Number(id));
    return cat?.category_name;
  };

  useEffect(() => {
    setLoading(true);
    if (!property) return;

    const fetchRelated = async () => {
      try {
        const response = await API.get(`/related/property`, {
          params: {
            uniqueId: property.uniqueId,
            category: property.category_id,
            property_type: property.property_type,
            city: property.city,
            state: property.state,
            country: property.country,
          },
        });

        setRelatedProperties(response.data);
      } catch (error) {
        getErrorResponse(error, true);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [property]);

  if (loading) return <RelatedInstitutesSkeleton />;

  return (
    <section className="relative p-5 bg-(--primary-bg) text-(--text-color) rounded-custom overflow-hidden shadow-custom">
      <HeadingLine title="Explore Related Yoga Institutes" />

      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={1.2}
        loop
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={5000}
        freeMode
        grabCursor
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2.5 },
          1024: { slidesPerView: 2 },
        }}
        className="cursor-grab"
      >
        {relatedProperties.map((institute, index) => (
          <SwiperSlide key={index}>
            <Link
              href={`/${generateSlug(
                getCategoryById(institute.category) || ""
              )}/${generateSlug(institute?.property_slug || "")}/overview`}
              className="block w-full"
            >
              {/* Fixed aspect ratio wrapper (2:1) */}
              <div className="w-full aspect-2/1 relative overflow-hidden rounded-custom shadow-custom group">
                {/* Image (normal mode, not fill) */}
                <Image
                  src={
                    institute?.featured_image?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${institute.featured_image[0]}`
                      : "/img/default-images/yp-institutes.webp"
                  }
                  alt={institute?.property_name}
                  className="object-cover w-full h-full transition-all duration-500 hover:scale-105"
                  width={800}
                  height={400} // 2:1 aspect
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

                {/* Text Content */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-semibold text-sm md:text-base mb-1">
                    {institute?.property_name}
                  </h4>

                  <p className="text-xs opacity-90">
                    {[
                      institute.property_city,
                      institute.property_state,
                      institute.property_country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  <p className="text-xs opacity-80 mt-1">
                    {getCategoryById(institute.category)}
                  </p>
                </div>
                <div className="absolute inset-0 z-20 bg-linear-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1500 ease-in-out" />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default RelatedInstitute;
