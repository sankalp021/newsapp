import React, { useState } from 'react';
import { Article } from '../types/types';
import { generateAIContent } from '@/services/api';
import Image from 'next/image';
import Modal from './Modal';

interface Props {
  article: Article;
}

const NewsCard: React.FC<Props> = ({ article }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiContent, setAiContent] = useState<{ headline: string; summary: string } | null>(null);

  const handleClick = async () => {
    setIsModalOpen(true);
    if (!aiContent) {
      setIsLoading(true);
      try {
        const content = await generateAIContent(article);
        setAiContent(content);
      } catch (error) {
        console.error('Error generating AI content:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div 
        className="group h-[500px] relative overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        <div className="absolute inset-0">
          <Image
            src={article.urlToImage || '/placeholder-image.jpg'}
            alt={article.title}
            fill
            className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-700" />
        </div>
        
        <div className="relative h-full p-8 flex flex-col justify-between">
          <div>
            <span className="inline-block px-4 py-2 bg-white text-black text-sm font-bold mb-4">
              {article.source.name}
            </span>
            <h2 className="text-3xl font-bold leading-tight mb-4 transform group-hover:-translate-y-2 transition-transform duration-700">
              { article.title}
            </h2>
          </div>

          <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
            <p className="text-lg text-gray-300 mb-6">
              {article.description}
            </p>
            
            <div className="flex items-center justify-between">
              <time className="text-sm text-gray-400">
                {new Date(article.publishedAt).toLocaleDateString()}
              </time>
              <span className="text-sm text-white/60">Click to read summary →</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={article.title}
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <span>{article.source.name}</span>
            <span>•</span>
            <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {/* <div className="border-l-4 border-white/20 pl-4">
                  <h3 className="text-sm uppercase text-white/60 mb-2">Original Headline</h3>
                  <p className="text-xl text-white">{article.title}</p>
                </div> */}
                
                {aiContent?.headline && (
                  <div className="border-l-4 border-white/20 pl-4">
                    <h3 className="text-sm uppercase text-white/60 mb-2">AI Suggested Headline</h3>
                    <p className="text-xl text-white">{aiContent.headline}</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-sm uppercase text-white/60 mb-4">AI Summary</h3>
                <p className="text-lg leading-relaxed text-white">
                  {aiContent?.summary || article.description}
                </p>
              </div>
            </>
          )}
          
          {article.url && (
            <a 
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Read Full Article →
            </a>
          )}
        </div>
      </Modal>
    </>
  );
};

export default NewsCard;
