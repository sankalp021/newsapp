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
  country?: string;
  pageSize?: number;
}

const initializeNewsApi = () => {
  if (!process.env.NEXT_PUBLIC_NEWS_API_KEY) {
    console.error('NEWS_API_KEY is not defined in environment variables');
    throw new APIError('API configuration error');
  }

  return axios.create({
    baseURL: 'https://newsapi.org/v2',
    headers: {
      'X-Api-Key': process.env.NEXT_PUBLIC_NEWS_API_KEY
    }
  });
};

let newsApi: ReturnType<typeof axios.create>;
try {
  newsApi = initializeNewsApi();
} catch (error) {
  console.error('Failed to initialize News API:', error);
  newsApi = axios.create(); // Create a basic instance that will fail gracefully
}

// Add response interceptor for rate limiting
newsApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      // Handle rate limiting
      console.error('Rate limit reached. Please try again later.');
      throw new APIError('Too many requests. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Queue system for API requests
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
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
    
    const promptHeadline = `Create a factual, engaging headline (max 10 words) that captures the main point of this news: ${combinedContent}`;
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

export const fetchNews = async ({
  page = 1,
  category = 'general',
  query = '',
  country = 'us',
  pageSize = 12
}: NewsParams = {}): Promise<{
  articles: Article[];
  totalResults: number;
}> => {
  try {
    if (!process.env.NEXT_PUBLIC_NEWS_API_KEY) {
      throw new APIError('News API key is missing. Please check your environment variables.');
    }

    const endpoint = query ? '/everything' : '/top-headlines';
    const params: Record<string, string | number> = {
      pageSize,
      page
    };

    if (query) {
      params.q = query;
    } else {
      params.country = country;
      params.category = category;
    }

    const response = await newsApi.get(endpoint, { params });

    if (!response.data || !Array.isArray(response.data.articles)) {
      throw new APIError('Invalid response from News API');
    }

    const articles = response.data.articles.map((article: any) => ({
      ...article,
      content: article.content || article.description || 'No content available',
      description: article.description || 'No description available',
      urlToImage: article.urlToImage || '/placeholder-image.jpg'
    }));

    return {
      articles,
      totalResults: response.data.totalResults || articles.length
    };
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 
                     error.message || 
                     'Failed to fetch news';
      console.error('News API Error:', error.response?.data || error.message);
      throw new APIError(`News API Error: ${message}`);
    }
    throw error;
  }
};
