import { NewsArticle } from '../types';
import { formatDate } from '../utils/dateUtils';

interface NewsCardProps {
  article: NewsArticle;
  onClick: (article: NewsArticle) => void;
}

export function NewsCard({ article, onClick }: NewsCardProps) {
  return (
    <article className="news-card" onClick={() => onClick(article)}>
      <div className="news-card-content">
        <div className="news-tags">
          <span className="tag tag-state">{article.state}</span>
          <span className="tag tag-topic">{article.topic}</span>
        </div>
        
        <h3 className="news-title">{article.title}</h3>
        <p className="news-summary">{article.content}</p>
        
        <div className="news-meta">
          <span>{article.source}</span>
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </div>
    </article>
  );
}