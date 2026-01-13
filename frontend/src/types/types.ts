import { IconType } from "react-icons";

export type ColorKey = "blue" | "green" | "purple" | "orange";

export interface CategoryItem {
	icon: IconType;
	title: string;
	description: string;
	linkText: string;
	color: ColorKey;
	link: string;
}

export interface EventProps {
	uniqueId: number;
	title: string;
	description: string;
	featured_image: string[];
	status: string;
	createdAt: string;
	category: number[] | string[];
	event_date: string;
	event_time: string;
	schedule: { date: string; start_time: string; end_time: string }[];
	event_partners: { logo: string[]; name: string }[];
	ticket_booking: { start: string; end: string };
	host: { name: string; image: string[] };
	price: PriceProps;
	language: string[];
	event_address: string;
	event_pincode: string;
	event_city: string;
	event_state: string;
	event_country: string;
}

export interface NewsProps {
	_id: string;
	title: string;
	content: string;
	featured_image: string[];
	publish_date: string;
	author: string;
	status: string;
}
export interface CourseProps {
	uniqueId: string;
	course_name: string;
	image: string[];
	course_type: string;
	course_short_name: string;
	duration: string;
	description: string;
	[key: string]: unknown;
	property_id: string;
	course_format: string;
	key_outcomes: string[];
	requirements: string[];
	best_for: string[];
	specialization?: string;
	program_type: string[];
	certification_type: string | string[];
	course_eligibility: string[];
}
export interface BlogsProps {
	uniqueId?: number;
	featured_image: string[];
	title: string;
	createdAt: string;
	author: number;
	category: string[];
	tags: string[];
	status?: string;
	blog: string;
	author_profile: string[];
	author_name: string;
}
export interface BlogCategoryProps {
	uniqueId: number;
	blog_category: string;
}
export interface BlogTagProps {
	uniqueId: number;
	blog_tag: string;
}

export interface AdminProps {
	name: string;
	uniqueId: number;
	profile: string[];
}

export interface ScholarshipProps {
	property_id: string;
	scholarship: string;
}

export interface AdmissionProcessProps {
	property_id: string;
	admission_process: string;
}

export interface AnnouncementProps {
	property_id: string;
	announcement: string;
}

export interface LoanProcessProps {
	property_id: string;
	loan_process: string;
}

export interface QnAProps {
	property_id: string;
	question: string;
	answer: string;
}

export interface RankingProps {
	property_id: string;
	naac_rank: string;
	nirf_rank: number;
	nba_rank: number;
	qs_rank: number;
	times_higher_education_rank: number;
}

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
	featured_image: string[];
	property_name: string;
	category: string;
	property_address: string;
	property_pincode: string;
	property_city: string;
	property_state: string;
	property_country: string;
	property_description: string;
	reviews?: ReviewProps[];
	property_slug: string;
	property_logo: string[];
	address: string;
	pincode: number;
	city: string;
	state: string;
	country: string;
	est_year: string;
	property_type: string;
	courses: CourseProps[];
	gallery: string[] | GalleryProps[];
	property_url: string;
	accomodation: AccommodationProps[];
	amenities: AmenitiesProps;
	working_hours: WorkingHoursProps[];
	faqs: FaqProps[];
	coupons: CouponsProps[];
	hiring: HiringProps[];
	status: string;
	teachers: TeacherProps[];
	certification: string[];
	average_rating?: number;
	total_reviews?: number;
	academic_type: string;
	scholarship: ScholarshipProps[];
	admissionProcess: AdmissionProcessProps[];
	announcements: AnnouncementProps[];
	loanProcess: LoanProcessProps[];
	qna: QnAProps[];
	ranking: RankingProps;
}
export interface RankProps {
	property_id?: string;
	rank?: number;
	lastRank?: number;
	overallScore?: number;
}
export interface ReviewProps {
	uniqueId?: number;
	property_id?: string | number;
	name?: string;
	rating?: number;
	review?: string;
	createdAt?: string;
}

export interface SeoProps {
	json_schema?: string;
}
export interface LocationProps {
	property_address: string;
	property_pincode: string;
	property_id: string;
	property_city?: string;
	property_state?: string;
	property_country?: string;
}

export interface CategoryProps {
	uniqueId: number;
	_id: string;
	category_name: string;
}

export interface SimpleLocationProps {
	city?: string;
	state?: string;
	country?: string;
}
export interface TopLocationProps {
	city: string;
	state?: string;
	country?: string;
	count: number;
}

export interface TabProps {
	icon: IconType;
	label: string;
	id: string;
	show: boolean;
}

export interface AccommodationProps {
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

export interface WorkingHoursProps {
	day: string;
	isOpen: boolean;
	openTime: string;
	closeTime: string;
}

export interface TeacherProps {
	teacher_name: string;
	designation: string;
	experience: string;
	profile: string[];
}

export interface FaqProps {
	question: string;
	answer: string;
}

export interface CouponsProps {
	coupon_code: string;
	discount: number;
	description: string;
	start_from: Date;
	valid_upto: Date;
}

export interface HiringProps {
	_id: string;
	title: string;
	job_type: string;
	job_description: string;
	experience: string;
	salary: PriceProps;
	end_date: Date;
	skills: string[];
	qualification: string[];
}

export interface PriceProps {
	INR: string;
	DOLLAR: string;
	USD: string;
}

export interface courseFilterProps {
	course_type: string[];
	duration: string[];
	program_type: string[];
	specialization: string[];
}

export interface CourseFilters {
	course_type?: string[];
	program_type?: string[];
	specialization?: string[];
	certification_type?: string[];
	duration?: string[];
}

export interface DynamicFilterCourseOptionsProps {
	courseTypes: {
		name: string;
		value: string;
		count: number;
	}[];

