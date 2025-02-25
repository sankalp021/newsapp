import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://api.apitube.io/v1/news';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.NEXT_PUBLIC_APITUBE_API_KEY;
  
  const endpoint = searchParams.get('endpoint') || 'everything';
  const queryParams = Object.fromEntries(searchParams.entries());
  delete queryParams.endpoint;

  // Handle category parameter separately
  const category = queryParams.category;
  delete queryParams.category;

  // Build the URL with the correct format
  let url = `https://api.apitube.io/v1/news/${endpoint}`;
  
  // Handle category endpoint differently
  if (endpoint === 'category' && category) {
    url = `https://api.apitube.io/v1/news/category/${category}`;
  }

  // Add API key and other parameters
  const finalUrl = `${url}?${new URLSearchParams({
    api_key: apiKey || '',
    ...queryParams
  })}`;

  console.log('Request URL:', finalUrl); // Debug log

  try {
    const response = await fetch(finalUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    console.log('APITube raw response:', data); // Debug log

    if (!response.ok || data.status === 'not_ok') {
      throw new Error(data.error || 'Failed to fetch news');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        status: 'not_ok',
        error: error instanceof Error ? error.message : 'Failed to fetch news'
      },
      { status: 500 }
    );
  }
}
