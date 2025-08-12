import { NextResponse } from 'next/server';

// Helper to create a response with CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request (preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { 
    status: 204,
    headers: corsHeaders
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY; // Use server-side env variable
  
  if (!apiKey) {
    console.error("API key not found");
    return NextResponse.json(
      { error: "API key not configured" },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }

  // Build the URL for NewsData.io API
  const baseUrl = 'https://newsdata.io/api/1/latest';
  
  // Create a new URLSearchParams object for the query parameters
  const params = new URLSearchParams();
  
  // Add API key as query parameter (NewsData.io requirement)
  params.append('apikey', apiKey);
  
  // Handle special parameters for NewsData.io
  const size = searchParams.get('per_page') || searchParams.get('pageSize') || '10';
  params.append('size', size);
  
  // Map common parameters to NewsData.io format
  const category = searchParams.get('category');
  if (category && category !== 'general') {
    params.append('category', category);
  }
  
  const country = searchParams.get('country');
  if (country) {
    params.append('country', country);
  }
  
  const language = searchParams.get('language');
  if (language) {
    params.append('language', language);
  }
  
  const q = searchParams.get('q') || searchParams.get('query');
  if (q) {
    params.append('q', q);
  }
  
  // Handle pagination with NewsData.io's nextPage parameter
  const nextPage = searchParams.get('page') || searchParams.get('nextPage');
  if (nextPage) {
    params.append('page', nextPage);
  }

  const finalUrl = `${baseUrl}?${params.toString()}`;
  console.log('Request URL:', finalUrl); // Debug log
  try {
    const response = await fetch(finalUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ByteNewz/1.0'
      }
    });

    console.log('Response status:', response.status);

    // Try to parse response regardless of status for better error handling
    let data;
    try {
      data = await response.json();    } catch (e) {
      console.error('Failed to parse response:', e);
      data = null;
    }

    console.log('Response data structure:', data ? Object.keys(data) : 'No data');

    if (!response.ok) {
      // Handle error based on status code
      const errorMessage = data?.results?.message || data?.message || `Failed to fetch news: ${response.status}`;  
      console.error('API Error:', errorMessage);
      
      return NextResponse.json(
        { error: errorMessage }, 
        { 
          status: response.status,
          headers: corsHeaders
        }
      );
    }
    
    // NewsData.io response structure adaptation
    // NewsData.io returns: { status, totalResults, results: [...], nextPage }
    const responseData = {
      status: data.status,
      totalResults: data.totalResults || 0,
      results: data.results || [],
      nextPage: data.nextPage || null,
      // Keep backward compatibility
      data: data.results || [],
      total_results: data.totalResults || 0,
      per_page: parseInt(size),
      next_cursor: data.nextPage || null,
    };

    return NextResponse.json(responseData, { headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch news' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}