	programType: {
		name: string;
		value: string;
		count: number;
	}[];

	specializationType: {
		name: string;
		value: string;
		count: number;
	}[];

	durationsLists: {
		name: string;
		value: string;
		count: number;
	}[];
}

export interface DynamicFilterExamOptionsProps {
	examMode: FilterOptionProps[];
}

export interface FiltersProps {
	country: string[];
	state: string[];
	city: string[];
	course_name: string[];
	course_type: string[];
	course_format: string[];
	rating: string[];
	category: string[];
	property_type: string[];
	academic_type: string[];
}

export interface FilterOptionProps {
	name: string;
	count: number;
}

export interface CategoryOptionProps {
	name: string;
	value: string;
	count: number;
}

export interface DynamicFilterOptionsProps {
	countries: { name: string; count: number }[];

	getStatesForCountries: (selectedCountries?: string[]) => string[];
	getCitiesForLocation: (
		selectedCountries?: string[],
		selectedStates?: string[]
	) => string[];

	getStatesWithCounts: (selectedCountries?: string[]) => {
		name: string;
		count: number;
	}[];

	getCitiesWithCounts: (
		selectedCountries?: string[],
		selectedStates?: string[]
	) => {
		name: string;
		count: number;
	}[];

	courseNames: { name: string; count: number }[];
	courseTypes: { name: string; count: number }[];
	courseFormats: { name: string; count: number }[];

	categories: { name: string; value: string; count: number }[];
	propertyTypes: { name: string; value: string; count: number }[];

	ratingCounts: { rating: number; count: number }[];

	academicTypes: { name: string; value: string; count: number }[];
}

export interface FilterSearchTermsProps {
	country: string;
	state: string;
	city: string;
	course_name: string;
	course_type: string;
	course_format: string;
	category: string;
	property_type: string;
	academic_type: string;
}
export interface FilterCourseSearchTermsProps {
	course_type: string;
	duration: string;
	program_type: string;
	specialization: string;
}

export interface ExpandedFiltersProps {
	country: boolean;
	state: boolean;
	city: boolean;
	course_name: boolean;
	course_type: boolean;
	course_format: boolean;
	rating: boolean;
	category: boolean;
	property_type: boolean;
	academic_type: boolean;
}
export interface ExpandedCourseFiltersProps {
	course_type: boolean;
	duration: boolean;
	program_type: boolean;
	specialization: boolean;
}

export interface BreadcrumbItemProps {
	label: string;
	path?: string;
}

export interface GalleryProps {
	title: string;
	gallery: string[];
}

export interface SlidProps {
	src: string;
	alt?: string;
	title?: string;
}

export interface PropertyCourse {
	course_id: string;
	property_id: string;
	[key: string]: unknown;
	course_type: string;
	course_format: string;
}

export interface CertificationProps {
	images: string[];
}
export interface PropertyCourseMainProps {
	property_id: string;
	image: string[];
}

export interface ExperienceProps {
	uniqueId?: number;
	position: string;
	property_name_id?: number;
	location: string;
	start_date: string;
	end_date: string;
	property_id?: number | null;
	property_name?: string;
	currentlyWorking: boolean;
}

export interface EducationProps {
	uniqueId?: number;
	institute: number | null;
	degree: number | null;
	start_date: string;
	end_date: string;
	currentlyStuding: boolean;
}

export interface EducationPayloadProps {
	start_date: string;
	end_date: string | null;
	currentlyStuding: boolean;
	userId: string | number;
	uniqueId: string | number;
	degreeId?: string | number;
	degree?: string;
	instituteId?: string | number;
	institute?: string;
}

export interface AllDegreeAndInstituteProps {
	degree: {
		uniqueId: number;
		degree_name: string;
	}[];
	institute: {
		uniqueId: number;
		institute_name: string;
	}[];
}

export interface UserProps {
	uniqueId: number;
	name: string;
	email: string;
	mobile_no: string;
	username: string;
	verified: boolean;
	verifyTokenExpiry: Date;
	resetTokenExpiry: Date;
	verifyToken: string;
	resetToken: string;
	avatar: string[];
	address: string;
	pincode: string;
	city: string;
	state: string;
	country: string;
	alt_mobile_no: string;
	deletionToken: true;
	banner: string[];
	_id: string;
	about: string;
	heading: string;
	role: string;
	score: number;
	resume: string;
	languages: number[];
	skills: number[];
	experiences: ExperienceProps[];
	education: EducationProps[];
	isProfessional: boolean;
}

export interface AllLanaguagesProps {
	uniqueId: number;
	language: string;
}
export interface AllSkillsProps {
	uniqueId: number;
	skill: string;
}

export interface SelectOptionProps {
	label: string;
	value: number;
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

export interface FormattedOptionsProps {
	label: string;
	value: string;
	id?: number;
}

export interface RatingCount {
	rating: number;
	count: number;
}

// export interface DynamicFilterOptionsProps {
// 	countries: FilterOptionProps[];
// 	getStatesForCountries: (selectedCountries?: string[]) => string[];
// 	getCitiesForLocation: (
// 		selectedCountries?: string[],
// 		selectedStates?: string[]
// 	) => string[];
// 	getStatesWithCounts: (selectedCountries?: string[]) => FilterOptionProps[];
// 	getCitiesWithCounts: (
// 		selectedCountries?: string[],
// 		selectedStates?: string[]
// 	) => FilterOptionProps[];
// 	courseNames: FilterOptionProps[];
// 	courseTypes: FilterOptionProps[];
// 	courseFormats: FilterOptionProps[];
// 	categories: CategoryOptionProps[];
// 	propertyTypes: CategoryOptionProps[];
// 	ratingCounts: RatingCount[];
// }
