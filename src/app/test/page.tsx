'use client';

import { useState, useEffect } from 'react';
import { fetchNews } from '@/services/api';
import { Article } from '@/types/types';

export default function TestPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        const result = await fetchNews({ language: 'en' });
        console.log('API Response:', result);
        setArticles(result.articles);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Direct API Test</h1>
      
      {loading && <div>Loading...</div>}
      
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <div key={index} className="border p-4 rounded">
            <h2 className="text-xl font-bold">{article.title}</h2>
            <p className="text-gray-600">{article.description}</p>
            <div className="text-sm mt-2">
              Source: {article.source.name} | {new Date(article.publishedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
