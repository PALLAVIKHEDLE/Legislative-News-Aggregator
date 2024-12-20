'use client';

import { useState, useEffect, useCallback } from 'react';
import { NewsCard } from './components/NewsCard';
import { FilterBar } from './components/FilterBar';
import { NewsModal } from './components/NewsModal';
import { Pagination } from './components/Pagination';
import { AddArticleModal } from './components/AddArticleModal';

interface Article {
  id: string;
  title: string;
  content: string;
  state: string;
  topic: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface ApiResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState('');
  const [topic, setTopic] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Log the current state values
      console.log('Fetching articles with:', { state, topic, search, currentPage });

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '6');
      
      if (state) params.append('state', state);
      if (topic) params.append('topic', topic);
      if (search) params.append('search', search);

      const response = await fetch(`/api/news?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch articles');
      }

      const data: ApiResponse = await response.json();
      console.log('Received data:', data); // Log the response data
      setArticles(data.articles);
      setPagination({
        total: data.total,
        totalPages: data.totalPages,
        currentPage: data.page,
        limit: data.limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, state, topic, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleStateChange = (newState: string) => {
    console.log('State changed to:', newState); // Log state change
    setState(newState);
  };

  const handleTopicChange = (newTopic: string) => {
    console.log('Topic changed to:', newTopic); // Log topic change
    setTopic(newTopic);
  };

  const handleSearchChange = (newSearch: string) => {
    console.log('Search changed to:', newSearch); // Log search change
    setSearch(newSearch);
  };

  // Use effect to trigger fetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchArticles();
  }, [state, topic, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddArticle = async (newArticle: Article) => {
    try {
      setLoading(true);
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newArticle),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add article');
      }

      setShowAddModal(false);
      setCurrentPage(1); // Go back to first page
      await fetchArticles(); // Refresh the list
      
      // Show success message
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Legislative News Aggregator</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Add Article
          </button>
        </div>
        <FilterBar
          state={state}
          setState={handleStateChange}
          topic={topic}
          setTopic={handleTopicChange}
          search={search}
          setSearch={handleSearchChange}
          onSubmit={handleSearch}
        />
      </header>

      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}

      <div className="news-grid">
        {loading ? (
          <div className="loading-container">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="no-results">
            No articles found. Try adjusting your search criteria.
          </div>
        ) : (
          articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onClick={() => setSelectedArticle(article)}
            />
          ))
        )}
      </div>

      {pagination && !loading && articles.length > 0 && (
        <div style={{marginTop:20}}>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalResults={pagination.total}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {selectedArticle && (
        <NewsModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {showAddModal && (
        <AddArticleModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddArticle}
        />
      )}
    </div>
  );
}
