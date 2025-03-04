import { Article } from '@/types/types';
import Modal from './Modal';
import Image from 'next/image';

interface AIContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
  aiHeadline: string | null;
  aiSummary: string | null;
}

const AIContentModal = ({ isOpen, onClose, article, aiHeadline, aiSummary }: AIContentModalProps) => {
  // Helper function to clean any remaining special characters
  const cleanText = (text: string | null): string => {
    if (!text) return "";
    // Remove any remaining markdown or special characters
    return text.replace(/[\*\"\'\_\`\~\#\>\<\[\]\(\)\{\}\|\\\^\=]/g, '');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 sm:space-y-5">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-5">
          {/* Image - responsive sizing */}
          <div className="relative w-full md:w-1/3 h-40 sm:h-48 md:h-auto rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={article.urlToImage || '/placeholder-image.jpg'}
              alt={article.title}
              fill
              className="object-cover"
              onError={(e: any) => {
                e.currentTarget.src = '/placeholder-image.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
            <div className="absolute bottom-2 left-2">
              <span className="inline-block px-2 py-1 bg-[rgb(var(--red))] text-white text-xs font-bold uppercase rounded-full tracking-wider">
                {article.source.name}
              </span>
            </div>
          </div>
          
          {/* Content - better spacing on mobile */}
          <div className="flex-grow">
            {/* AI label and headline */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-xs font-medium text-white/60">AI GENERATED SUMMARY</span>
              <span className="px-2 py-0.5 rounded bg-[rgb(var(--red))]/20 text-xs font-medium text-[rgb(var(--red))]">BETA</span>
            </div>
            
            <div className="border-l-3 border-[rgb(var(--red))] pl-2 sm:pl-3">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 heading leading-tight">
                {cleanText(aiHeadline) || "AI is generating a headline..."}
              </h2>
            </div>
          </div>
        </div>

        {/* AI Summary - improved for mobile */}
        <div className="prose prose-invert max-w-none text-sm sm:text-base">
          <p className="leading-relaxed">
            {cleanText(aiSummary) || "AI is generating a summary..."}
          </p>
        </div>
        
        {/* Original article link - better mobile layout */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-xs text-white/50 order-2 sm:order-1">
              <p>AI-generated summary. May not be fully accurate.</p>
            </div>
            
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-white text-black hover:bg-[rgb(var(--red))] hover:text-white py-2 px-3 rounded text-sm font-medium transition-colors order-1 sm:order-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Read Original Article
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AIContentModal;
