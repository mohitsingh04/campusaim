import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { Column, DashboardOutletContextProps } from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Eye, Trophy } from "lucide-react";
import { getErrorResponse, matchPermissions } from "../../contexts/Callbacks";
import { useOutletContext } from "react-router-dom";
import { IoMdTrendingUp, IoMdTrendingDown } from "react-icons/io";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

interface CombinedSearch extends Record<string, unknown> {
  uniqueId: number;
  search: string;
  keyword_count: number;
  all_time_searched: number; // NEW FIELD
  trends: string;
  _id: string;
  rank?: number;
  rankGroup?: string;
}

export function SearchList() {
  const [allSearch, setAllSearch] = useState<CombinedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getAllSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/search");
      const appearResponse = await API.get("/search/appearences/all");

      const searchDocs = response.data as Array<any>;
      const appearDocs = appearResponse.data as Array<any>;

      const bySearchId = new Map<number, any>();
      for (const a of appearDocs) bySearchId.set(a.searchId, a);

      // Date ranges
      const now = new Date();
      const endCurrent = new Date(now);
      const startCurrent = new Date(now);
      startCurrent.setDate(startCurrent.getDate() - 30);

      const endPrevious = new Date(startCurrent);
      const startPrevious = new Date(startCurrent);
      startPrevious.setDate(startPrevious.getDate() - 30);

      const merged: CombinedSearch[] = searchDocs.map((s) => {
        const match = bySearchId.get(s.uniqueId);

        let currentCount = 0;
        let previousCount = 0;
        let allTimeCount = 0;

        if (match && Array.isArray(match.searched)) {
          for (const item of match.searched) {
            const d = new Date(item.date);

            // Count all time
            allTimeCount++;

            // Last 30 days
            if (d >= startCurrent && d <= endCurrent) {
              currentCount++;
            }
            // Previous 30 days
            else if (d >= startPrevious && d < endPrevious) {
              previousCount++;
            }
          }
        }

        let trends = "0%";
        if (previousCount === 0 && currentCount > 0) {
          trends = "+100%";
        } else if (previousCount > 0) {
          const diffPct =
            ((currentCount - previousCount) / previousCount) * 100;
          trends = `${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(1)}%`;
        }

        return {
          uniqueId: s.uniqueId,
          search: s.search,
          keyword_count: currentCount,
          all_time_searched: allTimeCount, // SAVE HERE
          trends,
          _id: s._id,
          createdAt: s?.createdAt,
        };
      });

      // Sort by last month searched
      merged.sort((a, b) => b.keyword_count - a.keyword_count);

      // Dense ranking
      let denseRank = 0;
      let prevCount: number | null = null;

      for (const item of merged) {
        if (prevCount === null || item.keyword_count !== prevCount) {
          denseRank += 1;
        }
        item.rank = denseRank;
        prevCount = item.keyword_count;
      }

      // Rank group
      for (const item of merged) {
        const r = item.rank ?? Number.POSITIVE_INFINITY;
        let group = "N/A";
        if (r <= 3) group = "Top 3";
        else if (r <= 5) group = "Top 5";
        else if (r <= 10) group = "Top 10";
        else if (r <= 15) group = "Top 15";
        else if (r <= 30) group = "Top 30";
        item.rankGroup = group;
      }

      setAllSearch(merged);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllSearch();
  }, [getAllSearch]);

  // TABLE COLUMNS
  const columns = useMemo<Column<CombinedSearch>[]>(
    () => [
      {
        label: "Rank Group",
        value: (row) => (
          <div className="flex flex-col items-start justify-start capitalize">
            <p className="text-[var(--yp-text-primary)] mb-2">{row?.search}</p>
            {row.rankGroup !== "N/A" ? (
              <div className="bg-[var(--yp-green-bg)] text-[var(--yp-green-text)] text-xs flex p-1 gap-1 rounded items-center">
                <Trophy className="w-3 h-3" />
                <p>{row.rankGroup}</p>
              </div>
            ) : (
              <p className="text-[var(--yp-muted)]">{row.rankGroup}</p>
            )}
          </div>
        ),
        key: "rankGroup",
        sortingKey: "search",
      },
      {
        label: "Trends (Last 30 Days)",
        value: (row) => {
          const isPositive = row.trends.startsWith("+");
          return (
            <div
              className={`flex space-x-2 ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-[var(--yp-muted)]"
              }`}
            >
              {isPositive ? (
                <IoMdTrendingUp className="w-5 h-5" />
              ) : (
                <IoMdTrendingDown className="w-5 h-5" />
              )}
              <p>{row.trends}</p>
            </div>
          );
        },
        key: "trends",
        sortingKey: "trends",
      },
      {
        label: "Searched (Last 30 Days)",
        value: (row) => (
          <div className="flex space-x-2">
            <p>{row.keyword_count}</p>
          </div>
        ),
        key: "searched",
        sortingKey: "keyword_count",
      },
      {
        label: "Searched (All Time)",
        value: (row) => (
          <div className="flex space-x-2">
            <p>{row.all_time_searched}</p>
          </div>
        ),
        key: "all_time_searched",
        sortingKey: "all_time_searched",
      },
      {
        label: "Actions",
        value: (row) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read Search") && (
                  <TableButton
                    Icon={Eye}
                    color="blue"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/search/${row._id}`}
                  />
                )}
              </>
            )}
          </div>
        ),
        key: "actions",
      },
    ],
    [authLoading, authUser?.permissions]
  );

  if (loading) return <TableSkeletonWithOutCards />;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Searches"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Searches" },
        ]}
      />

      <DataTable<CombinedSearch>
        data={allSearch}
        columns={columns}
        searchFields={["search"]}
        defaultRowsPerPage={20}
        rowsPerPageOptions={[20, 50, 100, 200]}
        includeExportFields={[
          "search",
          "keyword_count",
          "all_time_searched",
          "trends",
          "rankGroup",
        ]}
      />
    </div>
  );
}
