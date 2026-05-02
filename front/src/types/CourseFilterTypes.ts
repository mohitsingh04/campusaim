import { FilterOptionProps } from "./Types";

export interface courseFilterProps {
  course_type: string[];
  duration: string[];
  program_type: string[];
  degree_type: string[];
  specialization: string[];
}

export interface ExpandedCourseFiltersProps {
  course_type: boolean;
  duration: boolean;
  degree_type: boolean;
  program_type: boolean;
  specialization: boolean;
}

export interface FilterCourseSearchTermsProps {
  course_type: string;
  duration: string;
  program_type: string;
  degree_type: string;
  specialization: string;
}

export interface DynamicFilterCourseOptionsProps {
  courseTypes: FilterOptionProps[];
  durationsLists: FilterOptionProps[];
  degreeTypes: FilterOptionProps[];
  programTypes: FilterOptionProps[];
  specializationList: FilterOptionProps[];
}
