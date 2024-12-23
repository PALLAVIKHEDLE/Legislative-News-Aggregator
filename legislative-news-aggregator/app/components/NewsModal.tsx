import { NewsArticle } from '../types';
import { formatDate } from '../utils/dateUtils';

interface NewsModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export function NewsModal({ article, onClose }: NewsModalProps) {
  if (!article) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="news-tags">
          {article.state && (
            <span className="tag tag-state">{article.state}</span>
          )}
          {article.topic && (
            <span className="tag tag-topic">{article.topic}</span>
          )}
        </div>

        <h2 className="news-title text-2xl">{article.title}</h2>

        {article.content && (
          <div className="news-content mt-4">
            <p>{article.content}</p>
          </div>
        )}

        <div className="news-meta mt-4">
          {article.source && (
            <span>Source: {article.source}</span>
          )}
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>

        <div className="modal-footer">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Read full article →
          </a>
        </div>
      </div>
    </div>
  );
}
