import axios, { AxiosError } from 'axios';
import { Article } from '../types/types';
import { NewsTopic } from '../types/newsdatahub';

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
  topics?: string[]; // Added support for multiple topics
}

// Create a client for our Next.js API route instead of direct external API calls
const createAPIClient = () => {
  return axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
};

const apiClient = createAPIClient();

export const fetchNews = async ({
  page,
  cursor,
  category,
  query = '',
  language = 'en',
  pageSize = 10,
  startDate,
  endDate,
  topics = []
}: NewsParams = {}): Promise<{
  articles: Article[];
  totalResults: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}> => {
  try {
    const queryParams: Record<string, string | string[]> = {
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

    // Add multiple topics if specified
    if (topics.length > 0) {
      queryParams.topic = topics;
    }

    // Add date filters if available
    if (startDate) {
      queryParams.start_date = startDate;
    }
    
    if (endDate) {
      queryParams.end_date = endDate;
    }    console.log('Request params:', queryParams); // Debug log

    // Make request to our Next.js API route which handles NewsData.io integration
    const response = await apiClient.get('/news', { 
      params: queryParams 
    });
    
    const data = response.data;

    // For debugging
    console.log('Response structure:', Object.keys(data || {}));

    if (!data) {
      throw new APIError('Empty response from API');
    }

    if (data.error) {
      throw new APIError(data.error);
    }

    // Handle NewsData.io response structure (via our API route)
    // Our API route returns both NewsData.io format and backward compatibility
    const results = data.results || data.data || [];
    
    if (!Array.isArray(results)) {
      console.error('Invalid results format:', data);
      
      // Handle the case where the API returns an error object
      if (data.error || data.message) {
        throw new APIError(data.error || data.message);
      }
      
      return {
        articles: [],
        totalResults: 0,
        hasNextPage: false,
        nextCursor: null
      };
    }

    const articles: Article[] = results
      // First, ensure we have valid data - NewsData.io has different field names
      .filter((article: any) => (
        article.title && 
        (article.link || article.article_link) && 
        (article.pubDate || article.pub_date)
      ))
      // Then, create a Set to track unique titles
      .reduce((unique: any[], article: any) => {
        const isDuplicate = unique.some(
          (a) => a.title === article.title || 
                 (a.link || a.article_link) === (article.link || article.article_link)
        );
        if (!isDuplicate) {
          unique.push(article);
        }
        return unique;
      }, [])
      // Finally, map to our Article type - handle both NewsData.io and NewsDataHub formats
      .map((article: any) => ({
        title: article.title.trim(),
        description: article.description?.trim() || article.content?.trim() || article.title,
        content: article.content?.trim() || article.description?.trim() || article.title,
        url: article.link || article.article_link,
        urlToImage: article.image_url || article.media_url || article.media_thumbnail || '/placeholder-image.jpg',
        publishedAt: article.pubDate || article.pub_date,
        source: {
          name: article.source_id || article.source_title || 'Unknown Source'
        }
      }));

    return {
      articles,
      totalResults: data.totalResults || data.total_results || 0,
      hasNextPage: !!(data.nextPage || data.next_cursor),
      nextCursor: data.nextPage || data.next_cursor || null
    };  } catch (error) {
    console.error('API Error Details:', error);
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

export const generateAIContent = async (article: Article): Promise<{ headline: string; summary: string }> => {
  try {
    // Generation runs server-side (see /app/api/ai/route.ts) so the Google API
    // key is never exposed to the browser and the model can be swapped without
    // a client rebuild.
    const response = await apiClient.post('/ai', {
      title: article.title,
      description: article.description,
      content: article.content,
    });

    const data = response.data;

    if (data?.error) {
      throw new APIError(data.error);
    }

    return {
      headline: data?.headline || article.title,
      summary: data?.summary || article.description,
    };
  } catch (error) {
    // Surface the real failure instead of silently masquerading the plain
    // article text as an AI summary — that hid broken keys / retired models.
    let message = 'Failed to generate AI summary';
    if (error instanceof AxiosError) {
      message = error.response?.data?.error || error.message || message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    console.error('AI generation error:', message);
    throw new APIError(message);
  }
};
