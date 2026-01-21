import { CategoryOptionProps, FilterOptionProps, RatingCount } from "./Types";

export interface DynamicFilterOptionsProps {
  countries: FilterOptionProps[];
  getStatesForCountries: (selectedCountries?: string[]) => string[];
  getCitiesForLocation: (
    selectedCountries?: string[],
    selectedStates?: string[]
  ) => string[];
  getStatesWithCounts: (selectedCountries?: string[]) => FilterOptionProps[];
  getCitiesWithCounts: (
    selectedCountries?: string[],
    selectedStates?: string[]
  ) => FilterOptionProps[];
  courseNames: FilterOptionProps[];
  courseLevels: FilterOptionProps[];
  courseTypes: FilterOptionProps[];
  courseFormats: FilterOptionProps[];
  categories: CategoryOptionProps[];
  propertyTypes: CategoryOptionProps[];
  ratingCounts: RatingCount[];
}

export interface FiltersProps {
  country: string[];
  state: string[];
  city: string[];
  course_name: string[];
  course_level: string[];
  course_type: string[];
  course_format: string[];
  rating: string[];
  category: string[];
  property_type: string[];
}

export interface ExpandedFiltersProps {
  country: boolean;
  state: boolean;
  city: boolean;
  course_name: boolean;
  course_level: boolean;
  course_type: boolean;
  course_format: boolean;
  rating: boolean;
  category: boolean;
  property_type: boolean;
}

export interface FilterSearchTermsProps {
  country: string;
  state: string;
  city: string;
  course_name: string;
  course_level: string;
  course_type: string;
  course_format: string;
  category: string;
  property_type: string;
}
