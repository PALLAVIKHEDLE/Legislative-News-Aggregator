'use client';

import { useState } from 'react';
import { NewsCard } from './components/NewsCard';
import { FilterBar } from './components/FilterBar';
import { NewsModal } from './components/NewsModal';
import { Pagination } from './components/Pagination';
import { AddArticleModal } from './components/AddArticleModal';
import { useNews, useAddArticle } from './hooks/useNews';
import { NewsArticle, NewsFilters } from './types';
import './styles.css';

const ITEMS_PER_PAGE = 6;

export default function Home() {
  const [filters, setFilters] = useState<NewsFilters>({
    state: '',
    topic: '',
    search: '',
    page: 1,
    limit: ITEMS_PER_PAGE
  });

  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, isError } = useNews(filters);
  const { mutate: addArticle } = useAddArticle();

  const handleFilterChange = (newFilters: Partial<NewsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddArticle = async (article: Omit<NewsArticle, 'id'>) => {
    try {
      await addArticle(article);
      setShowAddModal(false);
    } catch (error) {
      setShowAddModal(false);
    }
  };

  const totalPages = data?.total ? Math.ceil(data.total / filters.limit) : 0;

  if (isError) {
    return (
      <div className="container">
        <div className="error-message">
          Error loading news articles. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="header-title">Legislative News Aggregator</h1>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Add Article
          </button>
        </div>
        <FilterBar
          currentFilters={filters}
          onFilterChange={handleFilterChange}
        />
      </header>

      <main>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : data?.articles.length === 0 ? (
          <div className="no-results">
            No articles found. Try adjusting your search criteria.
          </div>
        ) : (
          <div className="news-grid">
            {data?.articles.map((article: NewsArticle) => (
              <NewsCard
                key={article.id || article.url}
                article={article}
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        )}

        {data && !isLoading && data.articles.length > 0 && (
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

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
