'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Article } from '@/types/types';
import ArticleView from '@/components/ArticleView';

export default function ArticlePage() {
  const { url } = useParams();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const storedArticle = localStorage.getItem(`article-${url}`);
    if (storedArticle) {
      setArticle(JSON.parse(storedArticle));
    }
  }, [url]);

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Article not found
      </div>
    );
  }

  return <ArticleView article={article} summary={article.description} />;
}
