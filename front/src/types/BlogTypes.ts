import { FaqProps } from "./Types";
export interface BlogsProps {
  _id?: string;
  featured_image: string[];
  title: string;
  createdAt: string;
  author: string;
  category: BlogCategoryProps[] | string[];
  tags: BlogTagProps[] | string[];
  status?: string;
  blog: string;
  blog_slug: string;
  faqs: FaqProps[];
}
export interface BlogCategoryProps {
  _id: string;
  blog_category: string;
}
export interface BlogTagProps {
  _id: string;
  blog_tag: string;
}
