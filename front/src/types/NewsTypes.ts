import { FaqProps, SeoProps } from "./Types";

export interface NewsProps {
  featured_image: string[];
  news_slug: string;
  title: string;
  content: string;
  _id: string;
  status: string;
  author: string;
  faqs: FaqProps[];
  seo?: SeoProps;
  createdAt: string;
}
