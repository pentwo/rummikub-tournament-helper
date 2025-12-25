interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  light?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
};

export function LoadingSpinner({ size = 'md', text, light = false }: LoadingSpinnerProps) {
  const borderColor = light ? 'border-white/30' : 'border-gray-300';
  const spinColor = light ? 'border-t-white' : 'border-t-blue-500';

  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`
          ${sizeClasses[size]}
          ${borderColor}
          ${spinColor}
          rounded-full
          animate-spin
        `}
      />
      {text && (
        <span className={`text-sm ${light ? 'text-white/80' : 'text-gray-600'}`}>
          {text}
        </span>
      )}
    </div>
  );
}
