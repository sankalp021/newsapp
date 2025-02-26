import axios, { AxiosError } from 'axios';
import { Article } from '../types/types';

class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export type NewsCategory = 
  | 'general' 
  | 'business' 
  | 'entertainment' 
  | 'health' 
  | 'science' 
  | 'sports' 
  | 'technology';

interface NewsParams {
  page?: number;
  category?: NewsCategory;
  query?: string;
  language?: string;
  pageSize?: number;
}

interface APITubeResponse {
  status: string;
  limit: number;
  page: number;
  has_next_pages: boolean;
  next_page: string;
  next_page_cursor: string;
  has_previous_page: boolean;
  previous_page: string;
  results: APITubeArticle[];
}

interface APITubeArticle {
  id: number;
  href: string;
  published_at: string;
  title: string;
  description: string;
  body: string;
  image: string;
  author: {
    id: string;
    name: string;
  };
  source: {
    id: number;
    domain: string;
    home_page_url: string;
    type: string;
    rankings: {
      opr: number;
    };
    location: {
      country_name: string;
      country_code: string;
    };
    favicon: string;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/news`
  : '/api/news';

const initializeNewsApi = () => {
  return axios.create({
    baseURL: BASE_URL
  });
};

const apiTube = initializeNewsApi();

export const fetchNews = async ({
  page = 1,
  category,
  query = '',
  language = 'en',
  pageSize = 12
}: NewsParams = {}): Promise<{
  articles: Article[];
  totalResults: number;
  hasNextPage: boolean;
}> => {
  try {
    const endpoint = query ? 'everything' : 'category';
    const queryParams = {
      endpoint,
      page: page.toString(),
      limit: pageSize.toString(),
      'language.code': language
    };

    if (query) {
      queryParams.q = query;
    } else if (category) {
      queryParams.category = category;
    }

    const response = await apiTube.get('', { params: queryParams });
    const data = response.data;

    if (!data || data.status === 'not_ok') {
      throw new APIError(data?.error || 'Invalid response from APITube');
    }

    if (!Array.isArray(data.results)) {
      console.error('Invalid results format:', data.results);
      return {
        articles: [],
        totalResults: 0,
        hasNextPage: false
      };
    }

    const articles: Article[] = data.results
      .filter((article: APITubeArticle) => article.title && article.href) // Only include valid articles
      .map((article: APITubeArticle) => ({
        title: article.title || 'No title available',
        description: article.description || 'No description available',
        content: article.body || article.description || 'No content available',
        url: article.href,
        urlToImage: article.image || '/placeholder-image.jpg',
        publishedAt: article.published_at || new Date().toISOString(),
        source: {
          name: article.source?.domain || 'Unknown Source'
        }
      }));

    return {
      articles,
      totalResults: parseInt(data.limit) || articles.length,
      hasNextPage: Boolean(data.has_next_pages)
    };
  } catch (error) {
    console.error('APITube Error Details:', error);
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error || 
                     error.message || 
                     'Failed to fetch news';
      throw new APIError(message);
    }
    throw error;
  }
};

// Queue system for API requests
class RequestQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private RATE_LIMIT_DELAY = 2000; // 2 seconds between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
            await new Promise(r => setTimeout(r, this.RATE_LIMIT_DELAY - timeSinceLastRequest));
          }
          this.lastRequestTime = Date.now();
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) await request();
    }
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// Update Gemini API URL to use the correct model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateAIContent = async (article: Article): Promise<{ headline: string; summary: string }> => {
  try {
    const combinedContent = `Title: ${article.title}\nDescription: ${article.description}\nContent: ${article.content}`;
    
    const promptHeadline = `Create a factual, engaging headline (max 10 words) that captures the main point of this news, just give one response as the heading you make will directly be displayed: ${combinedContent}`;
    const promptSummary = `Analyze this news article and provide a comprehensive summary in exactly 100 words. Include the main event, key details, implications, and relevant context: ${combinedContent}`;

    const result = await requestQueue.add(async () => {
      try {
        const [headlineRes, summaryRes] = await Promise.all([
          axios({
            url: GEMINI_API_URL,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            params: { key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY },
            data: {
              contents: [{ parts: [{ text: promptHeadline }] }]
            }
          }),
          axios({
            url: GEMINI_API_URL,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            params: { key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY },
            data: {
              contents: [{ parts: [{ text: promptSummary }] }]
            }
          })
        ]);

        return {
          headline: headlineRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || article.title,
          summary: summaryRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || article.description
        };
      } catch (error) {
        console.error('Full error details:', error);
        throw error;
      }
    });

    return result;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      headline: article.title,
      summary: article.description
    };
  }
};
