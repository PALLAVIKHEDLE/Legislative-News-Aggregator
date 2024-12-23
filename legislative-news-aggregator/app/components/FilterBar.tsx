import React from 'react';
import { states } from '../utils/constants';

interface FilterBarProps {
  currentFilters: {
    state: string;
    topic: string;
    search: string;
  };
  onFilterChange: (filters: Partial<FilterBarProps['currentFilters']>) => void;
}

export function FilterBar({ currentFilters, onFilterChange }: FilterBarProps) {
  const topics = [
    'All',
    'Education',
    'Healthcare',
    'Environment',
    'Economy',
    'Infrastructure',
    'Technology',
    'Public Safety',
    'Housing'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger the filter change with current values
    onFilterChange(currentFilters);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('State changed to:', e.target.value); // Debug log
    onFilterChange({ state: e.target.value });
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Topic changed to:', e.target.value); // Debug log
    onFilterChange({ topic: e.target.value === 'All' ? '' : e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search changed to:', e.target.value); // Debug log
    onFilterChange({ search: e.target.value });
  };

  return (
    <div className="filter-bar">
      <form onSubmit={handleSubmit} className="filter-form">
        <div className="filter-group">
          <label htmlFor="state">State</label>
          <select
            id="state"
            value={currentFilters.state}
            onChange={handleStateChange}
            className="select-input"
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
          <label htmlFor="topic">Topic</label>
          <select
            id="topic"
            value={currentFilters.topic || 'All'}
            onChange={handleTopicChange}
            className="select-input"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            value={currentFilters.search}
            onChange={handleSearchChange}
            placeholder="Search articles..."
            className="search-input"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>
    </div>
  );
}
