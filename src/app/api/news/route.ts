import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.NEWSDATA_API_KEY; // Use server-side env variable
  
  if (!apiKey) {
    console.error("API key not found");
    return NextResponse.json(
      { 
        error: "API key not configured"
      },
      { status: 500 }
    );
  }

  // Build the URL for NewsDataHub API
  const baseUrl = 'https://api.newsdatahub.com/v1/news';
  
  // Create a new URLSearchParams object for the query parameters
  const params = new URLSearchParams();
  
  // Handle special parameters
  const size = searchParams.get('per_page') || searchParams.get('pageSize') || '10';
  // Size parameter not needed in URL, API has default
  
  // Copy all other parameters from the request, excluding ones we handle specially
  for (const [key, value] of searchParams.entries()) {
    if (!['per_page', 'pageSize', 'topic'].includes(key) || (key === 'topic' && value !== 'general')) {
      params.append(key, value);
    }
  }

  const finalUrl = `${baseUrl}?${params.toString()}`;
  console.log('Request URL:', finalUrl); // Debug log

  try {
    const response = await fetch(finalUrl, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ByteNewz/1.0'
      }
    });

    console.log('Response status:', response.status);

    // Try to parse response regardless of status for better error handling
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse response:', e);
      data = null;
    }

    console.log('Response data structure:', data ? Object.keys(data) : 'No data');

    if (!response.ok) {
      // Handle error based on status code
      const errorMessage = data?.error || data?.message || `Failed to fetch news: ${response.status}`;
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Add pagination info if missing - it seems the API might have a different structure
    // than what we initially expected
    const responseData = {
      ...data,
      // Make sure we have these fields even if the API doesn't return them
      per_page: parseInt(size),
      total_results: data.total_results || (data.data?.length || 0),
      next_cursor: data.next_cursor || null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch news'
      },
      { status: 500 }
    );
  }
}
