interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-[rgb(var(--red))]/20 flex items-center justify-center mb-8 relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        {/* Pulsing effect */}
        <div className="absolute inset-0 rounded-full bg-[rgb(var(--red))] animate-ping opacity-5"></div>
      </div>
      
      <h2 className="text-4xl font-black mb-4 heading">News Unavailable</h2>
      <p className="text-xl text-white/70 mb-8 max-w-lg">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-white text-black hover:bg-[rgb(var(--red))] hover:text-white transition-colors py-3 px-6 rounded font-bold flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
