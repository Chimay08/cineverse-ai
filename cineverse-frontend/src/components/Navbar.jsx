import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Search, Menu, Close } from "./icons";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/movies", label: "Movies" },
  { to: "/genres", label: "Genres" },
  { to: "/concierge", label: "✨ Concierge", premium: true },
  { to: "/world-cinema", label: "World Cinema" },
];

function Logo() {
  return (
    <Link to="/" className="group flex items-center">
      <span className="display text-xl tracking-wide text-white">
        Cine<span className="text-accent">Verse</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthed, user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6"
      >
        <nav
          className={`flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-3 py-2 pl-5 transition-all duration-500 ${
            scrolled
              ? "border border-white/10 bg-noir-900/55 backdrop-blur-md shadow-float"
              : "border border-white/10 bg-white/[0.02] backdrop-blur-sm shadow-glass"
          }`}
        >
          <Logo />

          {/* Center links */}
          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive ? "text-white" : "text-white/55 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative">{l.label}</span>
                  </>
                )}
              </NavLink>
            ))}
            <div className="relative ml-1 flex items-center">
              <button
                onClick={() => navigate("/explore")}
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white shrink-0"
              >
                <Search size={17} />
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/explore")}
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
            >
              <Search size={18} />
            </button>

            {isAuthed ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4 transition hover:border-white/25"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {(user?.username || user?.name || "C")[0].toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-white/85">
                    {(user?.username || user?.name || "Account").split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                  className="rounded-full px-3 py-2 text-xs font-medium text-white/45 transition hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link to="/signin" className="hidden md:inline-flex btn-accent px-6 py-2.5">
                Sign In
              </Link>
            )}

            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white md:hidden"
              aria-label="Menu"
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-noir-950/80 backdrop-blur-xl md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.05 }}
              className="mx-4 mt-24 rounded-3xl glass-strong p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-2xl px-4 py-3 text-lg font-medium ${
                        isActive ? "bg-white/10 text-white" : "text-white/60"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
              <div className="mt-5 h-px w-full bg-white/10" />
              {isAuthed ? (
                <div className="mt-5 flex flex-col gap-2">
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-ghost w-full">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                      navigate("/");
                    }}
                    className="rounded-full px-4 py-3 text-sm text-white/50"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link to="/signin" onClick={() => setOpen(false)} className="btn-accent mt-5 w-full">
                  Sign In
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
