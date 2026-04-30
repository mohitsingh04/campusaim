"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Award,
  Globe,
  BarChart3,
  Medal,
  CheckCircle2,
} from "lucide-react";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import HeadingLine from "@/ui/headings/HeadingLine";
import TabLoading from "@/ui/loader/component/TabLoading";

interface RankingData {
  naac_rank?: string | number;
  nirf_rank?: string | number;
  nba_rank?: string | number;
  qs_rank?: string | number;
  times_higher_education_rank?: string | number;
}

export default function RankingTab({
  getCategoryById,
  property,
}: {
  getCategoryById: (id: any) => string | undefined;
  property: PropertyProps | null;
}) {
  const { data: ranking, isLoading } = useQuery<RankingData[]>({
    queryKey: ["property-ranking", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];
      try {
        const response = await API.get(`/ranking/${property._id}`);
        return response.data || [];
      } catch (error) {
        getErrorResponse(error, true);
        throw error;
      }
    },
    enabled: !!property?._id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <TabLoading />;

  if (!ranking || ranking.length === 0) {
    return (
      <div className="p-10 text-center text-(--text-color-light) bg-(--secondary-bg) rounded-custom border border-dashed border-(--border)">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>Official ranking data is not yet available for this institute.</p>
      </div>
    );
  }

  const data = ranking[0];

  // Logic: Pass the Icon Component itself, not <Icon />
  const rankingCards = [
    {
      label: "NAAC Accreditation",
      value: getCategoryById(data?.naac_rank),
      Icon: CheckCircle2,
      iconColor: "text-emerald-500",
      desc: "National Assessment and Accreditation Council",
      show: !!data?.naac_rank,
    },
    {
      label: "NIRF Ranking",
      value: data?.nirf_rank,
      Icon: BarChart3,
      iconColor: "text-(--blue)",
      desc: "National Institutional Ranking Framework",
      show: !!data?.nirf_rank,
    },
    {
      label: "NBA Accreditation",
      value: data?.nba_rank,
      Icon: Award,
      iconColor: "text-(--warning)",
      desc: "National Board of Accreditation",
      show: !!data?.nba_rank,
    },
    {
      label: "QS World Rank",
      value: data?.qs_rank,
      Icon: Globe,
      iconColor: "text-(--purple)",
      desc: "Quacquarelli Symonds World University Rankings",
      show: !!data?.qs_rank,
    },
    {
      label: "THE Ranking",
      value: data?.times_higher_education_rank,
      Icon: Medal,
      iconColor: "text-(--danger)",
      desc: "Times Higher Education World University Rankings",
      show: !!data?.times_higher_education_rank,
    },
  ];

  return (
    <div className="space-y-8 p-1 sm:p-5">
      <div className="flex flex-col gap-2">
        <HeadingLine title="Official Rankings & Accreditations" />
        <p className="text-sm text-(--text-color-light) max-w-2xl">
          Recognitions and rankings achieved by{" "}
          <span className="font-semibold">{property?.property_name}</span> from
          leading national and international bodies.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rankingCards
          .filter((card) => card.show)
          .map((card, idx) => {
            const { Icon } = card;
            return (
              <div
                key={idx}
                className="group bg-(--secondary-bg) p-6 rounded-custom shadow-custom transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-(--primary-bg) rounded-lg group-hover:scale-110 transition-transform">
                    <Icon size={24} className={card.iconColor} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-(--main) opacity-60">
                    Official
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-(--text-color-light) mb-1">
                    {card.label}
                  </h3>
                  <p className="text-2xl font-bold text-(--text-emphasis)">
                    {card.value || "N/A"}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-(--border) border-dashed">
                  <p className="text-[11px] leading-tight text-(--text-color-light) opacity-80">
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
