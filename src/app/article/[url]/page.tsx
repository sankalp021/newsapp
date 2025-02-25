'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Article } from '@/types/types';
import ArticleView from '@/components/ArticleView';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);

  if (!article) {
    return <div>Article not found</div>;
  }

  return <ArticleView article={article} summary={article.description} />;
}
