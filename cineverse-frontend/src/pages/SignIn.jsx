import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Google } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import { useScrollTop } from "../lib/useAsync";

// Animated cinematic city-lights backdrop (pure CSS/SVG — no asset weight).
function CityLights() {
  const dots = Array.from({ length: 26 });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-noir-900 via-noir-950 to-black" />
      <div className="absolute inset-0 bg-accent-glow opacity-30" />
      {/* skyline */}
      <div className="absolute bottom-0 left-0 right-0 flex h-2/3 items-end gap-1.5 px-2 opacity-60">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-black to-noir-700"
            style={{ height: `${20 + ((i * 37) % 70)}%` }}
          />
        ))}
      </div>
      {/* floating particles / lights */}
      {dots.map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${(i * 53) % 100}%`,
            top: `${(i * 29) % 90}%`,
            width: i % 4 === 0 ? 4 : 2,
            height: i % 4 === 0 ? 4 : 2,
            background: i % 3 === 0 ? "#F7D87F" : i % 3 === 1 ? "#D0311E" : "#fff",
            boxShadow: "0 0 8px currentColor",
          }}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -10, 0] }}
          transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: (i % 7) * 0.4 }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-noir-950/80 to-transparent" />
    </div>
  );
}

function EyeOpen({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosed({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.5 10.5 0 0 1 12 19c-6.5 0-10-7-10-7a18.6 18.6 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, autoComplete, trailing }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
        {label}
      </span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/30 transition focus:border-accent/50 focus:bg-white/[0.06] focus:outline-none ${trailing ? "pr-12" : ""}`}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-4">
            {trailing}
          </span>
        )}
      </div>
    </label>
  );
}

export default function SignIn() {
  useScrollTop("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn, isAuthed } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard.
  useEffect(() => {
    if (isAuthed) {
      navigate("/dashboard");
    }
  }, [isAuthed, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setBusy(true);
    try {
      await signIn({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Invalid email or password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — cinematic */}
      <div className="relative hidden lg:block">
        <CityLights />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/" className="display text-2xl text-white">
            Cine<span className="text-accent">Verse</span>
          </Link>
          <div>
            <h2 className="display max-w-md text-5xl leading-[0.95] text-white">
              Escape reality. <br /> Enter CineVerse.
            </h2>
            <p className="mt-5 max-w-sm text-white/55">
              Sign in to unlock recommendations tuned to your taste, a personal taste
              profile, and a watchlist that follows you everywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Right — glass auth card */}
      <div className="relative flex items-center justify-center px-6 py-24 sm:px-10">
        <div className="absolute inset-0 bg-noir-radial lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md rounded-3xl glass-strong p-8 shadow-float sm:p-10"
        >
          <div className="lg:hidden">
            <Link to="/" className="display text-xl text-white">
              Cine<span className="text-accent">Verse</span>
            </Link>
          </div>
          <h1 className="display mt-2 text-3xl text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Sign in to continue your cinematic journey.
          </p>

          <button
            type="button"
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-medium text-white/90 transition hover:bg-white/10 cursor-not-allowed opacity-60"
          >
            <Google size={18} /> Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-wider text-white/30">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <div>
              <Field
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-white/40 transition hover:text-white/80"
                  >
                    {showPassword ? <EyeOpen /> : <EyeClosed />}
                  </button>
                }
              />
              <button
                type="button"
                className="mt-2 text-xs text-white/40 transition hover:text-gold cursor-not-allowed"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm text-white/80">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-accent w-full py-3.5 disabled:opacity-60">
              {busy ? "Please wait…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/45">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-gold transition hover:text-gold-soft"
            >
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
