
export const InterviewSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse w-full max-w-3xl mx-auto mt-6">
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-2 w-1/2">
          <div className="h-4 bg-white/10 rounded-md w-3/4" />
          <div className="h-3 bg-white/5 rounded-md w-1/2" />
        </div>
        <div className="w-28 h-8 bg-white/10 rounded-xl" />
      </div>

      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass-card p-5 flex items-center justify-between gap-4">
          <div className="flex gap-3 items-center w-full">
            <div className="w-6 h-6 rounded-full bg-white/10 shrink-0" />
            <div className="flex flex-col gap-2 w-4/5">
              <div className="h-3.5 bg-white/10 rounded-md w-full" />
              <div className="h-2.5 bg-white/5 rounded-md w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};