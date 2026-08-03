import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Google } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import { useScrollTop } from "../lib/useAsync";

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

function Field({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/30 transition focus:border-accent/50 focus:bg-white/[0.06] focus:outline-none"
      />
    </label>
  );
}

export default function Register() {
  useScrollTop("register");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await signUp({ username, email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
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
              Create an account to unlock recommendations tuned to your taste, a personal taste
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
            Create account
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Join CineVerse and shape your taste profile.
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
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              autoComplete="username"
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <Field
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            {error && (
              <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm text-white/80">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-accent w-full py-3.5 disabled:opacity-60">
              {busy ? "Please wait…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/45">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-gold transition hover:text-gold-soft"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
