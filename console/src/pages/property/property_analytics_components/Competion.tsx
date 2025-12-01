import { useCallback, useEffect, useState } from "react";
import { API } from "../../../contexts/API";
import {
  DashboardOutletContextProps,
  PropertyProps,
} from "../../../types/types";
import { generateSlug, getErrorResponse } from "../../../contexts/Callbacks";
import Skeleton from "react-loading-skeleton";
import { FileTerminal } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function Competition({
  currentProperty,
  allProperties,
}: {
  currentProperty: PropertyProps | null;
  allProperties: PropertyProps[];
}) {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories } = useOutletContext<DashboardOutletContextProps>();

  const getCategoryToRelatedId = (id: number) => {
    const category = categories.find((item) => item.uniqueId === Number(id));
    return category ? category.category_name : "Unknown";
  };

  const getCurrentLocation = useCallback(async () => {
    if (currentProperty) {
      try {
        const response = await API.get(
          `/property/location/${currentProperty?.uniqueId}`
        );
        setCurrentLocation(response.data);
      } catch (error) {
        getErrorResponse(error, true);
      }
    }
  }, [currentProperty]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const getAllLocations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/locations`);
      const data = response.data;
      let filtered = data;

      if (currentLocation) {
        filtered = data.filter(
          (item: any) =>
            item.property_id !== currentLocation.property_id &&
            item.property_city === currentLocation.property_city
        );
      }

      const combined = filtered
        .map((location: any) => {
          const matchedProperty = allProperties.find(
            (property: any) =>
              property.uniqueId === Number(location.property_id)
          );
          if (matchedProperty) {
            return { location, property: matchedProperty };
          }
          return null;
        })
        .filter((item: any) => item !== null);

      setCompetitions(combined.slice(0, 5));
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, allProperties]);

  useEffect(() => {
    getAllLocations();
  }, [getAllLocations]);

  if (loading) {
    return (
      <div>
        <Skeleton height={430} borderRadius={12} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3  bg-[var(--yp-primary)] rounded-2xl shadow-sm items-center justify-center hover:shadow-md transition duration-300 w-full h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-1 h-4 rounded-full bg-orange-400`} />
        <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
          Competions
        </h3>
      </div>
      {competitions.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
          <FileTerminal className="w-20 h-20 text-[var(--yp-muted)] mb-4" />
          <h2 className="text-lg font-semibold text-[var(--yp-text-primary)] mb-2">
            No Competitors Found
          </h2>
          <p className="text-[var(--yp-muted)] max-w-xs">
            We couldn’t find any competing properties in this location. Try
            imporve your information.
          </p>
        </div>
      )}
      {competitions.map((item: any, i: number) => (
        <a
          href={`${import.meta.env.VITE_MAIN_URL}/${generateSlug(
            getCategoryToRelatedId(item.property.category)
          )}/${generateSlug(item?.property?.property_slug)}/overview`}
          key={i}
          target="_blank"
          className="p-3 rounded-lg bg-[var(--yp-secondary)] flex justify-between items-center hover:shadow transition"
        >
          <div className="flex items-center gap-3">
            {/* Property Logo */}
            <img
              src={
                item?.property?.property_logo?.[0]
                  ? `${import.meta.env.VITE_MEDIA_URL}/${
                      item?.property?.property_logo?.[0]
                    }`
                  : "/img/default-images/yp-property-logo.webp"
              }
              alt={item.property.property_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-[var(--yp-text-primary)]">
                {item.property.property_name}
              </div>
              <div className="text-sm text-[var(--yp-muted)]">
                {getCategoryToRelatedId(item.property.category)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--yp-muted)]">
            {item.location.property_city}
          </div>
        </a>
      ))}
    </div>
  );
}
