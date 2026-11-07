
import { Sparkles } from "lucide-react";

const SkeletonLine = ({
  width = "w-full",
}: {
  width?: string;
}) => (
  <div className={`h-3 bg-white/5 rounded-md ${width}`} />
);

const SkeletonSection = ({
  lines = 3,
}: {
  lines?: number;
}) => (
  <div className="space-y-3">
    <div className="h-4 bg-white/10 rounded-md w-1/4" />

    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine
          key={index}
          width={index === lines - 1 ? "w-4/5" : "w-full"}
        />
      ))}
    </div>
  </div>
);

export const ResumeSkeleton = () => {
  return (
    <div className="glass-card p-6 md:p-8 mt-4 animate-pulse">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-3 border-b border-white/10 pb-5">
          <div className="h-7 bg-white/10 rounded-md w-2/5" />

          <SkeletonLine width="w-3/5" />

          <div className="flex flex-wrap gap-3">
            <SkeletonLine width="w-24" />
            <SkeletonLine width="w-28" />
            <SkeletonLine width="w-32" />
          </div>
        </div>

        {/* Summary */}
        <SkeletonSection lines={3} />

        {/* Technical Skills */}
        <SkeletonSection lines={2} />

        {/* Experience */}
        <div className="space-y-4">
          <div className="h-4 bg-white/10 rounded-md w-1/4" />

          {[1, 2].map((item) => (
            <div key={item} className="space-y-3">
              <div className="h-3 bg-white/10 rounded-md w-2/5" />
              <SkeletonLine width="w-1/3" />

              <div className="space-y-2 pl-4">
                <SkeletonLine />
                <SkeletonLine width="w-11/12" />
                <SkeletonLine width="w-4/5" />
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="space-y-4">
          <div className="h-4 bg-white/10 rounded-md w-1/4" />

          {[1, 2].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-3 bg-white/10 rounded-md w-2/5" />
              <SkeletonLine />
              <SkeletonLine width="w-5/6" />
            </div>
          ))}
        </div>

        {/* Education */}
        <SkeletonSection lines={2} />

      </div>

      {/* Loading Message */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <Sparkles size={15} className="text-indigo-400" />
        <p className="text-xs text-white/60 font-medium">
          AI is crafting your ATS-optimized resume...
        </p>
      </div>
    </div>
  );
};
