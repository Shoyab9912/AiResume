
export const JobMatchSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse w-full max-w-3xl mx-auto mt-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-6 flex flex-col gap-4 border border-white/5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex flex-col gap-2 w-2/3">
              <div className="h-5 bg-white/10 rounded-md w-3/4" />
              <div className="h-3 bg-white/5 rounded-md w-1/2" />
            </div>
            <div className="w-12 h-8 bg-white/10 rounded-lg shrink-0" />
          </div>

          <div className="divider-subtle" />


          <div className="flex flex-col gap-2">
            <div className="h-3 bg-white/10 rounded-md w-1/4" />
            <div className="h-3 bg-white/5 rounded-md w-full" />
            <div className="h-3 bg-white/5 rounded-md w-4/5" />
          </div>


          <div className="bg-white/4 rounded-xl p-3 mt-1 flex gap-2 items-center">
            <div className="w-4 h-4 rounded-full bg-white/10 shrink-0" />
            <div className="h-3 bg-white/5 rounded-md w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};