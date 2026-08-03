import { useState } from "react";
import MovieCard from "../components/MovieCard";
import Reveal from "../components/Reveal";
import { getNowPlaying, getPopular, getTopRated, getTrending, getUpcoming } from "../lib/api";
import useAsync, { useScrollTop } from "../lib/useAsync";

const TABS = [
  { key: "trending", label: "Trending", fn: getTrending },
  { key: "popular", label: "Popular", fn: getPopular },
  { key: "top", label: "Top Rated", fn: getTopRated },
  { key: "now", label: "Now Playing", fn: getNowPlaying },
  { key: "soon", label: "Coming Soon", fn: getUpcoming },
];

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[2/3] w-full rounded-xl skeleton" />
          <div className="mt-3 h-3.5 w-3/4 rounded skeleton" />
        </div>
      ))}
    </div>
  );
}

export default function Movies() {
  useScrollTop("movies");
  const [tab, setTab] = useState("trending");
  const active = TABS.find((t) => t.key === tab);
  const { data, loading } = useAsync(active.fn, [tab]);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10 pt-32 sm:px-10">
      <Reveal>
        <span className="eyebrow text-accent/90">The Collection</span>
        <h1 className="display mt-3 text-5xl text-white sm:text-7xl">Movies</h1>
        <p className="mt-4 max-w-xl text-white/50">
          Explore the full CineVerse catalogue — curated, rated, and ready to discover.
        </p>
      </Reveal>

      {/* Tabs */}
      <div className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
              tab === t.key
                ? "bg-accent text-white shadow-accent-glow"
                : "border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {loading ? (
          <GridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {(data || []).map((m, i) => (
              <MovieCard key={m.id} movie={m} index={i} width="w-full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
