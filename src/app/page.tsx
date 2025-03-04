'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Article } from '@/types/types';
import { fetchNews, NewsCategory } from '@/services/api';
import NewsCard from '@/components/NewsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  // State variables
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [totalResults, setTotalResults] = useState(0);
  const [category, setCategory] = useState<NewsCategory>('general');
  const [query, setQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Prevent double loading by tracking state changes
  const isInitialMount = useRef(true);
  const prevCategory = useRef(category);
  const prevQuery = useRef(query);
  const prevTopics = useRef(selectedTopics);
  const loadingRef = useRef(false);

  const loadNews = useCallback(async () => {
    // Prevent duplicate requests
    if (loadingRef.current) return;
    
    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);

      console.log(`Fetching news: category=${category}, page=${page}, query=${query}`);
      
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
        topics: selectedTopics.length > 0 ? selectedTopics : undefined
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
          : 'Failed to fetch news'
      );
      setArticles([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [category, query, page, cursorHistory, selectedTopics]);

  // Unified effect to handle all state changes that require data loading
  useEffect(() => {
    // Skip first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadNews();
      return;
    }
    
    // Check if category, query or topics changed
    const categoryChanged = category !== prevCategory.current;
    const queryChanged = query !== prevQuery.current;
    const topicsChanged = JSON.stringify(selectedTopics) !== JSON.stringify(prevTopics.current);
    
    // Reset pagination when filters change
    if (categoryChanged || queryChanged || topicsChanged) {
      console.log('Filters changed, resetting pagination');
      setPage(1);
      setNextCursor(null);
      setCursorHistory([null]);
      
      // Update refs
      prevCategory.current = category;
      prevQuery.current = query;
      prevTopics.current = selectedTopics;
      
      // Use a small timeout for search to avoid too frequent API calls while typing
      const timeoutId = setTimeout(loadNews, query && queryChanged ? 300 : 0);
      return () => clearTimeout(timeoutId);
    } else {
      // Only load news if page changed but filters didn't
      loadNews();
    }
  }, [category, query, selectedTopics, page, loadNews]);

  // Handler functions
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    // Clear category selection if performing a search
    if (newQuery) {
      setCategory('general');
      setSelectedTopics([]);
    }
  }, []);

  const handleCategoryChange = useCallback((newCategory: NewsCategory) => {
    setCategory(newCategory);
    setQuery('');
    setSelectedTopics([]);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage > page && !nextCursor) return;
    if (newPage > cursorHistory.length) return;
    
    setPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [page, nextCursor, cursorHistory.length]);

  // Existing render code
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        currentCategory={category}
      />
      
      <main className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 overflow-hidden">
        {/* Header Section - more responsive */}
        <section className="container mx-auto px-4 md:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          {query ? (
            <div className="relative">
              <div className="max-w-4xl">
                <h2 className="text-xs sm:text-sm md:text-base uppercase tracking-widest text-[rgb(var(--red))] mb-2 sm:mb-4 font-bold">Search Results</h2>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-3 sm:mb-6 heading">
                  <span className="text-gradient">"{query}"</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/80 md:w-3/4">
                  Showing {articles.length} result{articles.length !== 1 ? 's' : ''} 
                  {totalResults > 0 ? ` of ${totalResults}` : ''}
                </p>
              </div>
              {/* Red decorative element - hide on small screens */}
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[rgb(var(--red))] rounded-full opacity-10 blur-3xl hidden sm:block"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="max-w-4xl">
                <h2 className="text-xs sm:text-sm md:text-base uppercase tracking-widest text-[rgb(var(--red))] mb-2 sm:mb-4 font-bold">Breaking News</h2>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-3 sm:mb-6 heading">
                  <span className="text-gradient">{category.toUpperCase()}</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/80 md:w-3/4">
                  Latest {category} headlines and breaking stories from around the world
                </p>
              </div>
              {/* Red decorative element - hide on small screens */}
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[rgb(var(--red))] rounded-full opacity-10 blur-3xl hidden sm:block"></div>
            </div>
          )}
        </section>

        {/* Content section */}
        {loading && !articles.length ? (
          <div className="container mx-auto px-4 md:px-8 py-12 sm:py-16 md:py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="container mx-auto px-4 md:px-8 py-12 sm:py-16 md:py-20">
            <ErrorDisplay message={error} onRetry={loadNews} />
          </div>
        ) : (
          <>
            {/* News Grid - improve responsive layout */}
            <section className="container mx-auto px-4 md:px-8 pb-8 sm:pb-12 md:pb-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                {articles.map((article, index) => {
                  const uniqueKey = `${article.source.name}-${article.title}-${index}`;
                  return (
                    <NewsCard 
                      key={uniqueKey}
                      article={article}
                      index={index}
                    />
                  );
                })}
              </div>
            </section>

            {/* Pagination - improve for mobile */}
            <section className="container mx-auto px-4 md:px-8 py-8 md:py-12">
              <div className="relative border-t-2 border-white/10 pt-8 sm:pt-10">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`group py-3 px-6 flex items-center gap-3 bg-white/5 hover:bg-[rgb(var(--red))]/20 rounded-lg transition-all ${
                      page === 1 ? 'opacity-30 cursor-not-allowed hover:bg-white/5' : ''
                    }`}
                    aria-label="Go to previous page"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="22" 
                      height="22" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="group-hover:transform group-hover:-translate-x-1 transition-transform"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span className="font-bold">PREVIOUS</span>
                  </button>
                  
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-black px-6">
                    <span className="text-2xl font-bold">
                      PAGE <span className="text-[rgb(var(--red))]">{page}</span>
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!nextCursor}
                    className={`group py-3 px-6 flex items-center gap-3 bg-white/5 hover:bg-[rgb(var(--red))]/20 rounded-lg transition-all ${
                      !nextCursor ? 'opacity-30 cursor-not-allowed hover:bg-white/5' : ''
                    }`}
                    aria-label="Go to next page"
                  >
                    <span className="font-bold">NEXT</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="22" 
                      height="22" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="group-hover:transform group-hover:translate-x-1 transition-transform"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer with red accent on hover */}
      <footer className="relative overflow-hidden border-t-2 border-white/10 py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h3 className="text-3xl font-black heading mb-2">
                 ByteNews<span className="ml-0.5 text-[rgb(var(--red))]">.</span>
              </h3>
              <p className="text-white/60">Breaking stories. Real-time updates.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 md:items-center">
              <div className="flex gap-6">
                <Link href="#" className="text-white/70 hover:text-[rgb(var(--red))] transition-colors font-medium">About</Link>
                <Link href="#" className="text-white/70 hover:text-[rgb(var(--red))] transition-colors font-medium">Contact</Link>
                <Link href="#" className="text-white/70 hover:text-[rgb(var(--red))] transition-colors font-medium">Privacy</Link>
              </div>
              <div className="flex items-center gap-4">
                {/* Social Icons with red hover */}
                <Link href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[rgb(var(--red))]/20 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </Link>
                <Link href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[rgb(var(--red))]/20 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Link>
                <Link href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[rgb(var(--red))]/20 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center md:text-left">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} ByteNews.
            </p>
          </div>
        </div>
        
        {/* Red decorative element */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[rgb(var(--red))] rounded-full opacity-5 blur-3xl"></div>
      </footer>
    </div>
  );
}
