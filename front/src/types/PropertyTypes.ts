import { PriceProps } from "./Types";

export interface PropertyProps {
  objectId: string;
  _id: string;
  uniqueId: number;
  verified: boolean;
  rank: number;
  lastRank: number;
  claimed: boolean;
  property_email: string;
  property_mobile_no: string;
  category_id: string;
  featured_image: string[];
  property_name: string;
  category: string;
  property_address: string;
  property_pincode: string;
  property_city: string;
  property_state: string;
  property_country: string;
  property_description: string;
  property_slug: string;
  property_logo: string[];
  address: string;
  pincode: number;
  city: string;
  state: string;
  country: string;
  est_year: string;
  property_type: string;
  reviews?: PropertyReviewProps[];
  courses: PropertyCourseProps[];
  gallery: string[] | PropertyGalleryProps[];
  property_url: string;
  accomodation: PropertyAccommodationProps[];
  amenities: AmenitiesProps;
  working_hours: PropertyWorkingHoursProps[];
  faqs: PropertyFaqProps[];
  coupons: PropertyCouponsProps[];
  hiring: PropertyHiringProps[];
  status: string;
  teachers: PropertyTeacherProps[];
  certification: string[];
  average_rating?: number;
  total_reviews?: number;
  academic_type?: string[];
}

export interface PropertyCourseProps {
  course_id: string;
  property_id: string;
  [key: string]: unknown;
  course_name: string;
  course_short_name: string;
  course_level: string;
  course_type: string;
  course_format: string;
  certification_type: string;
  duration: string;
  image: string[];
}

export interface PropertyReviewProps {
  uniqueId?: number;
  property_id?: string | number;
  name?: string;
  rating?: number;
  review?: string;
  createdAt?: string;
}

export interface PropertyLocationProps {
  property_address: string;
  property_pincode: string;
  property_id: string;
  property_city?: string;
  property_state?: string;
  property_country?: string;
}

export interface PropertyGalleryProps {
  property_id: string;
  title: string;
  gallery: string[];
}

export interface PropertyAccommodationProps {
  property_id: string;
  accomodation_name: string;
  accomodation_description: string;
  accomodation_images: string[];
  accomodation_price: PriceProps;
}

export interface AmenityItemObject {
  [key: string]: true | string | string[];
}

export interface AmenitiesProps {
  [category: string]: AmenityItemObject[];
}

export interface PropertyAmenities {
  propertyId: number;
  selectedAmenities: AmenitiesProps;
}

export interface PropertyWorkingHoursProps {
  property_id?: string;
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface PropertyTeacherProps {
  property_id: string;
  teacher_name: string;
  designation: string;
  experience: string;
  profile: string[];
}

export interface PropertyFaqProps {
  property_id: string;
  question: string;
  answer: string;
}

export interface PropertyCouponsProps {
  property_id: string;
  coupon_code: string;
  discount: number;
  description: string;
  start_from: string;
  valid_upto: string;
}

export interface PropertyHiringProps {
  property_id: string;
  _id: string;
  title: string;
  job_type: string;
  job_description: string;
  experience: string;
  salary: PriceProps;
  start_date: string;
  end_date: string;
  skills: string[];
  qualification: string[];
}

export interface PropertyRankProps {
  property_id?: string;
  rank?: number;
  lastRank?: number;
  overallScore?: number;
}

export interface PropertySeoProps {
  json_schema?: string;
}
