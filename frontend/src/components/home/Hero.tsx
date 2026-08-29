import { ArrowRight, ChevronRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Hero() {
  const { isAuth } = useAuth();

  return (
    <section className="relative pt-36 pb-28 px-6 flex flex-col items-center text-center overflow-hidden">
      <div
        className="orb w-[38rem] h-[38rem] bg-indigo-600 -top-40 left-1/2 -translate-x-1/2"
        style={{ opacity: 0.12 }}
      />
      <div
        className="orb w-80 h-80 bg-emerald-500 bottom-0 right-10"
        style={{ opacity: 0.1 }}
      />

      <div className="inline-flex items-center gap-2 feature-pill mb-6 animate-fade-in">
        <Zap size={11} className="text-emerald-400" />
        <span>AI-Powered Career Platform</span>
      </div>

      <h1
        className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight max-w-4xl mb-6 animate-slide-up"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        Land Your Dream Job
        <br />
        <span className="text-gradient">Faster with AI</span>
      </h1>
      
      <p
        className="text-white/45 text-lg md:text-xl max-w-xl leading-relaxed mb-10 animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        Analyse your resume, get an ATS score, discover the right jobs, build a
        stunning resume, and ace every interview - all in one place.
      </p>

      <div
        className="flex flex-col sm:flex-row items-center gap-3 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <Link
          to={isAuth ? "/jobmatcher" : "/login"}
          className="btn-primary px-7 py-3.5 rounded-xl text-base font-semibold flex items-center gap-2"
        >
          {isAuth ? (
            <>
              Find Best Job <ArrowRight size={16} />
            </>
          ) : (
            <>
              Start for free <ArrowRight size={16} />
            </>
          )}
        </Link>
        
        <a
          href="#features"
          className="text-sm text-white/45 hover:text-white transition-colors flex items-center gap-1.5 px-4 py-3"
        >
          See how it works <ChevronRight size={14} />
        </a>
      </div>

      <p className="text-white/25 text-xs mt-6">
        First 3 analyses free • No credit card required
      </p>

      <div
        className="mt-16 glass-card px-8 py-5 flex items-center gap-6 animate-slide-up shadow-2xl"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="flex flex-col items-center">
          <span
            className="text-4xl font-black text-gradient flex flex-col"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            87
            <span className="text-[10px] text-white/35 uppercase tracking-widest font-sans">
              ATS Score
            </span>
          </span>
        </div>
        <div className="h-10 w-px bg-white/10" />
        <div className="flex flex-col gap-1 text-left">
          <span className="text-xs text-emerald-400 font-medium">
            ✓ Strong keywords detected
          </span>
          <span className="text-xs text-yellow-400 font-medium">
            ⚠️ Missing: quantified impact
          </span>
          <span className="text-xs text-white/40 font-medium">
            3 job matches found
          </span>
        </div>
      </div>
    </section>
  );
}

export default Hero;