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
  const [totalResults, setTotalResults] = useState(0);
  const [category, setCategory] = useState<NewsCategory>('general');
  const [query, setQuery] = useState('');

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { articles: newsArticles, totalResults: total, hasNextPage } = await fetchNews({
        page,
        category,
        query: query.trim(),
      });
      
      if (newsArticles.length === 0) {
        setError('No articles found');
      } else {
        setArticles(newsArticles);
        setTotalResults(total);
        
        if (!hasNextPage) {
          setPage(1);
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
  }, [category, query, page]);

  useEffect(() => {
    const timeoutId = setTimeout(loadNews, query ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [query, loadNews]);

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
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative group disabled:opacity-50"
                >
                  <span className="relative z-10">← PREVIOUS</span>
                  <div className="absolute inset-0 bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </button>
                <span>PAGE {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={articles.length * page >= totalResults}
                  className="relative group disabled:opacity-50"
                >
                  <span className="relative z-10">NEXT →</span>
                  <div className="absolute inset-0 bg-white transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
