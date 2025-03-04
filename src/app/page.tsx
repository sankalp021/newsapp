'use client';

import { useEffect, useState, useCallback } from 'react';
import { Article } from '@/types/types';
import { fetchNews, NewsCategory } from '@/services/api';
import NewsCard from '@/components/NewsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import Navbar from '@/components/Navbar';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [totalResults, setTotalResults] = useState(0);
  const [category, setCategory] = useState<NewsCategory>('general');
  const [query, setQuery] = useState('');

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the cursor for the current page if available
      const currentCursor = cursorHistory[page - 1] || null;

      const { 
        articles: newsArticles, 
        totalResults: total, 
        hasNextPage,
        nextCursor: newNextCursor
      } = await fetchNews({
        cursor: currentCursor || undefined,
        category,
        query: query.trim(),
      });
      
      if (newsArticles.length === 0) {
        setError('No articles found');
      } else {
        setArticles(newsArticles);
        setTotalResults(total);
        setNextCursor(newNextCursor);
        
        // Update cursor history if we got a new cursor
        if (newNextCursor && page >= cursorHistory.length - 1) {
          setCursorHistory(prev => [...prev, newNextCursor]);
        }
      }
    } catch (error) {
      console.error('Error loading news:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to load news'
      );
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [category, query, page, cursorHistory]);

  // Reset pagination when search or category changes
  useEffect(() => {
    setPage(1);
    setNextCursor(null);
    setCursorHistory([null]);
  }, [category, query]);

  // Load news when page, category or query changes
  useEffect(() => {
    const timeoutId = setTimeout(loadNews, query ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [query, category, page, loadNews]);

  // Function to handle page change and scroll to top
  const handlePageChange = useCallback((newPage: number) => {
    // Only allow going to next page if we have a cursor for it
    if (newPage > page && !nextCursor) return;
    
    // Only allow going to pages we have cursors for
    if (newPage > cursorHistory.length) return;
    
    setPage(newPage);
    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [page, nextCursor, cursorHistory.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar
        onSearch={setQuery}
        onCategoryChange={setCategory}
        currentCategory={category}
      />
      
      <main className="pt-24">
        <div className="container mx-auto px-4 mb-12">
          <h1 className="text-[12vw] font-bold leading-none tracking-tighter">
            {query ? (
              <>SEARCH: <span className="text-gray-600">{query.toUpperCase()}</span></>
            ) : (
              <>{category.toUpperCase()}</>
            )}
          </h1>
        </div>

        {loading && !articles.length ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={loadNews} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
              {articles.map((article, index) => {
                // Create a unique identifier based on multiple properties
                const uniqueKey = `${article.source.name}-${article.title}-${index}`;
                return (
                  <NewsCard 
                    key={uniqueKey}
                    article={article}
                  />
                );
              })}
            </div>

            <div className="container mx-auto px-4 py-12">
              <div className="flex justify-between items-center text-2xl font-bold">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`py-2 px-4 ${page === 1 ? 'text-gray-600' : 'hover:bg-white hover:text-black'} transition-all duration-300`}
                >
                  ← PREVIOUS
                </button>
                
                <span>PAGE {page}</span>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!nextCursor}
                  className={`py-2 px-4 ${!nextCursor ? 'text-gray-600' : 'hover:bg-white hover:text-black'} transition-all duration-300`}
                >
                  NEXT →
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
