import { CategoryOptionProps, FilterOptionProps, RatingCount } from "./Types";

export interface DynamicFilterOptionsProps {
  countries: FilterOptionProps[];
  getStatesForCountries: (selectedCountries?: string[]) => string[];
  getCitiesForLocation: (
    selectedCountries?: string[],
    selectedStates?: string[],
  ) => string[];
  getStatesWithCounts: (selectedCountries?: string[]) => FilterOptionProps[];
  getCitiesWithCounts: (
    selectedCountries?: string[],
    selectedStates?: string[],
  ) => FilterOptionProps[];
  courseNames: FilterOptionProps[];
  courseLevels: FilterOptionProps[];
  courseTypes: FilterOptionProps[];
  courseFormats: FilterOptionProps[];
  propertyTypes: CategoryOptionProps[];
  affiliatedBy: CategoryOptionProps[];
  approvedBy: CategoryOptionProps[];
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
  affiliated_by: string[];
  approved_by: string[];
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
  affiliated_by: boolean;
  approved_by: boolean;
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
  affiliated_by: string;
  approved_by: string;
  property_type: string;
}
