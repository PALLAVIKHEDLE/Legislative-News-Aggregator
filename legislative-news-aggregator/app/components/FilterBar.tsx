import { states } from '../utils/constants';

interface FilterBarProps {
  state: string;
  setState: (state: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  search: string;
  setSearch: (search: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FilterBar({
  state,
  setState,
  topic,
  setTopic,
  search,
  setSearch,
  onSubmit,
}: FilterBarProps) {
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

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(e.target.value);
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTopic(e.target.value === 'All' ? '' : e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="filter-bar">
      <form onSubmit={onSubmit} className="filter-form">
        <div className="filter-group">
          <label htmlFor="state">State</label>
          <select
            id="state"
            value={state}
            onChange={handleStateChange}
            className="select-input"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="topic">Topic</label>
          <select
            id="topic"
            value={topic || 'All'}
            onChange={handleTopicChange}
            className="select-input"
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            value={search}
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
