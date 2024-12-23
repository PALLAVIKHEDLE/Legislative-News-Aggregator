import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { states } from '../../utils/constants';

// Schema for article validation
const articleSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  state: z.string().optional(),
  topic: z.string().optional(),
  source: z.string().optional(),
  url: z.string(),
  urlToImage: z.string().optional(),
  publishedAt: z.string()
});

// NewsAPI configuration
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

interface SearchParams {
  state?: string;
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface NewsArticle {
  title: string;
  description?: string;
  content?: string;
  source?: { name: string };
  url: string;
  urlToImage?: string;
  publishedAt: string;
}

const getStateName = (abbr: string): string => {
  const state = states.find(s => s.abbr === abbr);
  return state ? state.name : '';
};

const buildStateQuery = (stateName: string, stateAbbr: string): string => {
  return `("${stateName}" OR "${stateAbbr}") AND (legislature OR governor OR "state bill" OR "state law" OR "state senate")`;
};

const isStateRelevant = (article: NewsArticle, stateName: string, stateAbbr: string): boolean => {
  const statePattern = new RegExp(`\\b(${stateName}|${stateAbbr})\\b`, 'i');
  const content = [
    article.title,
    article.description,
    article.content
  ].filter(Boolean).join(' ');
  
  return statePattern.test(content);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: SearchParams = {
      state: searchParams.get('state') || undefined,
      topic: searchParams.get('topic') || undefined,
      search: searchParams.get('search') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 6,
    };

    // Check database first
    const where = {
      ...(params.state && { state: params.state }),
      ...(params.topic && { topic: params.topic }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' } },
          { content: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [dbArticles, totalDbArticles] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.article.count({ where }),
    ]);

    // If we have enough articles in DB, return them
    if (totalDbArticles >= params.limit) {
      return NextResponse.json({
        articles: dbArticles,
        total: totalDbArticles,
        page: params.page,
        limit: params.limit,
      });
    }

    // Build the NewsAPI query
    let query = '';
    let stateName = '';
    let stateAbbr = '';
    
    if (params.state) {
      stateName = getStateName(params.state);
      stateAbbr = params.state;
      if (stateName) {
        query = buildStateQuery(stateName, stateAbbr);
      }
    }

    if (params.topic) {
      query = query ? `${query} AND "${params.topic}"` : params.topic;
    }

    if (params.search) {
      query = query ? `${query} AND ${params.search}` : params.search;
    }

    if (!query.trim()) {
      query = 'US state legislature news';
    }

    // Try to get more relevant results by adjusting the search parameters
    const newsApiUrl = `${NEWS_API_BASE_URL}/everything?` + new URLSearchParams({
      q: query,
      apiKey: NEWS_API_KEY,
      pageSize: '100',
      page: '1',
      language: 'en',
      sortBy: 'relevancy',
      searchIn: 'title,description,content',
    });
    
    const response = await fetch(newsApiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Filter articles for state relevance
    const relevantArticles = params.state
      ? (data.articles as NewsArticle[] || []).filter(article => 
          isStateRelevant(article, stateName, stateAbbr)
        )
      : (data.articles as NewsArticle[] || []);

    // Calculate pagination for filtered results
    const startIndex = (params.page - 1) * params.limit;
    const paginatedArticles = relevantArticles.slice(startIndex, startIndex + params.limit);

    // Transform and store new articles
    const newArticles = await Promise.all(
      paginatedArticles.map(async (article: NewsArticle) => {
        if (!article.title || !article.url) return null;

        const articleData = {
          title: article.title,
          content: article.description || '',
          state: params.state || null,  
          topic: params.topic || null,  
          source: article.source?.name || '',
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: new Date(article.publishedAt || Date.now()),
        };

        try {
          return await prisma.article.create({
            data: articleData,
          });
        } catch (error) {
          const existingArticle = await prisma.article.findUnique({
            where: { url: article.url },
          });
          
          if (existingArticle) {
            // Update existing article with new information if available
            const updateData: any = {};
            if (params.state && !existingArticle.state) updateData.state = params.state;
            if (params.topic && !existingArticle.topic) updateData.topic = params.topic;
            
            if (Object.keys(updateData).length > 0) {
              return await prisma.article.update({
                where: { url: article.url },
                data: updateData,
              });
            }
            return existingArticle;
          }
          return null;
        }
      })
    );

    const validNewArticles = newArticles.filter(article => article !== null);
    const totalArticles = Math.min(relevantArticles.length + totalDbArticles, 100); 

    return NextResponse.json({
      articles: [...dbArticles, ...validNewArticles],
      total: totalArticles,
      page: params.page,
      limit: params.limit,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedArticle = articleSchema.parse(body);
    
    const newArticle = await prisma.article.create({
      data: {
        ...validatedArticle,
        publishedAt: new Date(validatedArticle.publishedAt),
      },
    });
    
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid article data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add article' },
      { status: 500 }
    );
  }
}
