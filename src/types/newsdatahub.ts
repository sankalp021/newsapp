export interface NewsDataHubResponse {
  status?: string;
  data: NewsDataHubArticle[];
  total_results?: number;
  next_cursor?: string;
  error?: string;
}

export interface NewsDataHubArticle {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  pub_date: string;
  article_link: string;
  source_title?: string;
  source_domain?: string;
  source_domain_link?: string;
  source_country_code?: string;
  topic?: string;
  media_url?: string;
  media_thumbnail?: string;
}

export type NewsTopic =
  | 'business'
  | 'entertainment'
  | 'environment'
  | 'food'
  | 'health'
  | 'politics'
  | 'science'
  | 'sports'
  | 'technology'
  | 'top'
  | 'tourism'
  | 'world';
