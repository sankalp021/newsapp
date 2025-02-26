import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.APITUBE_API_KEY || process.env.NEXT_PUBLIC_APITUBE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      status: 'not_ok',
      error: 'API key not configured' 
    }, { status: 500 });
  }

  const endpoint = searchParams.get('endpoint') || 'everything';
  const params = Object.fromEntries(searchParams.entries());
  delete params.endpoint;

  const category = params.category;
  delete params.category;

  const url = endpoint === 'category' && category
    ? `https://api.apitube.io/v1/news/category/${category}`
    : `https://api.apitube.io/v1/news/${endpoint}`;

  const finalUrl = `${url}?${new URLSearchParams({
    api_key: apiKey,
    ...params
  })}`;

  try {
    const response = await fetch(finalUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 'not_ok') {
      throw new Error(data.error || 'Failed to fetch news');
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'not_ok',
        error: error instanceof Error ? error.message : 'Failed to fetch news'
      },
      { status: 500 }
    );
  }
}
