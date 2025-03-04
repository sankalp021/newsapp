export interface NewsDataHubResponse {
  next_cursor: string | null;
  total_results: number;
  per_page: number;
  data: NewsDataHubArticle[];
  error?: string;
}

export interface NewsDataHubArticle {
  id: string;
  title: string;
  source_title: string;
  source_link: string;
  article_link: string;
  keywords?: string[];
  topics?: string[];
  description: string;
  pub_date: string;
  creator?: string | null;
  content?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  media_description?: string | null;
  media_credit?: string | null;
  media_thumbnail?: string | null;
  language: string;
  sentiment?: {
    pos: number;
    neg: number;
    neu: number;
  };
}

export type NewsTopic = 
  | 'politics'
  | 'business'
  | 'entertainment'
  | 'health'
  | 'science'
  | 'sports'
  | 'technology'
  | 'environment'
  | 'economy'
  | 'finance'
  | 'education'
  | 'energy'
  | 'travel'
  | 'culture'
  | 'government'
  | 'world';
