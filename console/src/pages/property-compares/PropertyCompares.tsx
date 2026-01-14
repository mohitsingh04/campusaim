import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import { getErrorResponse } from "../../contexts/Callbacks";
import TableSkeletonWithCards from "../../ui/loadings/pages/TableSkeletonWithCards";
import { PropertyProps } from "../../types/types";
import { Link } from "react-router-dom";

export default function PropertyCompares() {
  const [compares, setCompares] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getAllProperties = useCallback(async () => {
    try {
      const [propertyRes, locationRes] = await Promise.allSettled([
        API.get("/property"),
        API.get("/locations"),
      ]);

      if (propertyRes.status !== "fulfilled") throw propertyRes.reason;

      const properties = propertyRes.value.data || [];
      const locations =
        locationRes.status === "fulfilled" ? locationRes.value.data : [];

      const finalData = properties.map((item: PropertyProps) => {
        const matchedLocation = locations.find(
          (loc: any) => Number(loc?.property_id) === Number(item?.uniqueId)
        );

        return {
          ...item,
          city: matchedLocation?.property_city ?? "",
          state: matchedLocation?.property_state ?? "",
          country: matchedLocation?.property_country ?? "",
        };
      });

      setAllProperties(finalData);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  const getCompares = useCallback(async () => {
    try {
      const compareRes = await API.get("/compare");
      setCompares(compareRes.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([getAllProperties(), getCompares()]);
      setLoading(false);
    })();
  }, [getAllProperties, getCompares]);

  const getProperty = useCallback(
    (uniqueId: number) =>
      allProperties.find((p) => Number(p.uniqueId) === Number(uniqueId)),
    [allProperties]
  );

  const mergedCompares = useMemo(() => {
    const map = new Map<string, { properties: number[]; count: number }>();

    for (const compare of compares) {
      const rawProps = Array.isArray(compare.properties)
        ? compare.properties
        : [];

      const normalized: number[] = Array.from(
        new Set(
          rawProps
            .map((id: any) => {
              const n = Number(id);
              return Number.isFinite(n) ? n : null;
            })
            .filter((v: number | null): v is number => v !== null)
        )
      );

      if (!normalized.length) continue;

      normalized.sort((a, b) => a - b);
      const key = normalized.join(",");

      const incomingCount =
        Number(compare.count) && Number(compare.count) > 0
          ? Number(compare.count)
          : 1;

      if (map.has(key)) {
        map.get(key)!.count += incomingCount;
      } else {
        map.set(key, { properties: normalized, count: incomingCount });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [compares]);

  const compareRows = useMemo(() => {
    return mergedCompares.map((item, index) => {
      const mappedProps = (item.properties || [])
        .map((uid: number) => getProperty(uid))
        .filter(Boolean);

      return {
        _id: `compare-${index}`,
        count: item.count ?? 0,
        propertyList: mappedProps,
      };
    });
  }, [mergedCompares, getProperty]);

  const maxColumns = useMemo(() => {
    return Math.max(
      0,
      ...mergedCompares.map((c) =>
        Array.isArray(c.properties) ? c.properties.length : 0
      )
    );
  }, [mergedCompares]);

  const columns = useMemo(() => {
    const cols: any[] = [];

    for (let i = 0; i < maxColumns; i++) {
      cols.push({
        key: `property_${i + 1}`,
        label: `Property ${i + 1}`,
        value: (row: any) => {
          const property = row.propertyList?.[i];
          if (!property) return <span className="text-gray-400">—</span>;

          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0">
                <img
                  src={
                    property?.property_logo?.[0]
                      ? `${import.meta.env.VITE_MEDIA_URL}/${
                          property?.property_logo[0]
                        }`
                      : "/img/default-images/ca-property-default.png"
                  }
                  alt={property?.property_name}
                  className="w-10 h-10 rounded-full border border-[var(--yp-border-primary)] object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <Link
                  to={`/dashboard/property/${property?._id}`}
                  className="font-semibold text-[var(--yp-text-primary)] hover:text-[var(--yp-primary)]"
                >
                  {property?.property_name}
                </Link>
                <p className="text-xs text-[var(--yp-text-secondary)] truncate">
                  {property?.city} {property?.state} {property?.country}
                </p>
              </div>
            </div>
          );
        },
      });
    }
    cols.push({
      key: "count",
      label: "Count",
      value: (row: any) => (
        <span className="font-semibold text-[var(--yp-text-primary)]">
          {row.count ?? 0}
        </span>
      ),
      sortingKey: "count",
    });

    return cols;
  }, [maxColumns]);

  if (loading) return <TableSkeletonWithCards />;

  if (!compareRows.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No compare data found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Property Compares"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Compares" },
        ]}
      />

      <DataTable
        data={compareRows}
        columns={columns}
        tabFilters={[]}
        searchInput={false}
      />
    </div>
  );
}
