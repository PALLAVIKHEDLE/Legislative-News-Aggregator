'use client';

import { useState } from 'react';
import { NewsCard } from './components/NewsCard';
import { FilterBar } from './components/FilterBar';
import { NewsModal } from './components/NewsModal';
import { Pagination } from './components/Pagination';
import { AddArticleModal } from './components/AddArticleModal';
import { useNews, useAddArticle } from './hooks/useNews';

export default function Home() {
  const [filters, setFilters] = useState({
    state: '',
    topic: '',
    search: '',
    page: 1,
    limit: 6
  });

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, isError } = useNews(filters);
  const { mutate: addArticle } = useAddArticle();

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddArticle = async (article: any) => {
    try {
      await addArticle(article);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add article:', error);
    }
  };

  // Calculate total pages
  const totalPages = data?.total ? Math.ceil(data.total / filters.limit) : 0;

  if (isError) {
    return (
      <div className="text-red-500 text-center mb-4">
        Error loading news articles
      </div>
    );
  }

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
          currentFilters={filters}
          onFilterChange={handleFilterChange}
        />
      </header>

      <div className="news-grid">
        {isLoading ? (
          <div className="loading-container">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : data?.articles.length === 0 ? (
          <div className="no-results">
            No articles found. Try adjusting your search criteria.
          </div>
        ) : (
          data?.articles.map((article: any) => (
            <NewsCard
              key={article.id || article.url}
              article={article}
              onClick={() => setSelectedArticle(article)}
            />
          ))
        )}
      </div>

      {data && !isLoading && data.articles.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
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
