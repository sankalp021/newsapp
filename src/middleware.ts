import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add all allowed origins
const allowedOrigins = [
  'https://bytenewz.vercel.app',
  'https://newsapp-4uurterxd-sankalps-projects-47691efd.vercel.app',
  'https://newsapp.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

export function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '';
  
  // Check if the request is for the API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // For preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      // Create a new response
      const response = new NextResponse(null, {
        status: 204, // No content for OPTIONS requests
        headers: {
          'Access-Control-Allow-Origin': '*', // Allow any origin
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
          'Access-Control-Max-Age': '86400', // 24 hours
        },
      });
      return response;
    }
    
    // For actual requests
    const response = NextResponse.next();
    
    // Add CORS headers to allow any origin
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
    
    return response;
  }
  
  // For non-API routes, proceed normally
  return NextResponse.next();
}

// Configure the middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
};
