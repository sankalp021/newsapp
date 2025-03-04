import { Article } from '@/types/types';
import { useState } from 'react';
import Image from 'next/image';
import { generateAIContent } from '@/services/api';
import AIContentModal from './AIContentModal';

interface NewsCardProps {
  article: Article;
  index?: number;
}

const NewsCard = ({ article, index = 0 }: NewsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiHeadline, setAiHeadline] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleCardClick = async () => {
    if (isGenerating) return;
    
    if (aiHeadline && aiSummary) {
      // If we already have AI content, just open the modal
      setIsModalOpen(true);
      return;
    }
    
    // Otherwise, generate the content first
    setIsGenerating(true);
    try {
      const { headline, summary } = await generateAIContent(article);
      setAiHeadline(headline);
      setAiSummary(summary);
      // Open modal with the generated content
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating AI content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate animation delay based on index
  const delay = `${0.1 * (index % 10)}s`;

  return (
    <>
      <article 
        className="news-card bg-black border border-white/10 shadow-lg rounded overflow-hidden flex flex-col cursor-pointer relative"
        style={{
          animationDelay: delay,
          opacity: 0,
          animation: 'fadeUp 0.8s forwards',
        }}
        onClick={handleCardClick}
      >
        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-7 w-7 sm:h-8 sm:w-8 text-[rgb(var(--red))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 font-medium text-white/80 text-sm sm:text-base">Generating AI Summary...</p>
            </div>
          </div>
        )}

        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={article.urlToImage || '/placeholder-image.jpg'}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            onError={(e: any) => {
              e.currentTarget.src = '/placeholder-image.jpg';
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80"></div>
          
          {/* More responsive badges */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center">
            <span className="inline-block px-2 py-1 sm:px-3 sm:py-1.5 bg-[rgb(var(--red))] text-white text-xs font-bold uppercase rounded-full tracking-wider">
              {article.source.name}
            </span>
            <span className="inline-block ml-2 text-xs font-medium bg-black/50 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
              {formatDate(article.publishedAt)}
            </span>
          </div>

          {/* Show indicator if AI content is available */}
          {aiHeadline && aiSummary && (
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <div className="bg-white/10 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <span className="text-[rgb(var(--red))]">AI</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Card content - more responsive */}
        <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 line-clamp-3 heading">
            {article.title}
          </h3>
          
          <p className={`text-white/70 mb-3 md:mb-4 flex-1 text-sm sm:text-base ${isExpanded ? '' : 'line-clamp-3'}`}>
            {article.description}
          </p>
          
          {/* Footer - more compact on mobile */}
          <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-xs sm:text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center"
            >
              {isExpanded ? (
                <>
                  <span>Less</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </>
              ) : (
                <>
                  <span>More</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </>
              )}
            </button>
            
            {/* More compact on mobile */}
            <div className="flex items-center">
              <div className="hidden sm:block px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/5 text-xs text-white/60">
                Click for AI Summary
              </div>
              <div className="flex items-center justify-center ml-0 sm:ml-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[rgb(var(--red))]/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[rgb(var(--red))]">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* AI Content Modal */}
      <AIContentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={article}
        aiHeadline={aiHeadline}
        aiSummary={aiSummary}
      />
    </>
  );
};

export default NewsCard;
