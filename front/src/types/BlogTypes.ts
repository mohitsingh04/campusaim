export interface BlogsProps {
	_id?: string;
	uniqueId?: number;
	featured_image: string[];
	title: string;
	createdAt: string;
	author: number;
	category: string[];
	tags: string[];
	status?: string;
	blog: string;
	blog_slug: string;
}
export interface BlogCategoryProps {
	_id: string;
	blog_category: string;
}
export interface BlogTagProps {
	_id: string;
	blog_tag: string;
}
