"use client";

// Componente base para skeleton
function SkeletonBase({ className = "", ...props }) {
  return (
    <div 
      className={`skeleton-shimmer bg-[var(--card)] rounded ${className}`}
      {...props}
    />
  );
}

// Skeleton para service cards
export function ServiceCardSkeleton() {
  return (
    <div className="service-card glass rounded-2xl p-8 border-2 border-[var(--border)]">
      <div className="mb-6">
        <SkeletonBase className="size-16 rounded-2xl" />
      </div>
      
      <SkeletonBase className="h-6 w-3/4 mb-3 rounded-lg" />
      
      <div className="space-y-2 mb-6">
        <SkeletonBase className="h-4 w-full rounded" />
        <SkeletonBase className="h-4 w-full rounded" />
        <SkeletonBase className="h-4 w-2/3 rounded" />
      </div>
      
      <SkeletonBase className="h-5 w-24 rounded" />
    </div>
  );
}

// Skeleton para news cards
export function NewsCardSkeleton() {
  return (
    <article className="news-card glass rounded-2xl overflow-hidden">
      <SkeletonBase className="h-2 w-full" />
      
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBase className="size-2 rounded-full" />
          <SkeletonBase className="h-4 w-32 rounded" />
        </div>
        
        <SkeletonBase className="h-6 w-4/5 mb-3 rounded-lg" />
        
        <div className="space-y-2 mb-6">
          <SkeletonBase className="h-4 w-full rounded" />
          <SkeletonBase className="h-4 w-full rounded" />
          <SkeletonBase className="h-4 w-3/4 rounded" />
        </div>
        
        <SkeletonBase className="h-5 w-40 rounded" />
      </div>
    </article>
  );
}

// Skeleton para KPI cards
export function KpiCardSkeleton() {
  return (
    <div className="kpi-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <SkeletonBase className="size-3 rounded-full" />
        <SkeletonBase className="h-4 w-20 rounded" />
      </div>
      <SkeletonBase className="h-8 w-16 rounded-lg" />
    </div>
  );
}

// Skeleton para dropdown menu
export function DropdownSkeleton() {
  return (
    <div className="py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-4 py-3">
          <SkeletonBase className="h-5 w-32 mb-1 rounded" />
          <SkeletonBase className="h-3 w-48 rounded" />
        </div>
      ))}
    </div>
  );
}

// Loading state para busca
export function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 border border-[var(--border)] rounded-xl">
          <SkeletonBase className="h-5 w-3/4 mb-2 rounded" />
          <SkeletonBase className="h-4 w-full mb-1 rounded" />
          <SkeletonBase className="h-4 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}

// Loading state genérico para textos
export function TextSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBase 
          key={i} 
          className={`h-4 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}

// Loading state para botões
export function ButtonSkeleton({ className = "" }) {
  return (
    <SkeletonBase className={`h-12 w-32 rounded-xl ${className}`} />
  );
}

// Loading state para imagens
export function ImageSkeleton({ className = "" }) {
  return (
    <SkeletonBase className={`w-full aspect-video rounded-lg ${className}`} />
  );
}

// Container com múltiplos skeletons
export function SkeletonGrid({ 
  type = "service", 
  count = 4, 
  className = "" 
}) {
  const SkeletonComponent = {
    service: ServiceCardSkeleton,
    news: NewsCardSkeleton,
    kpi: KpiCardSkeleton
  }[type] || ServiceCardSkeleton;

  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}