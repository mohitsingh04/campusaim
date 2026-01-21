import { FilterOptionProps } from "./Types";

export interface eventFilterProps {
  entrance_type: string[];
  calendar_group: string[];
  event_city: string[];
  event_state: string[];
  event_country: string[];
}

export interface DynamicFilterEventOptionsProps {
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
  entranceTypes: FilterOptionProps[];
  calendarGroups: FilterOptionProps[];
}

export interface ExpandedEventFiltersProps {
  entrance_type: boolean;
  calendar_group: boolean;
  event_city: boolean;
  event_state: boolean;
  event_country: boolean;
}
export interface FilterEventSearchTermsProps {
  entrance_type: string;
  calendar_group: string;
  event_city: string;
  event_state: string;
  event_country: string;
}
