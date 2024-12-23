import { useQuery, useMutation, useQueryClient } from 'react-query';

interface Article {
  id: string;
  title: string;
  content?: string;
  state?: string;
  topic?: string;
  source?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
}

interface NewsResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

interface UseNewsParams {
  state?: string;
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const fetchNews = async (params: UseNewsParams): Promise<NewsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.state) searchParams.append('state', params.state);
  if (params.topic) searchParams.append('topic', params.topic);
  if (params.search) searchParams.append('search', params.search);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`/api/news?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
  const response = await fetch('/api/news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  });

  if (!response.ok) {
    throw new Error('Failed to add article');
  }

  return response.json();
};

export function useNews(params: UseNewsParams = {}) {
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