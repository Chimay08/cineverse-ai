import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import Reveal from "../components/Reveal";
import { Search } from "../components/icons";
import { searchMovies, getTrending } from "../lib/api";
import { GENRES } from "../lib/mockData";
import { useScrollTop } from "../lib/useAsync";

const SUGGESTIONS = ["Interstellar", "Dune", "Nolan", "Blade Runner", "Horror", "Oppenheimer"];

export default function Explore() {
  useScrollTop("explore");
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    getTrending().then(setTrending);
    inputRef.current?.focus();
  }, []);

  // Sync state with URL parameter (from Navbar search)
  useEffect(() => {
    const q = searchParams.get("query") || "";
    if (q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Sync URL parameter with local state
  useEffect(() => {
    const activeQuery = query.trim();
    if (activeQuery) {
      setSearchParams({ query: activeQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [query, setSearchParams]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(() => {
      searchMovies(query).then((r) => {
        setResults(r);
        setLoading(false);
      });
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  const showResults = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10 pt-32 sm:px-10">
      <Reveal>
        <span className="eyebrow text-accent/90">Search the universe</span>
        <h1 className="display mt-3 text-5xl text-white sm:text-7xl">Explore</h1>
      </Reveal>

      {/* Search bar */}
      <Reveal delay={0.1} className="mt-8">
        <div className="flex items-center gap-3 rounded-2xl glass-strong px-5 py-4 focus-within:border-accent/40">
          <Search className="text-white/40" size={22} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search films, directors, moods…"
            className="w-full bg-transparent text-lg text-white placeholder:text-white/30 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-sm text-white/40 transition hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/55 transition hover:border-white/25 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Results / discovery */}
      <div className="mt-12">
        {showResults ? (
          <>
            <h2 className="mb-7 text-sm font-medium text-white/45">
              {loading
                ? "Searching…"
                : `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`}
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] w-full rounded-xl skeleton" />
                ))}
              </div>
            ) : results.length ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.map((m, i) => (
                  <MovieCard key={m.id} movie={m} index={i} width="w-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/[0.07] bg-noir-850/50 py-20 text-center">
                <p className="text-white/50">No films found. Try another title or mood.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="display mb-6 text-2xl text-white">Jump into a genre</h2>
              <div className="flex flex-wrap gap-3">
                {GENRES.map((g) => (
                  <Link
                    key={g.slug}
                    to={`/genres/${g.slug}`}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 font-medium text-white/70 transition hover:border-white/25 hover:text-white"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
            <h2 className="display mb-6 text-2xl text-white">Trending right now</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {trending.slice(0, 15).map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} width="w-full" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
