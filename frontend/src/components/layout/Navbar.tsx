
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { Menu, X, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {menuVariants} from "../../utils/animations"

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuth, user } = useAuth();

  const navRef = useRef<HTMLElement>(null);
useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  
  const navLinks = [
    { to: "/analyze", label: "Analyze" },
    { to: "/jobmatcher", label: "JobMatcher" },
    { to: "/resumebuilder", label: "Builder" },
    { to: "/interviewprep", label: "Interview" },
  ];

  return (
    <nav
      ref={navRef}
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b-2 border-[#1a1a1a] bg-[#050505]/90 backdrop-blur-xl"
    >
      {/* Logo */}
      <Link
        to="/"
        onClick={closeMenu}
        className="flex items-center gap-3 group"
      >
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

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-8 text-sm text-zinc-500 font-mono uppercase tracking-widest">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="hover:text-[#00e5ff] transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Desktop authentication */}
      <div className="hidden md:flex items-center gap-4">
        {isAuth ? (
          <Link
            to="/account"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/user.png"
              alt="User profile"
              className="w-8 h-8 object-cover border-2 border-[#333]"
            />
            <span className="text-sm font-mono text-zinc-300 uppercase">
              {user?.name?.split(" ")[0]}
            </span>
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="btn-primary text-sm px-6 py-2.5 uppercase tracking-wider"
            >
              Sign up
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="md:hidden text-zinc-400 hover:text-[#00e5ff] transition-colors cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Animated mobile navigation */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full inset-x-0 bg-[#050505] border-b-2 border-[#1a1a1a] flex flex-col gap-4 px-6 py-6 md:hidden font-mono uppercase tracking-widest text-sm"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className="text-zinc-400 hover:text-[#00e5ff] transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isAuth ? (
              <Link
                to="/account"
                onClick={closeMenu}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity mt-4 pt-4 border-t-2 border-dashed border-[#1a1a1a]"
              >
                <img
                  src="/user.png"
                  alt="User profile"
                  className="w-8 h-8 object-cover border-2 border-[#333]"
                />

                <span className="text-sm text-zinc-300">
                  {user?.name?.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t-2 border-dashed border-[#1a1a1a]">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-center text-zinc-400 hover:text-white transition-colors py-2"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="btn-primary text-center py-3"
                >
                  Sign up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
