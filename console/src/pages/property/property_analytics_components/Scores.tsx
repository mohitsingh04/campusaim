import { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

import { PropertyProps } from "../../../types/types";
import { ScoreChart } from "../../../ui/chart/ScoreChart";
import { API } from "../../../contexts/API";
import { getErrorResponse, getPercentageColor } from "../../../contexts/Callbacks";


export default function Scores({
  currentProperty,
}: {
  currentProperty: PropertyProps | null;
}) {
  const [seoScore, setSeoScore] = useState<any>(0);
  const [propertyScore, setPropertyScore] = useState<any>(0);
  const [loading, setLoading] = useState(true);

  const getScores = useCallback(async () => {
    if (!currentProperty) return;

    setLoading(true);
    try {
      const [seoRes, propertyRes] = await Promise.allSettled([
        API.get(`/property/seo/score/${currentProperty._id}`),
        API.get(`/property/score/${currentProperty._id}`),
      ]);

      if (seoRes.status === "fulfilled") {
        setSeoScore(seoRes.value.data || 0);
      } else {
        getErrorResponse(seoRes.reason, true);
        setSeoScore(0);
      }

      if (propertyRes.status === "fulfilled") {
        setPropertyScore(propertyRes.value.data || 0);
      } else {
        getErrorResponse(propertyRes.reason, true);
        setPropertyScore(0);
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [currentProperty]);

  useEffect(() => {
    getScores();
  }, [getScores]);

  if (loading) {
    return (
      <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {[1, 2].map((i) => (
          <div key={i}>
            <Skeleton height={210} borderRadius={12} />
          </div>
        ))}
      </div>
    );
  }

  const data = [
    {
      name: "Property",
      value: propertyScore?.property_score || 0,
      percentage: 23,
    },
    {
      name: "SEO",
      value: seoScore?.seo_score || 0,
    },
  ];

  return (
    <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
      {data.map((item, index) => (
        <ScoreChart
          heading={`${item.name} Score`}
          key={index}
          name={item.name}
          value={item.value}
          maxValue={100}
          color={getPercentageColor(item.value)}
        />
      ))}
    </div>
  );
}
