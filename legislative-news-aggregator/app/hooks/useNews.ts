import { useQuery, useMutation, useQueryClient } from 'react-query';
import { NewsArticle, NewsFilters } from '../types';

interface NewsResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  limit: number;
}

class NewsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NewsError';
  }
}

const fetchNews = async (params: NewsFilters): Promise<NewsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.state) searchParams.append('state', params.state);
  if (params.topic) searchParams.append('topic', params.topic);
  if (params.search) searchParams.append('search', params.search);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`/api/news?${searchParams.toString()}`);
  if (!response.ok) {
    throw new NewsError('Failed to fetch news');
  }
  return response.json();
};

const addArticle = async (article: Omit<NewsArticle, 'id'>): Promise<NewsArticle> => {
  const response = await fetch('/api/news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  });

  if (!response.ok) {
    throw new NewsError('Failed to add article');
  }

  return response.json();
};

export function useNews(params: NewsFilters = {}) {
  return useQuery(['news', params], () => fetchNews(params), {
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    keepPreviousData: true, // Keep previous data while fetching new data
  });
}

export function useAddArticle() {
  const queryClient = useQueryClient();

  return useMutation(addArticle, {
    onSuccess: () => {
      // Invalidate and refetch news queries
      queryClient.invalidateQueries('news');
    },
  });
}
