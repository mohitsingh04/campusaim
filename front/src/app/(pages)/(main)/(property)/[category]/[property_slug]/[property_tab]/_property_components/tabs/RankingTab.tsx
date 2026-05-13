"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Info } from "lucide-react";

import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";

import HeadingLine from "@/ui/headings/HeadingLine";
import TabLoading from "@/ui/loader/component/TabLoading";

interface RankingItem {
  rank_name: string;
  value_name: string;
}

export default function RankingTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const { data: ranking = [], isLoading } = useQuery<RankingItem[]>({
    queryKey: ["property-ranking", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];
      try {
        const response = await API.get(`/property/ranking/${property._id}`);
        return Array.isArray(response.data?.ranks) ? response.data.ranks : [];
      } catch (error) {
        getErrorResponse(error, true);
        throw error;
      }
    },
    enabled: !!property?._id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <TabLoading />;
  }

  if (!ranking.length) {
    return (
      <div className="flex flex-col items-center justify-center bg-(--secondary-bg) py-16 px-6 text-center">
        <div className="mb-4 rounded-full bg-(--primary-bg) p-4">
          <Info className="w-8 h-8 text-(--text-color)!" />
        </div>
        <h2 className="text-xl font-bold text-(--text-emphasis)">
          No Rankings Found
        </h2>
        <p className="mt-2 max-w-xs text-sm text-(--text-color)!">
          We couldn&apos;t find any official ranking data for this property at
          the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-2 sm:p-6">
      <div className="relative">
        <HeadingLine title="Recognition & Rankings" />
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-(--text-color)">
          Verified rankings and official accreditations for{" "}
          <span className="font-bold text-(--primary-color) decoration-2 underline-offset-4">
            {property?.property_name}
          </span>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ranking.map((item, index) => (
          <div
            key={index}
            className="group relative flex flex-col justify-between overflow-hidden rounded-custom shadow-custom bg-(--secondary-bg) p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-custom bg-(--main-emphasis) transition-colors">
                <Trophy className="w-5 text-(--main-subtle) h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-(--text-color)!">
                {item?.rank_name}
              </p>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <h2 className="text-3xl font-black tracking-tight text-(--text-emphasis)">
                {item?.value_name}
              </h2>
              {!isNaN(Number(item.value_name)) && (
                <span className="text-sm font-medium text-(--text-color)">
                  Position
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
