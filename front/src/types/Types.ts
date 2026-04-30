import { FAQProps } from "../../../console/src/types/types";
import { BlogsProps } from "./BlogTypes";
import { NewsProps } from "./NewsTypes";
import { PropertyProps } from "./PropertyTypes";

export interface FaqProps {
  question: string;
  answer: string;
}
export interface CategoryProps {
  uniqueId: number;
  _id: string;
  category_name: string;
  parent_category: string;
}

export interface CourseProps {
  uniqueId: string;
  course_name: string;
  image: string[];
  course_type: string;
  course_short_name: string;
  duration: string;
  course_level: string;
  description: string;
  [key: string]: any;
  property_id: string;
  key_outcomes: string[];
  requirements: string[];
  best_for: string[];
  course_slug?: string;
  faqs: FaqProps[];
}

export interface ExamProps {
  _id: string;
  exam_name: string;
  exam_short_name: string;
  upcoming_exam_date: string;
  result_date: string;
  application_form_date: string;
  youtube_link: string;
  exam_form_link: string;
  exam_mode: string;
  slug: string;
  description: string;
  image: string[];
  application_form_link: string;
  isDeleted: boolean;
  status: string;
  faqs: FAQProps;
}

export interface EventProps {
  _id: string;
  title: string;
  category: string[];
  event_city: string;
  event_state: string;
  event_country: string;
  status: string;
  event_slug: string;
  featured_image: string[];
  entrance_type: string;
  calendar_group: string;
  schedule: { date: string; start_time: string; end_time: string }[];
  event_description: string;
  description: string;
  language: string[];
  ticket_booking: { start: string; end: string };
  age_limit: { min: number; max: number };
  event_partners: {
    name: string;
    logo: string[];
  }[];
  host: {
    name: string;
    image: string[];
  };
  event_host_url: string;
}

export interface SeoProps {
  event_id: string;
  course_id: string;
  blog_id: string;
  exam_id: string;
  news_id: string;
  slug: string;
}

export interface PriceProps {
  INR: string;
  USD: string;
  EUR: string;
}

export type WorkingHoursPerDayTypes = {
  open?: string;
  close?: string;
};

export type WorkingHoursDataTypes = {
  [day in
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"]?: WorkingHoursPerDayTypes;
};

export interface FilterOptionProps {
  name: string;
  count: number;
}

export interface CategoryOptionProps {
  name: string;
  value: string;
  count: number;
}

export interface RatingCount {
  rating: number;
  count: number;
}

export interface CountryProps {
  country_name: string;
}
export interface StateProps {
  name: string;
  country_name: string;
}
export interface CityProps {
  name: string;
  state_name: string;
}

export type SearchResult =
  | (PropertyProps & { type: "property" })
  | (CourseProps & { type: "course" })
  | (BlogsProps & { type: "blog" })
  | (NewsProps & { type: "news-and-updates" })
  | (EventProps & { type: "events" })
  | { type: "queries"; keyword: string };

export interface SimpleLocationProps {
  property_id?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface RetreatProps {
  retreat_name: string;
}

export interface FieldDataSimple {
  title: string;
  value: number;
}
export interface TokenConfimationProps {
  loading: boolean;
  success: boolean;
  error: string;
  title: string;
  message: string;
}
