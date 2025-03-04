const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="relative w-24 h-24">
        {/* Pulse effect in background with red */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[rgb(var(--red))] rounded-full opacity-5 animate-ping"></div>
        
        {/* Base ring */}
        <div className="absolute top-0 left-0 w-full h-full border-8 border-white/10 rounded-full"></div>
        
        {/* Spinning ring with red accent */}
        <div className="absolute top-0 left-0 w-full h-full border-8 border-t-[rgb(var(--red))] border-r-white/50 rounded-full animate-spin"></div>
        
        {/* Center logo */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-[rgb(var(--red))] text-xl font-black">N</span>
        </div>
      </div>
      
      {/* Loading text with animated dots */}
      <div className="mt-8 text-center">
        <h3 className="text-xl font-bold">Loading News</h3>
        <div className="flex justify-center mt-2 space-x-2">
          <div className="w-2 h-2 bg-[rgb(var(--red))] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[rgb(var(--red))] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-[rgb(var(--red))] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
