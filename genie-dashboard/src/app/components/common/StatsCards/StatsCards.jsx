import React from "react";
import CountUp from "react-countup";
import StatsCardSkeleton from "./StatsCardSkeleton";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

function StatsCards({
    items = [],
    isLoading = false,
    skeletonCount = 4,
}) {
    if (items.length === 0) {
        return null;
    }

    if (isLoading) {
        return <StatsCardSkeleton count={skeletonCount} />;
    }

    const Card = ({ item }) => {
        const Icon = item.icon;

        return (
            <div
                onClick={item.onClick}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition 
  ${item.onClick ? "cursor-pointer hover:shadow-md" : "cursor-default"}`}
            >
                <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${item.iconBg || "bg-gray-100"}`}>
                        {Icon && (
                            <Icon
                                className={`w-6 h-6 ${item.iconColor || "text-gray-600"
                                    }`}
                            />
                        )}
                    </div>

                    <div className="ml-4 min-w-0">
                        <p
                            className="text-sm font-medium text-gray-600 truncate"
                            title={item.label} // shows full text on hover
                        >
                            {item.label}
                        </p>

                        <p className="text-2xl font-bold text-gray-900">
                            <CountUp
                                end={Number(item.value) || 0}
                                duration={1.2}
                                separator=","
                            />
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* ---------------- MOBILE SWIPER ---------------- */}
            <div className="md:hidden">
                <Swiper
                    spaceBetween={12}
                    slidesPerView={1.1}
                    freeMode={true}
                >
                    {items.map((item, idx) => (
                        <SwiperSlide key={idx}>
                            <Card item={item} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* ---------------- DESKTOP GRID ---------------- */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, idx) => (
                    <Card key={idx} item={item} />
                ))}
            </div>
        </>
    );
}

export default React.memo(StatsCards);