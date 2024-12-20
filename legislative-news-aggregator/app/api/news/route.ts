import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { states } from '../../utils/constants';

// Schema for article validation
const articleSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  state: z.string().optional(),
  topic: z.string().optional(),
  source: z.string().optional(),
  url: z.string(),
  publishedAt: z.string()
});

// In-memory storage for new articles
let additionalArticles: any[] = [];

// Mock data for all 50 states
const mockArticles = [
  // Northeast
  {
    id: '1',
    title: 'Maine Passes Renewable Energy Bill',
    content: 'Maine legislature approves major renewable energy initiative.',
    state: 'ME',
    topic: 'Environment',
    source: 'Maine News',
    url: 'https://example.com/me-energy',
    publishedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'New Hampshire Education Reform',
    content: 'NH implements new education standards.',
    state: 'NH',
    topic: 'Education',
    source: 'NH Chronicle',
    url: 'https://example.com/nh-education',
    publishedAt: '2024-01-14'
  },
  // Mid-Atlantic
  {
    id: '3',
    title: 'New York Infrastructure Plan',
    content: 'NY announces major infrastructure overhaul.',
    state: 'NY',
    topic: 'Infrastructure',
    source: 'NY Times',
    url: 'https://example.com/ny-infrastructure',
    publishedAt: '2024-01-13'
  },
  {
    id: '4',
    title: 'New Jersey Environmental Protection',
    content: 'NJ strengthens environmental regulations.',
    state: 'NJ',
    topic: 'Environment',
    source: 'NJ News',
    url: 'https://example.com/nj-environment',
    publishedAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Pennsylvania Economic Development',
    content: 'PA launches new economic initiatives.',
    state: 'PA',
    topic: 'Economy',
    source: 'PA Inquirer',
    url: 'https://example.com/pa-economy',
    publishedAt: '2024-01-11'
  },
  {
    id: '6',
    title: 'Delaware Business Reform',
    content: 'DE passes new business regulations.',
    state: 'DE',
    topic: 'Economy',
    source: 'DE Business News',
    url: 'https://example.com/de-business',
    publishedAt: '2024-01-10'
  },
  {
    id: '7',
    title: 'Maryland Healthcare Reform',
    content: 'MD expands healthcare access.',
    state: 'MD',
    topic: 'Healthcare',
    source: 'MD Health News',
    url: 'https://example.com/md-health',
    publishedAt: '2024-01-09'
  },
  // South
  {
    id: '8',
    title: 'Virginia Transportation Bill',
    content: 'VA improves transportation infrastructure.',
    state: 'VA',
    topic: 'Infrastructure',
    source: 'VA Times',
    url: 'https://example.com/va-transport',
    publishedAt: '2024-01-08'
  },
  {
    id: '9',
    title: 'North Carolina Education Initiative',
    content: 'NC launches new education programs.',
    state: 'NC',
    topic: 'Education',
    source: 'NC Observer',
    url: 'https://example.com/nc-education',
    publishedAt: '2024-01-07'
  },
  {
    id: '10',
    title: 'South Carolina Energy Policy',
    content: 'SC updates energy regulations.',
    state: 'SC',
    topic: 'Environment',
    source: 'SC Energy News',
    url: 'https://example.com/sc-energy',
    publishedAt: '2024-01-06'
  },
  {
    id: '11',
    title: 'Georgia Technology Hub',
    content: 'GA invests in technology sector.',
    state: 'GA',
    topic: 'Technology',
    source: 'GA Tech News',
    url: 'https://example.com/ga-tech',
    publishedAt: '2024-01-05'
  },
  {
    id: '12',
    title: 'Florida Environmental Protection',
    content: 'FL passes new environmental regulations.',
    state: 'FL',
    topic: 'Environment',
    source: 'FL Times',
    url: 'https://example.com/fl-environment',
    publishedAt: '2024-01-04'
  },
  {
    id: '13',
    title: 'Alabama Infrastructure',
    content: 'AL approves infrastructure package.',
    state: 'AL',
    topic: 'Infrastructure',
    source: 'AL News',
    url: 'https://example.com/al-infrastructure',
    publishedAt: '2024-01-03'
  },
  {
    id: '14',
    title: 'Mississippi Education Reform',
    content: 'MS implements education changes.',
    state: 'MS',
    topic: 'Education',
    source: 'MS Education News',
    url: 'https://example.com/ms-education',
    publishedAt: '2024-01-02'
  },
  {
    id: '15',
    title: 'Tennessee Healthcare',
    content: 'TN expands healthcare services.',
    state: 'TN',
    topic: 'Healthcare',
    source: 'TN Health News',
    url: 'https://example.com/tn-health',
    publishedAt: '2024-01-01'
  },
  {
    id: '16',
    title: 'Kentucky Economic Plan',
    content: 'KY announces economic initiatives.',
    state: 'KY',
    topic: 'Economy',
    source: 'KY Business',
    url: 'https://example.com/ky-economy',
    publishedAt: '2023-12-31'
  },
  {
    id: '17',
    title: 'West Virginia Energy',
    content: 'WV updates energy policies.',
    state: 'WV',
    topic: 'Environment',
    source: 'WV Energy News',
    url: 'https://example.com/wv-energy',
    publishedAt: '2023-12-30'
  },
  {
    id: '18',
    title: 'Arkansas Agriculture',
    content: 'AR passes agricultural reforms.',
    state: 'AR',
    topic: 'Economy',
    source: 'AR Farm News',
    url: 'https://example.com/ar-agriculture',
    publishedAt: '2023-12-29'
  },
  {
    id: '19',
    title: 'Louisiana Coastal Protection',
    content: 'LA strengthens coastal protection.',
    state: 'LA',
    topic: 'Environment',
    source: 'LA Coastal News',
    url: 'https://example.com/la-coastal',
    publishedAt: '2023-12-28'
  },
  // Midwest
  {
    id: '20',
    title: 'Ohio Manufacturing',
    content: 'OH supports manufacturing sector.',
    state: 'OH',
    topic: 'Economy',
    source: 'OH Industry News',
    url: 'https://example.com/oh-manufacturing',
    publishedAt: '2023-12-27'
  },
  {
    id: '21',
    title: 'Indiana Education',
    content: 'IN reforms education system.',
    state: 'IN',
    topic: 'Education',
    source: 'IN Education News',
    url: 'https://example.com/in-education',
    publishedAt: '2023-12-26'
  },
  {
    id: '22',
    title: 'Illinois Public Safety',
    content: 'IL implements safety measures.',
    state: 'IL',
    topic: 'Public Safety',
    source: 'IL Tribune',
    url: 'https://example.com/il-safety',
    publishedAt: '2023-12-25'
  },
  {
    id: '23',
    title: 'Michigan Technology',
    content: 'MI invests in tech infrastructure.',
    state: 'MI',
    topic: 'Technology',
    source: 'MI Tech News',
    url: 'https://example.com/mi-tech',
    publishedAt: '2023-12-24'
  },
  {
    id: '24',
    title: 'Wisconsin Agriculture',
    content: 'WI supports farming sector.',
    state: 'WI',
    topic: 'Economy',
    source: 'WI Farm News',
    url: 'https://example.com/wi-agriculture',
    publishedAt: '2023-12-23'
  },
  {
    id: '25',
    title: 'Minnesota Healthcare',
    content: 'MN expands healthcare access.',
    state: 'MN',
    topic: 'Healthcare',
    source: 'MN Health News',
    url: 'https://example.com/mn-health',
    publishedAt: '2023-12-22'
  },
  {
    id: '26',
    title: 'Iowa Renewable Energy',
    content: 'IA invests in renewable energy.',
    state: 'IA',
    topic: 'Environment',
    source: 'IA Energy News',
    url: 'https://example.com/ia-energy',
    publishedAt: '2023-12-21'
  },
  {
    id: '27',
    title: 'Missouri Transportation',
    content: 'MO improves transportation.',
    state: 'MO',
    topic: 'Infrastructure',
    source: 'MO Transport News',
    url: 'https://example.com/mo-transport',
    publishedAt: '2023-12-20'
  },
  {
    id: '28',
    title: 'North Dakota Energy',
    content: 'ND updates energy policies.',
    state: 'ND',
    topic: 'Environment',
    source: 'ND Energy News',
    url: 'https://example.com/nd-energy',
    publishedAt: '2023-12-19'
  },
  {
    id: '29',
    title: 'South Dakota Agriculture',
    content: 'SD supports agricultural sector.',
    state: 'SD',
    topic: 'Economy',
    source: 'SD Farm News',
    url: 'https://example.com/sd-agriculture',
    publishedAt: '2023-12-18'
  },
  {
    id: '30',
    title: 'Nebraska Education',
    content: 'NE reforms education system.',
    state: 'NE',
    topic: 'Education',
    source: 'NE Education News',
    url: 'https://example.com/ne-education',
    publishedAt: '2023-12-17'
  },
  {
    id: '31',
    title: 'Kansas Technology',
    content: 'KS promotes tech sector.',
    state: 'KS',
    topic: 'Technology',
    source: 'KS Tech News',
    url: 'https://example.com/ks-tech',
    publishedAt: '2023-12-16'
  },
  // West
  {
    id: '32',
    title: 'California Housing',
    content: 'CA passes housing legislation.',
    state: 'CA',
    topic: 'Housing',
    source: 'CA News',
    url: 'https://example.com/ca-housing',
    publishedAt: '2023-12-15'
  },
  {
    id: '33',
    title: 'Oregon Climate Action',
    content: 'OR implements climate policies.',
    state: 'OR',
    topic: 'Environment',
    source: 'OR Environmental News',
    url: 'https://example.com/or-climate',
    publishedAt: '2023-12-14'
  },
  {
    id: '34',
    title: 'Washington Technology',
    content: 'WA invests in tech sector.',
    state: 'WA',
    topic: 'Technology',
    source: 'WA Tech News',
    url: 'https://example.com/wa-tech',
    publishedAt: '2023-12-13'
  },
  {
    id: '35',
    title: 'Nevada Gaming Regulations',
    content: 'NV updates gaming laws.',
    state: 'NV',
    topic: 'Economy',
    source: 'NV Gaming News',
    url: 'https://example.com/nv-gaming',
    publishedAt: '2023-12-12'
  },
  {
    id: '36',
    title: 'Idaho Agriculture',
    content: 'ID supports farming sector.',
    state: 'ID',
    topic: 'Economy',
    source: 'ID Farm News',
    url: 'https://example.com/id-agriculture',
    publishedAt: '2023-12-11'
  },
  {
    id: '37',
    title: 'Montana Conservation',
    content: 'MT passes conservation law.',
    state: 'MT',
    topic: 'Environment',
    source: 'MT Wildlife News',
    url: 'https://example.com/mt-conservation',
    publishedAt: '2023-12-10'
  },
  {
    id: '38',
    title: 'Wyoming Energy',
    content: 'WY diversifies energy sector.',
    state: 'WY',
    topic: 'Environment',
    source: 'WY Energy News',
    url: 'https://example.com/wy-energy',
    publishedAt: '2023-12-09'
  },
  {
    id: '39',
    title: 'Colorado Recreation',
    content: 'CO expands recreation areas.',
    state: 'CO',
    topic: 'Environment',
    source: 'CO Outdoors News',
    url: 'https://example.com/co-recreation',
    publishedAt: '2023-12-08'
  },
  // Southwest
  {
    id: '40',
    title: 'Arizona Water Conservation',
    content: 'AZ implements water measures.',
    state: 'AZ',
    topic: 'Environment',
    source: 'AZ Water News',
    url: 'https://example.com/az-water',
    publishedAt: '2023-12-07'
  },
  {
    id: '41',
    title: 'New Mexico Energy',
    content: 'NM promotes clean energy.',
    state: 'NM',
    topic: 'Environment',
    source: 'NM Energy News',
    url: 'https://example.com/nm-energy',
    publishedAt: '2023-12-06'
  },
  {
    id: '42',
    title: 'Texas Infrastructure',
    content: 'TX improves infrastructure.',
    state: 'TX',
    topic: 'Infrastructure',
    source: 'TX Tribune',
    url: 'https://example.com/tx-infrastructure',
    publishedAt: '2023-12-05'
  },
  {
    id: '43',
    title: 'Oklahoma Energy',
    content: 'OK updates energy sector.',
    state: 'OK',
    topic: 'Environment',
    source: 'OK Energy News',
    url: 'https://example.com/ok-energy',
    publishedAt: '2023-12-04'
  },
  // Non-Contiguous
  {
    id: '44',
    title: 'Hawaii Tourism',
    content: 'HI promotes sustainable tourism.',
    state: 'HI',
    topic: 'Economy',
    source: 'HI Tourism News',
    url: 'https://example.com/hi-tourism',
    publishedAt: '2023-12-03'
  },
  {
    id: '45',
    title: 'Alaska Conservation',
    content: 'AK strengthens conservation.',
    state: 'AK',
    topic: 'Environment',
    source: 'AK Wildlife News',
    url: 'https://example.com/ak-conservation',
    publishedAt: '2023-12-02'
  },
  {
    id: '46',
    title: 'Utah Public Lands',
    content: 'UT manages public lands.',
    state: 'UT',
    topic: 'Environment',
    source: 'UT Land News',
    url: 'https://example.com/ut-lands',
    publishedAt: '2023-12-01'
  },
  {
    id: '47',
    title: 'Maine Passes Renewable Energy Bill',
    content: 'Maine legislature approves major renewable energy initiative.',
    state: 'ME',
    topic: 'Environment',
    source: 'Maine News',
    url: 'https://example.com/me-energy',
    publishedAt: '2023-11-30'
  },
  {
    id: '48',
    title: 'New Hampshire Education Reform',
    content: 'NH implements new education standards.',
    state: 'NH',
    topic: 'Education',
    source: 'NH Chronicle',
    url: 'https://example.com/nh-education',
    publishedAt: '2023-11-29'
  },
  {
    id: '49',
    title: 'Vermont Healthcare Initiative',
    content: 'VT expands healthcare coverage.',
    state: 'VT',
    topic: 'Healthcare',
    source: 'VT News',
    url: 'https://example.com/vt-health',
    publishedAt: '2023-11-28'
  },
  {
    id: '50',
    title: 'Massachusetts Technology Innovation',
    content: 'MA launches new tech initiative.',
    state: 'MA',
    topic: 'Technology',
    source: 'MA Tech Review',
    url: 'https://example.com/ma-tech',
    publishedAt: '2023-11-27'
  }
];

