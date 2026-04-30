"use client";

import { PropertyLocationProps, PropertyProps } from "@/types/PropertyTypes";
import { createContext, useContext } from "react";

interface PropertyContextType {
  property: PropertyProps;
  location: PropertyLocationProps | null;
}

const PropertyContext = createContext<PropertyContextType | null>(null);

export function PropertyProvider({
  children,
  property,
  location,
}: {
  children: React.ReactNode;
  property: PropertyProps;
  location: PropertyLocationProps | null;
}) {
  return (
    <PropertyContext.Provider value={{ property, location }}>
      {children}
    </PropertyContext.Provider>
  );
}

export const useGetPropertyDetails = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("useGetPropertyDetails must be used within a PropertyProvider");
  }
  return context;
};
