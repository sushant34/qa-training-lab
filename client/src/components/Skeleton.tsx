import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const baseClass = 'skeleton';

  const variantClasses: Record<string, string> = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : variant === 'rectangular' ? '200px' : undefined),
  };

  if (count > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} ${variantClasses[variant]}`}
            style={{ ...style, width: i === count - 1 ? '60%' : style.width }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="card p-0 overflow-hidden">
    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" variant="text" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
      >
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" variant="text" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" variant="text" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" variant="text" />
              <Skeleton className="h-8 w-16" variant="text" />
            </div>
            <Skeleton className="h-12 w-12" variant="circular" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <Skeleton className="h-6 w-40 mb-4" variant="text" />
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-3/4 mt-2" variant="text" />
        <Skeleton className="h-2.5 w-full mt-4" variant="rectangular" />
      </div>
      <div className="card">
        <Skeleton className="h-6 w-40 mb-4" variant="text" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8" variant="circular" />
              <Skeleton className="h-4 flex-1" variant="text" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-1.5">
        <Skeleton className="h-4 w-24" variant="text" />
        <Skeleton className="h-10 w-full" variant="rectangular" />
      </div>
    ))}
    <div className="flex gap-3 pt-2">
      <Skeleton className="h-10 w-24" variant="rectangular" />
      <Skeleton className="h-10 w-20" variant="rectangular" />
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-0 overflow-hidden">
        <Skeleton className="h-48 w-full" variant="rectangular" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" variant="text" />
          <Skeleton className="h-4 w-1/2" variant="text" />
          <Skeleton className="h-8 w-full mt-3" variant="rectangular" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
