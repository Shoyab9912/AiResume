import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="bg-page flex items-center justify-center px-6">
      <div className="glass-card max-w-3xl w-full p-8 md:p-12 animate-slide-up">
        <div className="flex flex-col gap-6">
          <span className="feature-pill w-fit">ERROR 404</span>

          <h1 className="text-5xl md:text-7xl font-bold text-gradient">
            PAGE NOT FOUND
          </h1>

          <div className="divider-subtle" />

          <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
            The route you're looking for doesn't exist, was removed,
            or you followed a broken link.
          </p>

          <div className="font-mono text-xs text-zinc-500 border-2 border-[#1a1a1a] bg-[#050505] p-4">
            <p>&gt; STATUS: 404_NOT_FOUND</p>
            <p>&gt; PATH: INVALID_ROUTE</p>
            <p>&gt; ACTION: RETURN_HOME</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/"
              className="btn-primary px-6 py-3 uppercase tracking-wider"
            >
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-[#1a1a1a] text-white font-bold hover:border-[#00e5ff] hover:text-[#00e5ff] transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}