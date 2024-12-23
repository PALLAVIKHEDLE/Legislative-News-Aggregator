import React, { useState } from 'react';
import { states } from '../utils/constants';
import { NewsArticle, TOPICS } from '../types';

interface AddArticleModalProps {
  onClose: () => void;
  onSubmit: (article: Omit<NewsArticle, 'id'>) => void;
}

export function AddArticleModal({ onClose, onSubmit }: AddArticleModalProps) {
  const [formData, setFormData] = useState<Omit<NewsArticle, 'id'>>({
    title: '',
    content: '',
    state: '',
    topic: '',
    source: '',
    url: '',
    publishedAt: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <h2 className="text-xl font-bold">Add New Article</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter article title (required)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={4}
              className="form-input"
              placeholder="Enter article content"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.abbr} value={s.abbr}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="topic">Topic</label>
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Topic</option>
                {TOPICS.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="source">Source</label>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter source name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="url">URL</label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter article URL (required)"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="publishedAt">Published Date</label>
            <input
              type="date"
              id="publishedAt"
              name="publishedAt"
              value={formData.publishedAt}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Add Article
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
