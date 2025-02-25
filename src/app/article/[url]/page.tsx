'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Article } from '@/types/types';
import ArticleView from '@/components/ArticleView';
// import { summarizeArticle } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ArticlePage() {
  const params = useParams() as { url: string };
  const [article, setArticle] = useState<Article | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchArticle = async () => {
//       if (!params.url) return;
//       try {
//         // Get article data from localStorage (stored when clicking "Read More")
//         const articleData = localStorage.getItem(`article-${params.url}`);
//         if (articleData) {
//           const parsedArticle = JSON.parse(articleData) as Article;
//           setArticle(parsedArticle);
//           const summary = await summarizeArticle(parsedArticle.content);
//           setSummary(summary);
//         }
//       } catch (error) {
//         console.error('Error fetching article:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchArticle();
//   }, [params.url]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return <ArticleView article={article} summary={summary} />;
}
