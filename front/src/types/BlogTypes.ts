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
  uniqueId: number;
  blog_category: string;
}
export interface BlogTagProps {
  uniqueId: number;
  blog_tag: string;
}