interface SearchParams {
  state?: string;
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: SearchParams = {
      state: searchParams.get('state') || undefined,
      topic: searchParams.get('topic') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '6')
    };

    // Combine mock and additional articles
    let allArticles = [...mockArticles, ...additionalArticles];

    // Apply filters
    if (params.state) {
      const stateAbbr = params.state.toUpperCase();
      allArticles = allArticles.filter(article => article.state === stateAbbr);
    }
    if (params.topic) {
      allArticles = allArticles.filter(article => article.topic === params.topic);
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      allArticles = allArticles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = allArticles.length;
    const totalPages = Math.ceil(total / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedArticles = allArticles.slice(startIndex, endIndex);

    return new Response(JSON.stringify({
      articles: paginatedArticles,
      total,
      page: params.page,
      limit: params.limit,
      totalPages
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch articles' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const article = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'url', 'publishedAt'];
    for (const field of requiredFields) {
      if (!article[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Add the new article to our additional articles array
    const newArticle = {
      id: Date.now().toString(),
      title: article.title,
      content: article.content || '',
      state: article.state ? article.state.toUpperCase() : '',
      topic: article.topic || '',
      source: article.source || '',
      url: article.url,
      publishedAt: article.publishedAt
    };
    
    additionalArticles.unshift(newArticle);

    return new Response(JSON.stringify({ 
      message: 'Article added successfully',
      article: newArticle 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error adding article:', error);
    return new Response(JSON.stringify({ error: 'Failed to add article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
