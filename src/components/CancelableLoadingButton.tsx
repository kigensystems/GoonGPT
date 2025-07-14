interface CancelableLoadingButtonProps {
  isLoading: boolean
  onCancel?: () => void
  onClick?: () => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CancelableLoadingButton({ 
  isLoading, 
  onCancel, 
  onClick,
  disabled,
  className = '',
  size = 'md'
}: CancelableLoadingButtonProps) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  }
  
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  const stopIconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }
  
  return (
    <button
      onClick={isLoading ? onCancel : onClick}
      disabled={disabled || (!isLoading && !onClick)}
      className={`relative flex items-center justify-center ${sizeClasses[size]} bg-accent disabled:bg-gray-600 disabled:opacity-50 rounded-full hover:bg-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl z-10 cursor-pointer pointer-events-auto ${className}`}
    >
      {isLoading ? (
        <>
          {/* Outer spinning ring */}
          <div className={`absolute inset-0 ${iconSizeClasses[size]} border-2 border-white/20 border-t-white rounded-full animate-spin`}></div>
          
          {/* Stop icon (square) in center */}
          <div className={`relative ${stopIconSizeClasses[size]} bg-white rounded-sm`}></div>
        </>
      ) : (
        <svg className={`${iconSizeClasses[size]} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
        </svg>
      )}
    </button>
  )
}