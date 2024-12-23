import React from 'react';
import { states } from '../utils/constants';
import { NewsFilters, TOPICS } from '../types';

interface FilterBarProps {
  currentFilters: NewsFilters;
  onFilterChange: (filters: Partial<NewsFilters>) => void;
}

export function FilterBar({ currentFilters, onFilterChange }: FilterBarProps) {
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ state: e.target.value });
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ topic: e.target.value === 'All' ? '' : e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  return (
    <div className="filter-bar">
      <div className="filter-form">
        <div className="filter-group">
          <label htmlFor="state" className="form-label">State</label>
          <select
            id="state"
            value={currentFilters.state}
            onChange={handleStateChange}
            className="form-input"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state.abbr} value={state.abbr}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="topic" className="form-label">Topic</label>
          <select
            id="topic"
            value={currentFilters.topic || 'All'}
            onChange={handleTopicChange}
            className="form-input"
          >
            <option value="All">All Topics</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search" className="form-label">Search</label>
          <input
            type="text"
            id="search"
            value={currentFilters.search}
            onChange={handleSearchChange}
            placeholder="Search articles..."
            className="form-input"
          />
        </div>

        <div className="filter-group">
          <label className="form-label">&nbsp;</label>
          <button type="button" className="btn btn-primary">
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
