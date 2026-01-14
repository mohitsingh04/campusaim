import { useCallback, useEffect, useState } from "react";
import { generateSlug, getErrorResponse } from "../../../contexts/Callbacks";
import { API } from "../../../contexts/API";
import {
  DashboardOutletContextProps,
  PropertyProps,
} from "../../../types/types";
import { FileTerminal } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function Compares({
  currentProperty,
  allProperties,
}: {
  currentProperty: PropertyProps | null;
  allProperties: PropertyProps[];
}) {
  const [comparedProperties, setComparedProperties] = useState<
    { id: number; count: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { categories } = useOutletContext<DashboardOutletContextProps>();

  // Helper to find category name
  const getCategoryToRelatedId = (id: any) => {
    const category = categories.find((item) => item.uniqueId === Number(id));
    return category ? category.category_name : "Unknown";
  };

  // Fetch compare analytics
  const getCurrentLocation = useCallback(async () => {
    if (!currentProperty?.uniqueId) return;
    try {
      setLoading(true);
      const response = await API.get(
        `/compare/analytic/${currentProperty.uniqueId}?limit=5`
      );
      setComparedProperties(response.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [currentProperty?.uniqueId]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return (
    <div>
      <div className="p-4 space-y-3 bg-[var(--yp-primary)] rounded-2xl shadow-sm items-center justify-center hover:shadow-md transition duration-300 w-full h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-[var(--yp-green-text)]" />
          <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
            Compares
          </h3>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
            <div className="w-10 h-10 border-4 border-t-transparent border-[var(--yp-green-text)] rounded-full animate-spin mb-4"></div>
            <p className="text-[var(--yp-muted)]">Loading compares...</p>
          </div>
        )}

        {/* No Data Found */}
        {!loading && comparedProperties.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
            <FileTerminal className="w-20 h-20 text-[var(--yp-muted)] mb-4" />
            <h2 className="text-lg font-semibold text-[var(--yp-text-primary)] mb-2">
              No Compares Found
            </h2>
            <p className="text-[var(--yp-muted)] max-w-xs">
              This property hasn’t been compared with any other properties yet.
              Once users start comparing it, the analytics will appear here.
            </p>
          </div>
        )}

        {/* Compared Properties */}
        {!loading &&
          comparedProperties.length > 0 &&
          comparedProperties.map((item, i: number) => {
            const mainProperty = allProperties.find(
              (prop) => Number(prop.uniqueId) === item.id
            );

            if (!mainProperty) return null;

            const categoryName = getCategoryToRelatedId(
              mainProperty?.category || ""
            );
            const propertyUrl = `${
              import.meta.env.VITE_MAIN_URL
            }/${generateSlug(categoryName)}/${generateSlug(
              mainProperty?.property_slug || ""
            )}/overview`;

            return (
              <a
                href={propertyUrl}
                key={i}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-[var(--yp-secondary)] flex justify-between items-center hover:shadow transition"
              >
                <div className="flex items-center gap-3">
                  {/* Property Logo */}
                  <img
                    src={
                      mainProperty?.property_logo?.[0]
                        ? `${import.meta.env.VITE_MEDIA_URL}/${
                            mainProperty.property_logo[0]
                          }`
                        : "/img/default-images/ca-property-default.png"
                    }
                    alt={mainProperty?.property_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-[var(--yp-text-primary)]">
                      {mainProperty?.property_name}
                    </div>
                    <div className="text-sm text-[var(--yp-muted)]">
                      {categoryName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-[var(--yp-muted)]">
                  {item.count} Compare
                </div>
              </a>
            );
          })}
      </div>
    </div>
  );
}
