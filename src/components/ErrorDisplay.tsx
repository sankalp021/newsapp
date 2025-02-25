interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-white text-xl mb-4">⚠️ Error</div>
      <p className="text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
