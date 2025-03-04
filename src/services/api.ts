import axios, { AxiosError } from 'axios';
import { Article } from '../types/types';
import { NewsDataHubResponse, NewsDataHubArticle, NewsTopic } from '../types/newsdatahub';

class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Map our general category to appropriate topics for NewsDataHub
export type NewsCategory = NewsTopic | 'general';

interface NewsParams {
  page?: number;
  cursor?: string;
  category?: NewsCategory;
  query?: string;
  language?: string;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

// Create a NewsDataHub client directly instead of using proxy API
const createNewsDataHubClient = () => {
  // Use public API key from environment
  const apiKey = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
  
  return axios.create({
    baseURL: 'https://api.newsdatahub.com/v1',
    headers: {
      'X-Api-Key': apiKey || '',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
};

const newsClient = createNewsDataHubClient();

export const fetchNews = async ({
  page,
  cursor,
  category,
  query = '',
  language = 'en',
  pageSize = 10,
  startDate,
  endDate
}: NewsParams = {}): Promise<{
  articles: Article[];
  totalResults: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}> => {
  try {
    const queryParams: Record<string, string> = {
      language,
    };

    // Add cursor for pagination if available
    if (cursor) {
      queryParams.cursor = cursor;
    }

    // Add search query if available
    if (query) {
      queryParams.q = query;
    }

    // Add topic/category filter if available
    // "general" is handled separately (returns all categories)
    if (category && category !== 'general') {
      queryParams.topic = category;
    }

    // Add date filters if available
    if (startDate) {
      queryParams.start_date = startDate;
    }
    
    if (endDate) {
      queryParams.end_date = endDate;
    }

    console.log('Request params:', queryParams); // Debug log

    // Make direct request to NewsDataHub API instead of through our own API route
    const response = await newsClient.get('/news', { 
      params: queryParams 
    });
    
    const data: NewsDataHubResponse = response.data;

    // For debugging
    console.log('Response structure:', Object.keys(data || {}));

    if (!data) {
      throw new APIError('Empty response from NewsDataHub');
    }

    if (data.error) {
      throw new APIError(data.error);
    }

    // Check if the response has the expected data structure
    if (!Array.isArray(data.data)) {
      console.error('Invalid results format:', data);
      
      // Handle the case where the API returns an error object
      if (data.error || (data as any).message) {
        throw new APIError((data.error || (data as any).message) as string);
      }
      
      return {
        articles: [],
        totalResults: 0,
        hasNextPage: false,
        nextCursor: null
      };
    }

    const articles: Article[] = data.data
      // First, ensure we have valid data
      .filter((article: NewsDataHubArticle) => (
        article.title && 
        article.article_link && 
        article.pub_date
      ))
      // Then, create a Set to track unique titles
      .reduce((unique: NewsDataHubArticle[], article: NewsDataHubArticle) => {
        const isDuplicate = unique.some(
          (a) => a.title === article.title || a.article_link === article.article_link
        );
        if (!isDuplicate) {
          unique.push(article);
        }
        return unique;
      }, [])
      // Finally, map to our Article type
      .map((article: NewsDataHubArticle) => ({
        title: article.title.trim(),
        description: article.description?.trim() || article.title,
        content: article.content?.trim() || article.description || article.title,
        url: article.article_link,
        urlToImage: article.media_url || article.media_thumbnail || '/placeholder-image.jpg',
        publishedAt: article.pub_date,
        source: {
          name: article.source_title || 'Unknown Source'
        }
      }));

    return {
      articles,
      totalResults: data.total_results || 0,
      hasNextPage: !!data.next_cursor,
      nextCursor: data.next_cursor
    };
  } catch (error) {
    console.error('NewsDataHub Error Details:', error);
    if (error instanceof AxiosError) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message ||
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
    
    const promptHeadline = `Craft a sharp, witty, or darkly humorous headline (max 10 words) that captures the essence of this news. If it's not crime-related, feel free to make it satirical or ironic. No fluff—make it hit hard: ${combinedContent} give a single headline only`;
    const promptSummary = `Summarize this news article in exactly 100 words, blending analysis with biting wit, irony, or dark humor (if it doesn’t involve crime). Highlight the main event, key details, and broader implications while keeping it bold, engaging, and slightly irreverent : ${combinedContent} dont use unnecessary inverted commas`;


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
