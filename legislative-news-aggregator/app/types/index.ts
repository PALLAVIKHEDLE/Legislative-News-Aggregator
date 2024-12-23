export interface NewsArticle {
  id?: string | number;
  title: string;
  content?: string;
  state?: string;
  topic?: string;
  source?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
}

export interface NewsFilters {
  state?: string;
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const TOPICS = [
  'Education',
  'Healthcare',
  'Environment',
  'Economy',
  'Infrastructure',
  'Technology',
  'Public Safety',
  'Housing'
] as const;

export type Topic = typeof TOPICS[number];
