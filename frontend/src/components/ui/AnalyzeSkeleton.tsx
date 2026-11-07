// src/components/ui/AnalyzeSkeleton.tsx
export const AnalyzeSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full max-w-3xl mx-auto mt-6">
      {/* Top Main Card: Score Ring + Summary */}
      <div className="glass-card p-6 flex items-center gap-6 flex-wrap">
        {/* Ring Placeholder */}
        <div className="w-24 h-24 rounded-full bg-white/5 shrink-0" />

        {/* Summary Text Placeholder */}
        <div className="flex-1 min-w-[250px] flex flex-col gap-2.5">
          <div className="h-4 bg-white/10 rounded-md w-1/3" />
          <div className="h-3 bg-white/5 rounded-md w-full" />
          <div className="h-3 bg-white/5 rounded-md w-4/5" />
        </div>
      </div>

      {/* Score Breakdown Skeleton */}
      <div className="glass-card p-6 flex flex-col gap-5">
        <div className="h-3 bg-white/10 rounded-md w-1/4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-between">
              <div className="h-3 bg-white/8 rounded-md w-1/5" />
              <div className="h-3 bg-white/8 rounded-md w-12" />
            </div>
            <div className="h-1.5 bg-white/5 rounded-full w-full" />
          </div>
        ))}
      </div>

      {/* Strengths Skeleton */}
      <div className="glass-card p-6 flex flex-col gap-3">
        <div className="h-3 bg-white/10 rounded-md w-1/4 mb-1" />
        <div className="h-4 bg-white/5 rounded-md w-5/6" />
        <div className="h-4 bg-white/5 rounded-md w-4/6" />
      </div>

      {/* Actionable Suggestions Skeleton */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="h-3 bg-white/10 rounded-md w-1/3 mb-1" />
        {[1, 2].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-2">
            <div className="flex justify-between">
              <div className="h-3 bg-white/10 rounded-md w-1/4" />
              <div className="h-3 bg-white/10 rounded-md w-16" />
            </div>
            <div className="h-3 bg-white/5 rounded-md w-full" />
            <div className="h-3 bg-white/5 rounded-md w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};