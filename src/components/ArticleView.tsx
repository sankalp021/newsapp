import React from 'react';
import { Article } from '../types/types';

interface Props {
  article: Article;
  summary: string;
}

const ArticleView: React.FC<Props> = ({ article, summary }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p className="text-gray-700">{summary}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Full Article</h2>
        <p className="text-gray-700">{article.content}</p>
      </div>
    </div>
  );
};

export default ArticleView;
