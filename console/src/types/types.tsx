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
	about: string;
	heading: string;
	score: number;
	resume: string;
	languages: string[];
	skills: string[];
	experiences: ExperienceProps[];
	education: EducationProps[];
	isProfessional: boolean;
}

export interface ReqKoItem {
	_id: string;
	best_for?: string;
	course_eligibility?: string;
	uniqueId?: string; // 👈 make optional
}

export interface SkillProps extends Record<string, unknown> {
	_id: string;
	skill: string;
	createdAt: string;
}
export interface LanguageProps extends Record<string, unknown> {
	_id: string;
	language: string;
	createdAt: string;
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

export interface EducationProps {
	uniqueId?: number;
	institute: number | null;
	degree: number | null;
	start_date: string;
	end_date: string;
	currentlyStuding: boolean;
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
	uniqueId: string;
	exam_name: string;
	exam_short_name: string;
	upcoming_exam_date: string;
	result_date: string;
	application_form_date: string;
	youtube_link: string;
	application_form_link: string;
	exam_form_link: string;
	exam_mode: string;
	description: string;
	image: string[];
	isDeleted: boolean;
	seo_score: number;
	status: string;
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

export interface RetreatProps extends Record<string, unknown> {
	_id: string;
	retreat_name: string;
	uniqueId: number;
	seo_score: number;
	retreat_short_name: string;
	description: string;
	createdAt: string;
	retreat_id?: string | number;
	status: string;
	isDeleted: boolean;
	retreat_type: string;
	retreat_format: string;
	retreat_difficulty_level: string;
	booking_deadline: string;
	start_date: string;
	end_date: string;
	accommodation: string[];
	retreat_certification_type: string;
	cancellation_policy: string;
	capacity: number;
	certification_available: boolean;
	duration: string;
	best_for: string[];
	key_outcomes: string[];
	requirements: string[];
	languages: string[];
	image: string[];
	featured_image: string[];
	gallery: string[];
	price: { [currency: string]: number };
	discount_price: number;
	exclusions: string;
	inclusions: string;
	routine: { start_time: string; end_time: string; task: string }[];
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
export interface EventsProps extends Record<string, unknown> {
	_id: string;
	title: string;
	event_host_url: string;
	isonline: boolean;
	event_website: string;
	featured_image: string[];
	schedule: { date: string; start_time: string; end_time: string }[];
	status: string;
	price: { [currency: string]: number };
	createdAt: string;
	categoryId: [string];
	event_address: string;
	event_pincode: string;
	event_country: string;
	event_state: string;
	event_city: string;
	ticket_booking: {
		start: string;
		end: string;
	};
	seo_score: number;
	event_partners: {
		name: string;
		logo: string[];
	}[];
	description: string;
	entrance_type: string;
	host: { name: string; image: string };
	host_name?: string;
	language: string[];
	category: string[];
	age_limit: {
		min: string;
		max: string;
	};
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
export interface AllLanaguagesProps {
	uniqueId: number;
	language: string;
}
export interface AllSkillsProps {
	uniqueId: number;
	skill: string;
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
