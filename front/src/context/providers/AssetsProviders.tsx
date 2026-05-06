"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../API";
import { getErrorResponse } from "../Callbacks";
import { CategoryProps } from "@/types/Types";

interface AssetsContextType {
  allCategories: CategoryProps[];
  isLoading: boolean;
  getCategoryById: (id: string) => string | undefined;
  refetchCategories: () => void;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({ children }: { children: ReactNode }) {
  const {
    data: allCategories = [],
    isLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await API.get(`/category`);
        return response?.data || [];
      } catch (err) {
        getErrorResponse(err, true);
        throw err;
      }
    },
  });

  const getCategoryById = useCallback(
    (id: string) => {
      if (!id) return undefined;
      const cat = allCategories?.find(
        (item: CategoryProps) => String(item._id) === String(id),
      );
      return cat?.category_name;
    },
    [allCategories],
  );

  const value = useMemo(
    () => ({
      allCategories,
      isLoading,
      getCategoryById,
      refetchCategories,
    }),
    [allCategories, isLoading, getCategoryById, refetchCategories],
  );

  return (
    <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>
  );
}

export function useGetAssets() {
  const context = useContext(AssetsContext);
  if (context === undefined) {
    throw new Error("useGetAssets must be used within an AssetsProvider");
  }
  return context;
}
