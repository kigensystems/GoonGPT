import { ErrorBoundary } from './ErrorBoundary';
import { type ReactNode } from 'react';

interface AIErrorBoundaryProps {
  children: ReactNode;
  mode?: 'chat' | 'image' | 'video' | 'deepfake';
}

export function AIErrorBoundary({ children, mode = 'chat' }: AIErrorBoundaryProps) {
  const getModeSpecificMessage = () => {
    switch (mode) {
      case 'image':
        return 'There was an issue with image generation. Please try with a different prompt.';
      case 'video':
        return 'Video generation encountered an error. Please check your image and try again.';
      case 'deepfake':
        return 'Face swap failed. Please ensure both images are clear and try again.';
      default:
        return 'The chat encountered an error. Please try rephrasing your message.';
    }
  };

  const fallback = (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-sm w-full bg-bg-secondary rounded-lg border border-border p-6 text-center">
        <div className="mb-4">
          <svg 
            className="mx-auto h-8 w-8 text-yellow-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <h3 className="text-md font-medium text-text-primary mb-2">
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Error
        </h3>
        
        <p className="text-sm text-text-secondary mb-4">
          {getModeSpecificMessage()}
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-accent text-white text-sm rounded-md hover:bg-accent/90 transition-colors"
        >
          Refresh & Try Again
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}