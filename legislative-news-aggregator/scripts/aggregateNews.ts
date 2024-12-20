import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import cron from 'node-cron';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { states } from '../app/utils/constants';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

// Get API key from environment variable
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
  throw new Error('NEWS_API_KEY environment variable is not set');
}

console.log('Starting with API key:', NEWS_API_KEY ? 'Present' : 'Missing');

// Topics related to legislation
const topics = [
  'legislation',
  'law',
  'congress',
  'senate',
  'assembly',
  'bill',
  'policy'
];

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  state: string;
  topic: string;
  source: string;
  url: string;
  publishedAt: string;
}

async function readArticles(): Promise<NewsArticle[]> {
  try {
    const data = await fs.readFile(ARTICLES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file doesn't exist, create it with empty array
      await writeArticles([]);
      return [];
    }
    console.error('Error reading articles:', error);
    return [];
  }
}

async function writeArticles(articles: NewsArticle[]): Promise<void> {
  try {
    await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
    console.log(`Successfully wrote ${articles.length} articles to file`);
  } catch (error) {
    console.error('Error writing articles:', error);
  }
}

async function fetchNewsForState(state: { name: string; abbr: string }) {
  try {
    console.log(`Fetching news for ${state.name}...`);
    
    // Create a query that combines state name with legislative terms
    const query = `${state.name} (${topics.join(' OR ')})`;
    console.log('Search query:', query);
    
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        apiKey: NEWS_API_KEY,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10 // Limit results per state
      }
    });

    if (!response.data || !response.data.articles) {
      console.error('Invalid response from NewsAPI:', response.data);
      return;
    }

    const articles = response.data.articles;
    console.log(`Fetched ${articles.length} articles for ${state.name}`);
    
    const existingArticles = await readArticles();
    console.log(`Found ${existingArticles.length} existing articles`);
    
    const newArticles: NewsArticle[] = [];

    // Process and store each article
    for (const article of articles) {
      if (!article.title || !article.url) {
        console.log('Skipping invalid article:', article);
        continue;
      }

      const topic = determineTopicFromArticle(article);
      
      // Check if article already exists (by URL)
      if (!existingArticles.some(existing => existing.url === article.url)) {
        newArticles.push({
          id: crypto.randomUUID(),
          title: article.title,
          content: article.description || article.content || '',
          state: state.abbr,
          topic,
          source: article.source.name,
          url: article.url,
          publishedAt: article.publishedAt
        });
      }
    }

    // Add new articles to existing ones
    if (newArticles.length > 0) {
      await writeArticles([...existingArticles, ...newArticles]);
      console.log(`Added ${newArticles.length} new articles for ${state.name}`);
    } else {
      console.log(`No new articles found for ${state.name}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching news for ${state.name}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error(`Error fetching news for ${state.name}:`, error);
    }
  }
}

function determineTopicFromArticle(article: any): string {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  
  const topicKeywords = {
    'Education': ['education', 'school', 'student', 'teacher', 'university', 'college'],
    'Healthcare': ['health', 'medical', 'hospital', 'insurance', 'medicare', 'medicaid'],
    'Environment': ['environment', 'climate', 'energy', 'pollution', 'conservation'],
    'Economy': ['economy', 'tax', 'budget', 'finance', 'economic', 'business'],
    'Infrastructure': ['infrastructure', 'transportation', 'road', 'bridge', 'construction'],
    'Public Safety': ['police', 'crime', 'safety', 'emergency', 'security'],
    'Housing': ['housing', 'rent', 'mortgage', 'property', 'real estate'],
    'Technology': ['technology', 'digital', 'internet', 'cyber', 'data'],
    'Immigration': ['immigration', 'border', 'visa', 'migrant', 'citizenship']
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return topic;
    }
  }

  return 'Other';
}

async function aggregateNews() {
  console.log('Starting news aggregation...');
  
  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }

  for (const state of states) {
    await fetchNewsForState(state);
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('News aggregation completed');
}

// Run immediately when script is executed directly
if (require.main === module) {
  console.log('Starting news aggregation service...');
  aggregateNews().catch(error => {
    console.error('Error in news aggregation:', error);
    process.exit(1);
  });
}
