import Scores from "./property_analytics_components/Scores";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { PropertyProps } from "../../types/types";
import { API } from "../../contexts/API";
import { getErrorResponse } from "../../contexts/Callbacks";
import MetricCard from "../../ui/cards/MetricCard";
import { FaRankingStar } from "react-icons/fa6";
import { MdAppRegistration } from "react-icons/md";
import TrafficMetricCard from "./property_analytics_components/TrafficCountCard";
import EnquiryMetricCard from "./property_analytics_components/EnquiryCountCard";
import Competition from "./property_analytics_components/Competion";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import AnalyticGraph from "./property_analytics_components/AnalyticGraph";
import AnalyticEnquiryTable from "./property_analytics_components/AnalyticEnquiryTable";
import Skeleton from "react-loading-skeleton";
import DashboardSkeleton from "../../ui/loadings/pages/DashboardSkeleton";
import Compares from "./property_analytics_components/Compares";

const Analytics = () => {
  const { objectId } = useParams();
  const [allProperties, setAllProperties] = useState<PropertyProps[]>([]);
  const [currentProperty, setCurrentProeprty] = useState<PropertyProps | null>(
    null
  );
  const [currentPropertyRank, setCurrentPropertyRank] = useState<any>("");
  const [rankLoading, setRankLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const getCurrentPropertyRank = useCallback(async () => {
    setRankLoading(true);
    if (currentProperty) {
      try {
        const response = await API.get(
          `/property/rank/${currentProperty?._id}`
        );
        setCurrentPropertyRank(response.data);
      } catch (error) {
        getErrorResponse(error, true);
      } finally {
        setRankLoading(false);
      }
    }
  }, [currentProperty]);

  useEffect(() => {
    getCurrentPropertyRank();
  }, [getCurrentPropertyRank]);

  const AssignRank = useCallback(async () => {
    try {
      const response = await API.get(`/analytics/rank/all`);
      console.log(response.data.message);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    AssignRank();
  }, [AssignRank]);

  const getAllProperties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/property`);
      const data = response.data;
      setAllProperties(data);
      setCurrentProeprty(
        data?.find((item: PropertyProps) => item._id === objectId)
      );
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    getAllProperties();
  }, [getAllProperties]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <Breadcrumbs
        title="Property"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Property", path: "/dashboard/property" },
          {
            label: currentProperty?.property_name || "",
            path: `/dashboard/property/${currentProperty?._id}`,
          },
          { label: "Analytics" },
        ]}
      />
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-2">
        {!rankLoading ? (
          <MetricCard
            title="Rank"
            value={currentPropertyRank?.rank}
            changeText={`Your Previous Rank is ${
              currentPropertyRank?.lastRank || "last"
            }`}
            changeType={
              currentPropertyRank?.rank < currentPropertyRank?.lastRank
                ? "up"
                : "down"
            }
            barColor="text-blue-500"
            icon={FaRankingStar}
          />
        ) : (
          <Skeleton height={150} />
        )}
        <MetricCard
          title="Enrollments"
          value={0}
          barColor="text-green-500"
          icon={MdAppRegistration}
        />
        <TrafficMetricCard currentProperty={currentProperty} />
        <EnquiryMetricCard currentProperty={currentProperty} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-2 my-2">
        <div>
          <Scores currentProperty={currentProperty} />
        </div>
        <div>
          <AnalyticGraph currentProperty={currentProperty} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 my-2">
        <Compares
          currentProperty={currentProperty}
          allProperties={allProperties}
        />
        <Competition
          currentProperty={currentProperty}
          allProperties={allProperties}
        />
      </div>
      <AnalyticEnquiryTable property={currentProperty} />
    </div>
  );
};

export default Analytics;
