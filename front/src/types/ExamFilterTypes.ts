import { FilterOptionProps } from "./Types";

export interface ExamFilterProps {
  exam_mode: string[];
}

export interface ExpandedExamFiltersProps {
  exam_mode: boolean;
}

export interface FilterExamSearchTermsProps {
  exam_mode: string;
}

export interface DynamicFilterExamOptionsProps {
  examMode: FilterOptionProps[];
}
