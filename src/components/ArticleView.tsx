import React, { useState } from 'react';
import { Article } from '../types/types';
// import { askQuestion } from '../services/api';

interface Props {
  article: Article;
  summary: string;
}

const ArticleView: React.FC<Props> = ({ article, summary }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

//   const handleAskQuestion = async () => {
//     setLoading(true);
//     try {
//       const response = await askQuestion(article.content, question);
//       setAnswer(response);
//     } catch (error) {
//       console.error('Error asking question:', error);
//     }
//     setLoading(false);
//   };

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
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Ask AI about this article</h2>
        <textarea
          className="w-full p-2 rounded border mb-4"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the article..."
        />
        {/* <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={handleAskQuestion}
          disabled={loading || !question}
        >
          {loading ? 'Loading...' : 'Ask Question'}
        </button> */}
        {answer && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Answer:</h3>
            <p className="text-gray-700">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleView;
