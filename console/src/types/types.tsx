export interface UserProps extends Record<string, unknown> {
  username: string;
  name: string;
  email: string;
  mobile_no: string;
  role: string;
  verified: boolean;
  status: string;
  createdAt: string;
  permissions: string[];
  address: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  avatar: string[];
  uniqueId: number;
}

export interface ReqKoItem {
  _id: string;
  best_for?: string;
  course_eligibility?: string;
  uniqueId?: string; // 👈 make optional
}
export interface ReviewProps {
  uniqueId?: number;
  property_id?: string | number;
  name?: string;
  rating?: number;
  review?: string;
  createdAt?: string;
}

export interface SupportProps extends Record<string, unknown> {
  _id: string;
  status: string;
  userId: any;
  subject: string;
  ended: boolean;
}

export interface EnquiryProps extends Record<string, unknown> {
  status: string;
  _id: string;
}
export interface ReqKoItem {
  _id: string;
  requirment?: string;
  key_outcome?: string;
  uniqueId?: string; // 👈 make optional
}

export interface Column<T> {
  value: keyof T | ((row: T) => React.JSX.Element);
  label: string;
  key?: string;
}

export interface CityProps {
  name: string;
  state_name: string;
}

export interface StateProps {
  country_name: string;
  name: string;
}

export interface CountryProps {
  country_name: string;
}

export interface DashboardOutletContextProps {
  authUser: UserProps | null;
  authLoading: boolean;
  status: StatusProps[];
  categories: CategoryProps[];
  getRoleById: (id: string) => string | undefined;
  roles: RoleProps[];
}

export interface StatusProps extends Record<string, unknown> {
  _id: string;
  name: string;
  parent_status: string;
  createdAt: string;
  description: string;
}

export interface TeacherProps {
  _id?: string;
  teacher_name: string;
  designation: string;
  department: string;
  experience: string;
  profile?: string[];
  status: string;
}

export interface CategoryProps extends Record<string, unknown> {
  _id: string;
  uniqueId: number;
  category_name: string;
  parent_category: string;
  createdAt: string;
  description: string;
  status: string;
  category_icon: string[];
  featured_image: string[];
}

export interface BlogProps extends Record<string, unknown> {
  _id: string;
  uniqueId: number;
  title: string;
  createdAt: string;
  status: string;
  blog: string;
  tags: string[];
  category: string[];
  seo_score: number;
  featured_image: string[];
}
export interface BlogCategoryProps extends Record<string, unknown> {
  _id: string;
  createdAt: string;
  status: string;
}
export interface SearchProps extends Record<string, unknown> {
  _id: string;
  search: string;
  createdAt: string;
}

export interface CourseProps extends Record<string, unknown> {
  _id: string;
  uniqueId: string;
  course_name: string;
  course_short_name: string;
  specialization: string;
  description: string;
  createdAt: string;
  status: string;
  course_type: string;
  degree_type: string;
  duration: string;
  duration_value: string;
  program_type: string;
  course_eligibility: string[];
  duration_type: string;
  best_for: string[];
  image: string[];
  isDeleted: boolean;
  seo_score: number;
}

export interface ExamProps extends Record<string, unknown> {
  _id: string;
  exam_name: string;
  exam_short_name: string;
  exam_type: string;
  exam_sub_type: string;
  exam_tag: string[];
  upcoming_exam_date: { date: string; is_tentative: boolean };
  result_date: { date: string; is_tentative: boolean };
  application_form_date: { start: string; end: string; is_tentative: boolean };
  youtube_link: string;
  application_form_link: string;
  exam_form_link: string;
  exam_mode: string;
  description: string;
  image: string[];
  answer_sheet: string;
  isDeleted: boolean;
  seo_score: number;
  status: string;
  faqs: FAQProps;
}

export interface ScholarshipProps extends Record<string, unknown> {
  _id: string;
  userId: string;
  scholarship_title: string;
  slug: string;
  scholarship_description: string;
  scholarship_type: string;
  age_criteria: {
    min?: number;
    max?: number;
  };
  qualification?: string;
  marks: {
    min?: number;
    max?: number;
  };
  location: string[];
  card: string[];
  gender: string[];
  cast: string[];
  religion: string[];
  entrance_exam: string[];
  sports_quotas: boolean;
  scholarship_exam?: boolean;
  scholarship_link?: string;
  scholarship_amount?: Record<string, number>;
  army_quota: boolean;
  annual_income?: Record<string, number>;
  start_date?: string;
  end_date?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  seo_score: number;
}

export interface PropertyProps extends Record<string, unknown> {
  _id: string;
  uniqueId: number;
  property_name: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  property_logo: string[];
  property_slug: string;
  property_description: string;
  property_email: string;
  property_type: string;
  school_type: string;
  rank: string;
  lastRank: string;
  score: number;
  city: string;
  property_city: string;
  state: string;
  property_state: string;
  country: string;
  property_country: string;
  property_address: string;
  property_pincode: string;
}
export interface FeedbackProps extends Record<string, unknown> {
  _id: string;
  status: string;
  createdAt: string;
}

export interface NewsProps extends Record<string, unknown> {
  _id: string;
  title: string;
  featured_image: string[];
  status: string;
  createdAt: string;
  author: UserProps;
  content: string;
  publish_date: string;
  seo_score: number;
}

export interface FAQProps {
  _id: string;
  question: string;
  answer: string;
  property_id: number;
}

export interface QnAProps {
  _id: string;
  question: string;
  answer: string;
  property_id: number;
}
// ../../types/types.ts
export interface PermissionProps {
  _id: string;
  name: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SeoProps {
  _id: string;
  title: string;
  slug: string;
  primary_focus_keyword: string[];
  json_schema: string;
  meta_description: string;
}

export interface RoleProps {
  _id: string;
  role: string;
}
