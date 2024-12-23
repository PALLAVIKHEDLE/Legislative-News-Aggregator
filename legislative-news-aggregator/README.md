## Development Setup

This project uses PNPM for package management. To get started:

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).


## System Design Considerations

### News Aggregation and Processing

#### Source Integration Strategies
- **API-First Approach**:
  - RESTful APIs with rate limiting and error handling
  - WebSocket connections for real-time updates
  - Custom scrapers for sources without APIs
- **Data Normalization Pipeline**:
  - Standardize article formats across sources
  - Extract and validate metadata (dates, authors, locations)
  - NLP-based topic classification and entity extraction

#### Deduplication and Storage
- **Smart Deduplication**:
  - MinHash algorithm for fast similarity detection
  - Semantic analysis using BERT embeddings
  - Maintain relationship links between similar articles
- **Distributed Storage**:
  - PostgreSQL with TimescaleDB for time-series data
  - Apache Cassandra for high-throughput writes
  - S3/Object Storage for media assets

#### Data Freshness
- **Active Data Management**:
  - Change Data Capture (CDC) for real-time updates
  - Materialized views for frequently accessed data
  - Version control for article updates
- **Intelligent Crawling**:
  - Adaptive crawl rates based on source update patterns
  - Priority queue for high-value sources
  - Backoff strategies for rate limits

### Scalability Architecture

#### Data Distribution
- **Geographic Sharding**:
  - State-based partitioning for local news
  - Topic-based sharding for specialized content
  - Cross-region replication for availability
- **Caching Hierarchy**:
  - CDN for static content
  - Redis Cluster for hot data
  - Varnish for API response caching

### Search and Retrieval

#### Search Infrastructure
- **Hybrid Search Solution**:
  - Elasticsearch for full-text search
  - Vector search for semantic similarity
  - Graph database (Neo4j) for relationship queries
- **Query Optimization**:
  - Query rewriting for better relevance
  - Faceted search with dynamic aggregations
  - Personalized ranking based on user context

#### Performance Tuning
- **Smart Indexing**:
  - Composite indexes for common queries
  - Partial indexes for active data
  - Async index updates for write performance
- **Result Optimization**:
  - Progressive loading of search results
  - Predictive prefetching
  - Real-time result filtering

#### Request Optimization
- **Client-Side Controls**:
  - Debouncing search input (300ms delay) to reduce API calls
  - Throttling autocomplete requests (max 2 requests per second)
  - Cancel in-flight requests when new search initiated
- **Rate Limiting Strategies**:
  - Token bucket algorithm for API rate limiting
  - Sliding window rate limiting for burst protection
  - Different rate limits for authenticated vs anonymous users
- **Request Batching**:
  - Batch similar search queries within time window
  - Aggregate multiple filter operations
  - Cache results for repeated queries within session
