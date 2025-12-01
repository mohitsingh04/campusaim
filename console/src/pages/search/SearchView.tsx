import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../../contexts/API";
import ReactApexChart from "react-apexcharts";
import dayjs, { Dayjs } from "dayjs";
import { ChevronsDown } from "lucide-react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { ApexOptions } from "apexcharts";
import { getErrorResponse } from "../../contexts/Callbacks";
import SearchViewSkeleton from "../../ui/loadings/pages/SearchViewSkeleton";

interface SearchEntry {
  date: string;
}

interface SearchResponse {
  search: string;
  searched: SearchEntry[];
}

export default function SearchView() {
  const { objectId } = useParams<{ objectId: string }>();
  const [search, setSearch] = useState<SearchResponse | null>(null);
  const [filter, setFilter] = useState<keyof typeof filterOptions>("all");
  const [compare, setCompare] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const filterOptions: Record<string, number | null> = {
    "7d": 7,
    "14d": 14,
    "1m": 30,
    "6m": 180,
    "1y": 365,
    all: null,
  };

  const getSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get<SearchResponse>(`/search/${objectId}`);
      setSearch(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    getSearch();
  }, [getSearch]);

  useEffect(() => {
    if (compare && filter === "all") {
      setFilter("1y");
    }
  }, [compare, filter]);

  const getFilteredData = (
    daysOffset: number,
    reference: Dayjs = dayjs()
  ): SearchEntry[] => {
    if (!search?.searched) return [];
    return search.searched.filter((entry) => {
      const entryDate = dayjs(entry.date);
      return (
        entryDate.isAfter(reference.subtract(daysOffset, "day")) &&
        entryDate.isBefore(reference)
      );
    });
  };

  const prepareChartData = () => {
    if (!search?.searched) return { series: [], options: {} };

    let currentData: SearchEntry[] = [];
    let previousData: SearchEntry[] = [];

    if (filter === "all") {
      currentData = [...search.searched];
    } else {
      const offset = filterOptions[filter]!;
      currentData = getFilteredData(offset, dayjs());
      if (compare) {
        previousData = getFilteredData(offset, dayjs().subtract(offset, "day"));
      }
    }

    const getDateFormat = () => {
      if (filter === "7d" || filter === "14d") return "YYYY-MM-DD";
      if (filter === "1m" || filter === "6m") return "YYYY-MM";
      if (filter === "1y") return "YYYY";

      const firstDate = search.searched[0]?.date;
      const lastDate = search.searched[search.searched.length - 1]?.date;

      if (!firstDate || !lastDate) return "YYYY-MM-DD";

      const totalDays = dayjs(lastDate).diff(dayjs(firstDate), "day");

      if (totalDays < 30) return "YYYY-MM-DD";
      else if (totalDays < 365) return "YYYY-MM";
      else return "YYYY";
    };

    const format = getDateFormat();

    const groupData = (data: SearchEntry[]): Record<string, number> => {
      const map: Record<string, number> = {};
      data.forEach((entry) => {
        const key = dayjs(entry.date).format(format);
        map[key] = (map[key] || 0) + 1;
      });
      return map;
    };

    const currentMap = groupData(currentData);
    const previousMap = groupData(previousData);

    const allKeys = Array.from(
      new Set([...Object.keys(currentMap), ...Object.keys(previousMap)])
    ).sort();

    const currentSeries = allKeys.map((k) => currentMap[k] || 0);
    const previousSeries = allKeys.map((k) => previousMap[k] || 0);

    const currentLabel = compare
      ? `Current (${dayjs()
          .subtract(filterOptions[filter]!, "day")
          .format("MMM D, YYYY")} - ${dayjs().format("MMM D, YYYY")})`
      : "Searches";

    const previousLabel = compare
      ? `Previous (${dayjs()
          .subtract(filterOptions[filter]! * 2, "day")
          .format("MMM D, YYYY")} - ${dayjs()
          .subtract(filterOptions[filter]!, "day")
          .format("MMM D, YYYY")})`
      : "";

    const labels = allKeys;

    const series = [
      {
        name: currentLabel,
        data: currentSeries,
      },
    ];

    if (compare && previousSeries.length > 0) {
      series.push({
        name: previousLabel,
        data: previousSeries,
      });
    }

    return {
      series,
      options: {
        chart: {
          type: "line" as const,
          height: 320,
          toolbar: { show: false },
        },
        stroke: {
          curve: "smooth" as const,
          width: 3,
        },
        dataLabels: { enabled: true },
        xaxis: {
          categories: labels,
          title: { text: "Time" },
          labels: { style: { colors: labels.map(() => "#6b7280") } },
        },
        grid: {
          borderColor: "#f1f1f1",
          strokeDashArray: 3,
        },
        colors: ["#1d4b99", "#ff5733"],
        legend: { show: true, position: "top", labels: { colors: "#6b7280" } },
      } as ApexOptions,
    };
  };

  const chartData = prepareChartData();

  const dropdownFilters = Object.entries(filterOptions).filter(([key]) =>
    compare ? key !== "all" : true
  );

  const filterLabels: Record<string, string> = {
    "7d": "7 Days",
    "14d": "2 Weeks",
    "1m": "1 Month",
    "6m": "6 Months",
    "1y": "1 Year",
    all: "All Time",
  };

  if (loading) return <SearchViewSkeleton />;

  return (
    <div>
      <Breadcrumbs
        title="Search"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Search", path: "/dashboard/search" },
          { label: search?.search || "" },
        ]}
      />
      <div className="overflow-x-auto mt-5 bg-[var(--yp-primary)] rounded-lg shadow-sm p-6">
        {/* Switch + Dropdown */}
        <div className="flex items-center space-x-4 mb-6">
          {/* Compare Switch */}
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
              />
              <span
                className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none ${
                  compare
                    ? "bg-[var(--yp-green-bg)]"
                    : "bg-[var(--yp-text-secondary)]"
                }`}
              >
                <span
                  className={`inline-block w-5 h-5 transform bg-[var(--yp-primary)] rounded-full shadow-md transition-transform duration-300 ${
                    compare ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </div>
            <span className="ml-3 text-[var(--yp-muted)]">Compare</span>
          </label>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="bg-[var(--yp-secondary)] rounded-md px-3 py-1 text-sm flex items-center justify-between w-36 text-[var(--yp-text-primary)]"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {filterLabels[filter]}
              <ChevronsDown className="w-4 h-4 ml-2 text-[var(--yp-muted)]" />
            </button>
            {dropdownOpen && (
              <ul className="absolute z-10 mt-1 w-full bg-[var(--yp-secondary)] rounded-md shadow-lg">
                {dropdownFilters.map(([key]) => (
                  <li
                    key={key}
                    className="px-3 py-1 text-sm text-[var(--yp-text-primary)] hover:bg-[var(--yp-main)] cursor-pointer"
                    onClick={() => {
                      setFilter(key as keyof typeof filterOptions);
                      setDropdownOpen(false);
                    }}
                  >
                    {filterLabels[key]}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Chart */}
        {chartData.series.length > 0 ? (
          <div className="overflow-hidden rounded-lg border-t border-[var(--yp-border-primary)] p-4 bg-[var(--yp-primary)]">
            <ReactApexChart
              options={chartData.options}
              series={chartData.series}
              type="line"
              height={320}
            />
          </div>
        ) : (
          <p className="text-[var(--yp-muted)] text-center">
            No data available.
          </p>
        )}
      </div>
    </div>
  );
}
