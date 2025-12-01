export interface User {
	_id: string;
	username: string;
	email?: string;
	name?: string;
	role?: string;
	status?: string;
	verified?: boolean;
	uniqueId?: number;
	createdAt?: string;
	updatedAt?: string;
	avatar?: string[];
	followedCategories?: string[];
}

export type TopUser = {
	_id: string;
	user: User;
	score: number;
};

export interface Question {
	_id: string;
	title: string;
	author: {
		_id: string;
		name?: string;
		username?: string;
		avatar?: string;
	};
	createdAt?: string;
	slug?: string;
	upvotes?: number; // <-- number, not array
	downvotes?: number; // <-- number, not array
	hasUpvoted?: boolean; // <-- boolean, for current user
	hasDownvoted?: boolean; // <-- boolean, for current user
	followers?: Array<string | { _id: string }>;
	description?: string;
	views?: number;
	category?: { _id: string; category_name?: string } | string;
}

export interface Answer {
	_id: string;
	content?: string;
	author: string | User;
	questionId?: string;
	createdAt?: string;
	question?: string | { _id: string; slug: string; title: string };
	updatedAt?: string;
	upvotes?: number; // <-- number, not array
	downvotes?: number; // <-- number, not array
	hasUpvoted?: boolean; // <-- boolean, for current user
	hasDownvoted?: boolean; // <-- boolean, for current user
}

// Topic type
export interface Topic {
	_id: string;
	category_name: string;
	parent_category?: string;
	isFollowing?: boolean;
	description?: string;
	questionsCount?: number;
	slug?: string;
	questions: string[];
}

// Category type
export interface Category {
	_id: string;
	category_name: string;
	slug: string;
}

// CategoryData type
export interface CategoryData {
	_id: string;
	category_name: string;
	slug: string;
	followers?: string[];
	description?: string;
}

// TrendingQuestion type
export interface TrendingQuestions {
	_id: string;
	title: string;
	upvotes: number;
	slug: string;
}
