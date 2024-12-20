import { NewsArticle } from '../types';
import { formatDate } from '../utils/dateUtils';

interface NewsModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export function NewsModal({ article, onClose }: NewsModalProps) {
  if (!article) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="news-tags">
          <span className="tag tag-state">{article.state}</span>
          <span className="tag tag-topic">{article.topic}</span>
        </div>

        <h2 className="news-title">{article.title}</h2>

        <div className="news-content">
          <p>{article.content}</p>
        </div>

        <div className="news-meta">
          <span>Source: {article.source}</span>
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>

        <div className="news-actions">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="read-more-link"
          >
            Read full article →
          </a>
        </div>
      </div>
    </div>
  );
}
