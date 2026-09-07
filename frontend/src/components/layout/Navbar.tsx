import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { Menu, X, Hexagon } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuth, user } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b-2 border-[#1a1a1a] bg-[#050505]/90 backdrop-blur-xl">
      <Link to={"/"} className="flex items-center gap-3 group">

        <div className="w-8 h-8 bg-[#00e5ff]/10 border-2 border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] transition-transform duration-300 group-hover:rotate-90">
          <Hexagon size={18} strokeWidth={2.5} />
        </div>
      
        <span
          className="font-bold text-lg tracking-wider uppercase text-white"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Nova<span className="text-[#00e5ff]">Forge</span>
        </span>
      </Link>


      <div className="hidden md:flex items-center gap-8 text-sm text-zinc-500 font-mono uppercase tracking-widest">
        <Link to={"/analyze"} className="hover:text-[#00e5ff] transition-colors">
          Analyze
        </Link>
        <Link to={"/jobmatcher"} className="hover:text-[#00e5ff] transition-colors">
          JobMatcher
        </Link>
        <Link
          to={"/resumebuilder"}
          className="hover:text-[#00e5ff] transition-colors"
        >
          Builder
        </Link>
        <Link
          to={"/interviewprep"}
          className="hover:text-[#00e5ff] transition-colors"
        >
          Interview
        </Link>
      </div>

    
      <div className="hidden md:flex items-center gap-4">
        {isAuth ? (
          <Link
            to={"/account"}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/user.png"
              alt=""
              className="w-8 h-8 object-cover border-2 border-[#333]"
            />
            <span className="text-sm font-mono text-zinc-300 uppercase">
              {user?.name?.split(" ")[0]}
            </span>
          </Link>
        ) : (
          <>
            <Link
              to={"/login"}
              className="text-sm font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              to={"/register"}
              className="btn-primary text-sm px-6 py-2.5 uppercase tracking-wider"
            >
              System.Init()
            </Link>
          </>
        )}
      </div>

   
      <button
        className="md:hidden text-zinc-400 hover:text-[#00e5ff] transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      
      {open && (
        <div className="absolute top-full inset-x-0 bg-[#050505] border-b-2 border-[#1a1a1a] flex flex-col gap-4 px-6 py-6 md:hidden font-mono uppercase tracking-widest text-sm">
          <Link to={"/analyze"} className="text-zinc-400 hover:text-[#00e5ff] transition-colors">
            Analyze
          </Link>
          <Link
            to={"/jobmatcher"}
            className="text-zinc-400 hover:text-[#00e5ff] transition-colors"
          >
            JobMatcher
          </Link>
          <Link
            to={"/resumebuilder"}
            className="text-zinc-400 hover:text-[#00e5ff] transition-colors"
          >
            Builder
          </Link>
          <Link
            to={"/interviewprep"}
            className="text-zinc-400 hover:text-[#00e5ff] transition-colors"
          >
            Interview
          </Link>

          {isAuth ? (
            <Link
              to={"/account"}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity mt-4 pt-4 border-t-2 border-dashed border-[#1a1a1a]"
            >
              <img
                src="/user.png"
                alt=""
                className="w-8 h-8 object-cover border-2 border-[#333]"
              />
              <span className="text-sm text-zinc-300">
                {user?.name?.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t-2 border-dashed border-[#1a1a1a]">
              <Link
                to={"/login"}
                className="text-center text-zinc-400 hover:text-white transition-colors py-2"
              >
                Sign in
              </Link>
              <Link
                to={"/register"}
                className="btn-primary text-center py-3"
              >
                System.Init()
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;