import { FilterOptionProps } from "./Types";

export interface ExamFilterProps {
  exam_mode: string[];
  exam_type: string[];
  exam_tag: string[];
  upcoming_exam_month: string[];
  result_month: string[];
  application_month: string[];
}

export interface ExpandedExamFiltersProps {
  exam_mode: boolean;
  exam_type: boolean;
  exam_tag: boolean;
  upcoming_exam_month: boolean;
  result_month: boolean;
  application_month: boolean;
}

export interface FilterExamSearchTermsProps {
  exam_mode: string;
  exam_type: string;
  exam_tag: string;
  upcoming_exam_month: string;
  result_month: string;
  application_month: string;
}

export interface DynamicFilterExamOptionsProps {
  examMode: FilterOptionProps[];
  examType: FilterOptionProps[];
  examTag: FilterOptionProps[];
  upcomingExamMonths: FilterOptionProps[];
  resultMonths: FilterOptionProps[];
  applicationMonth: FilterOptionProps[];
}
