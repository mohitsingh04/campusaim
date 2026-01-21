import { FilterOptionProps } from "./Types";

export interface courseFilterProps {
  course_level: string[];
  course_type: string[];
  certification_type: string[];
  duration: string[];
}

export interface ExpandedCourseFiltersProps {
  course_level: boolean;
  course_type: boolean;
  certification_type: boolean;
  duration: boolean;
}

export interface FilterCourseSearchTermsProps {
  course_type: string;
  certification_type: string;
  course_level: string;
  duration: string;
}

export interface DynamicFilterCourseOptionsProps {
  courseLevels: FilterOptionProps[];
  courseTypes: FilterOptionProps[];
  certificationType: FilterOptionProps[];
  durationsLists: FilterOptionProps[];
}
